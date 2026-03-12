-- Create a table for logging manual refills
create table if not exists public.refills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  water_source_id text, -- Optional: link to a specific fountain
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.refills enable row level security;

-- Policies
create policy "Users can view their own refills"
  on public.refills for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own refills"
  on public.refills for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own refills"
  on public.refills for delete
  to authenticated
  using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_refills_user_id on public.refills(user_id);
create index if not exists idx_refills_created_at on public.refills(created_at desc);
