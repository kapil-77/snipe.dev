-- ============================================================
-- snipe.dev · PUBLIC schema — the only shared namespace.
--
-- Convention (strict per-module isolation):
--   * module schemas never coexist in the same table namespace
--   * everything here is opt-in shared infrastructure:
--       auth-adjacent profiles, orgs, org membership, waitlist
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------
-- public.users — 1:1 profile for auth.users (kept in sync via trigger)
-- ------------------------------------------------------------------
create table if not exists public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.users enable row level security;

drop policy if exists "users read own profile" on public.users;
create policy "users read own profile"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "users update own profile" on public.users;
create policy "users update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ------------------------------------------------------------------
-- public.orgs — table first. Its RLS policies are created BELOW, after
-- public.org_members exists (the SELECT policy queries that table).
-- ------------------------------------------------------------------
create table if not exists public.orgs
(
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_by  uuid references public.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.orgs enable row level security;

-- ----------------------------------------------------------------
-- public.org_members — the single source of truth behind every
-- module's org-scoped RLS predicate for selection.
-- ----------------------------------------------------------------
create table if not exists public.org_members
(
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.orgs (id) on delete cascade,
  user_id    uuid not null references public.users (id) on delete cascade,
  role       text not null default 'member'
             check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

alter table public.org_members enable row level security;
drop policy if exists "members see their own memberships" on public.org_members;

create policy "members see their own memberships"
  on public.org_members for select
  using (auth.uid() = user_id);
drop policy if exists "owners and admins invite members" on public.org_members;

create policy "owners and admins invite members"
  on public.org_members for insert
  to authenticated
  with check (
    exists (
      select 1 from public.org_members admin
      where admin.org_id = org_id
        and admin.user_id = auth.uid()
        and admin.role in ('owner', 'admin')
    )
  );
drop policy if exists "owners and admins remove members" on public.org_members;

create policy "owners and admins remove members"
  on public.org_members for delete
  using (
    exists (
      select 1 from public.org_members admin
      where admin.org_id = org_id
        and admin.user_id = auth.uid()
        and admin.role in ('owner', 'admin')
    )
  );

-- ------------------------------------------------------------------
-- public.orgs policies — created now that org_members exists.
-- ------------------------------------------------------------------
drop policy if exists "orgs readable by their members" on public.orgs;
create policy "orgs readable by their members"
  on public.orgs for select
  using
  (
    exists (
      select 1 from public.org_members om
      where om.org_id = orgs.id and om.user_id = auth.uid()
    )
  );

drop policy if exists "any signed-in user may create an org" on public.orgs;
create policy "any signed-in user may create an org"
  on public.orgs for insert
  with check (auth.uid() is not null);
-- ----------------------------------------------------------------
-- public.waitlist — shared interest list for coming-soon modules.
-- Anonymous inserts only; reads restricted to signed-in users.
-- ----------------------------------------------------------------
create table if not exists public.waitlist
(
  id          bigint generated always as identity primary key,
  email       text not null,
  module_slug text,
  source      text not null default 'landing',
  created_at  timestamptz not null default now(),
  unique (email, module_slug)
);

alter table public.waitlist enable row level security;

drop policy if exists "anyone may join the waitlist" on public.waitlist;
create policy "anyone may join the waitlist"
  on public.waitlist for insert
  to anon, authenticated
  with check (true);

drop policy if exists "waitlist readable by signed-in users" on public.waitlist;
create policy "waitlist readable by signed-in users"
  on public.waitlist for select
  to authenticated
  using (true);

-- ----------------------------------------------------------------
-- Sync auth.users → public.users
-- ----------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'user_name'
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email      = excluded.email,
        full_name  = excluded.full_name,
        avatar_url = excluded.avatar_url;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();