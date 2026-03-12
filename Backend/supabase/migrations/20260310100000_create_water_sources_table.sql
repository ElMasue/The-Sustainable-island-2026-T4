-- Create water_sources table if it doesn't exist
create table if not exists public.water_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  description text,
  rating numeric(2, 1) check (rating >= 0 and rating <= 5),
  is_operational boolean default true,
  is_free boolean default true,
  category text,
  images text[], -- Array of image URLs
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete set null
);

-- Enable Row Level Security
alter table public.water_sources enable row level security;

-- Allow everyone to read water sources
create policy "Water sources are publicly readable"
  on public.water_sources for select
  to public
  using (true);

-- Allow authenticated users to insert water sources
create policy "Authenticated users can insert water sources"
  on public.water_sources for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Allow users to update their own water sources
create policy "Users can update their own water sources"
  on public.water_sources for update
  to authenticated
  using (auth.uid() = user_id);

-- Allow users to delete their own water sources
create policy "Users can delete their own water sources"
  on public.water_sources for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create index for location-based queries
create index if not exists water_sources_location_idx 
  on public.water_sources (latitude, longitude);

-- Create index for user queries
create index if not exists water_sources_user_id_idx 
  on public.water_sources (user_id);
