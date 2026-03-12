-- Create a function to update the fountain rating based on water quality ratings
create or replace function update_fountain_rating()
returns trigger as $$
declare
  avg_rating numeric;
  fountain_uuid uuid;
begin
  -- Determine the fountain_id to update
  -- NEW is used for INSERT/UPDATE, OLD for DELETE
  if TG_OP = 'DELETE' then
    -- Try to cast fountain_id to UUID (only for water_sources table)
    begin
      fountain_uuid := OLD.fountain_id::uuid;
    exception when others then
      -- If cast fails, it's an OSM fountain (negative integer), skip
      return OLD;
    end;
  else
    begin
      fountain_uuid := NEW.fountain_id::uuid;
    exception when others then
      return NEW;
    end;
  end if;

  -- Calculate the average rating for this fountain
  select round(avg(quality_rating)::numeric, 1)
  into avg_rating
  from public.water_quality_ratings
  where fountain_id = fountain_uuid::text;

  -- Update the water_sources rating
  -- If no ratings exist, set rating to NULL
  update public.water_sources
  set rating = coalesce(avg_rating, null),
      updated_at = now()
  where id = fountain_uuid;

  -- Return the appropriate row
  if TG_OP = 'DELETE' then
    return OLD;
  else
    return NEW;
  end if;
end;
$$ language plpgsql security definer;

-- Create trigger for INSERT
create trigger trigger_update_fountain_rating_on_insert
  after insert on public.water_quality_ratings
  for each row
  execute function update_fountain_rating();

-- Create trigger for UPDATE
create trigger trigger_update_fountain_rating_on_update
  after update on public.water_quality_ratings
  for each row
  when (OLD.quality_rating is distinct from NEW.quality_rating)
  execute function update_fountain_rating();

-- Create trigger for DELETE
create trigger trigger_update_fountain_rating_on_delete
  after delete on public.water_quality_ratings
  for each row
  execute function update_fountain_rating();

-- Update existing water sources ratings based on current quality ratings
-- This will initialize the ratings for any fountains that already have quality ratings
do $$
declare
  fountain_rec record;
  avg_rating numeric;
  fountain_uuid uuid;
begin
  -- Get all unique fountain IDs from quality ratings
  for fountain_rec in
    select distinct fountain_id
    from public.water_quality_ratings
  loop
    -- Try to cast to UUID (only for custom fountains in water_sources)
    begin
      fountain_uuid := fountain_rec.fountain_id::uuid;
      
      -- Calculate average rating
      select round(avg(quality_rating)::numeric, 1)
      into avg_rating
      from public.water_quality_ratings
      where fountain_id = fountain_rec.fountain_id;
      
      -- Update the fountain
      update public.water_sources
      set rating = avg_rating,
          updated_at = now()
      where id = fountain_uuid;
      
    exception when others then
      -- Skip non-UUID fountain IDs (OSM fountains)
      continue;
    end;
  end loop;
end $$;
