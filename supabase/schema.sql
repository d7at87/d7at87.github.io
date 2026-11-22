-- ============================================================
--  AŞHUR — Supabase setup
--  Run once: Supabase dashboard → SQL Editor → New query → Run
--  Safe to run again (idempotent).
-- ============================================================

-- 1) Site document (a single row: id = 'main')
create table if not exists public.site_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_state enable row level security;

grant select on public.site_state to anon, authenticated;
grant insert, update on public.site_state to authenticated;

drop policy if exists site_state_public_read on public.site_state;
create policy site_state_public_read
  on public.site_state for select
  to anon, authenticated
  using (true);

-- 2) Admins — managed from SQL only, never from the API
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  note text
);

alter table public.admins enable row level security;
-- No policies on purpose: the table is unreachable through the REST API.

-- Helper used by the policies below (runs as owner, bypasses RLS).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists site_state_admin_write on public.site_state;
create policy site_state_admin_write
  on public.site_state for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3) Media bucket: public read, admin write
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists media_public_read on storage.objects;
create policy media_public_read
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists media_admin_insert on storage.objects;
create policy media_admin_insert
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists media_admin_update on storage.objects;
create policy media_admin_update
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists media_admin_delete on storage.objects;
create policy media_admin_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- ============================================================
--  4) Register the admin account
--
--  First create the user in: Authentication → Users → Add user
--  (email + password, tick "Auto Confirm User"), and turn OFF
--  "Allow new users to sign up" in Authentication → Providers → Email.
--
--  Then run this, replacing the email:
--
--  insert into public.admins (user_id, note)
--  select id, 'owner' from auth.users where email = 'you@example.com'
--  on conflict (user_id) do nothing;
-- ============================================================
