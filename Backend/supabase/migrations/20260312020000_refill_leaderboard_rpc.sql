-- Leaderboard: top users by refill count
-- SECURITY DEFINER allows authenticated users to read aggregated data from tables they might not have direct access to.
create or replace function public.get_refill_leaderboard(limit_count int default 10)
returns table (
  user_id uuid,
  refill_count bigint,
  display_name text,
  avatar_url text
)
language sql
security definer
set search_path = public, auth
as $$
  select
    r.user_id,
    count(*)::bigint as refill_count,
    coalesce(
      nullif(trim(u_profile.full_name), ''),
      split_part(u_auth.email, '@', 1)
    ) as display_name,
    u_profile.avatar_url
  from public.refills r
  left join public.users u_profile on u_profile.id::text = r.user_id::text
  left join auth.users u_auth on u_auth.id = r.user_id
  group by r.user_id, u_profile.full_name, u_profile.avatar_url, u_auth.email
  order by refill_count desc
  limit greatest(least(coalesce(limit_count, 10), 50), 1);
$$;

grant execute on function public.get_refill_leaderboard(int) to authenticated;
grant execute on function public.get_refill_leaderboard(int) to anon;
