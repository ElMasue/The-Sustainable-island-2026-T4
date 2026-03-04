-- migrate existing RLS policy so that inserts are properly checked
-- the previous "Self mutate" policy used a USING clause for both insert and update,
-- but PostgreSQL evaluates the WITH CHECK expression on new rows for inserts.  because
-- it was missing, anonymous/unauthenticated requests were being denied when the client
-- attempted to upsert a profile.

-- drop the old combined policy and recreate separate policies with explicit WITH CHECK

drop policy if exists "Self mutate" on public.users;

drop policy if exists "Self select" on public.users;

-- allow an authenticated user to INSERT their own row
create policy "Self insert" on public.users
  for insert with check (auth.uid()::text = id::text);

-- allow the same user to UPDATE their row (both filtering and post‑update check)
create policy "Self update" on public.users
  for update using (auth.uid()::text = id::text) with check (auth.uid()::text = id::text);

-- keep the select policy unchanged
create policy "Self select" on public.users
  for select using (auth.uid()::text = id::text);
