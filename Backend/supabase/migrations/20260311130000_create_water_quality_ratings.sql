-- Create a table for users to rate water quality at fountains
create table if not exists public.water_quality_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fountain_id text not null, -- TEXT because we support both OSM (negative integers) and custom (UUIDs) fountains
  
  -- Quality rating: 1=bad, 2=poor, 3=ok, 4=good, 5=excellent
  quality_rating smallint not null check (quality_rating >= 1 and quality_rating <= 5),
  
  -- Cached fountain details for quick queries
  fountain_name text,
  fountain_lat numeric(10, 7),
  fountain_lon numeric(10, 7),
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- One rating per user per fountain (users can update their rating)
  unique (user_id, fountain_id)
);

-- Enable RLS
alter table public.water_quality_ratings enable row level security;

-- Policies: anyone can read ratings (for calculating averages)
create policy "Water quality ratings are publicly readable"
  on public.water_quality_ratings for select
  to public
  using (true);

-- Users can insert their own ratings
create policy "Authenticated users can insert their own ratings"
  on public.water_quality_ratings for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update their own ratings
create policy "Users can update their own ratings"
  on public.water_quality_ratings for update
  to authenticated
  using (auth.uid() = user_id);

-- Users can delete their own ratings
create policy "Users can delete their own ratings"
  on public.water_quality_ratings for delete
  to authenticated
  using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_water_quality_ratings_fountain_id 
  on public.water_quality_ratings (fountain_id);

create index if not exists idx_water_quality_ratings_user_id 
  on public.water_quality_ratings (user_id);

-- Function to automatically update the updated_at timestamp
create or replace function update_water_quality_ratings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger water_quality_ratings_updated_at
  before update on public.water_quality_ratings
  for each row
  execute function update_water_quality_ratings_updated_at();
