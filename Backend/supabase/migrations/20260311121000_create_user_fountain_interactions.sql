-- Create a table for users to save and favorite fountains
create table if not exists public.user_fountain_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fountain_id text not null, -- TEXT because OSM fountains use negative integer IDs, while Supabase uses UUIDs
  interaction_type text not null check (interaction_type in ('favorite', 'save')),
  
  -- Cached details to avoid having to fetch OSM metadata every time
  fountain_name text,
  fountain_lat numeric(10, 7),
  fountain_lon numeric(10, 7),
  
  created_at timestamptz default now(),
  
  -- Prevent exact duplicates:
  unique (user_id, fountain_id, interaction_type)
);

-- Enable RLS
alter table public.user_fountain_interactions enable row level security;

-- Policies
create policy "Users can view their own interactions"
  on public.user_fountain_interactions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own interactions"
  on public.user_fountain_interactions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own interactions"
  on public.user_fountain_interactions for delete
  to authenticated
  using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_user_interactions_uid on public.user_fountain_interactions (user_id, interaction_type);
