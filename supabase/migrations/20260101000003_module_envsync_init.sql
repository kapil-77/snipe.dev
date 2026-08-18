-- ============================================================
-- module_envsync — environment variable sync
--
-- Owned EXCLUSIVELY by the Envsync module. Values are stored with
-- the expectation of encrypt-at-rest in production (see README).
-- RLS ships enabled; cross-schema edges only to public.users/orgs.
-- ============================================================

create schema if not exists module_envsync;

grant usage on schema module_envsync to anon, authenticated, service_role;
alter default privileges in schema module_envsync
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema module_envsync
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema module_envsync
  grant all on routines to anon, authenticated, service_role;

-- ------------------------------------------------------------------
-- tables
-- ------------------------------------------------------------------
create table if not exists module_envsync.environment_vars
(
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references public.orgs (id) on delete cascade,
  name           text not null,
  value          text,
  environment    text not null default 'development'
                 check (environment in ('development', 'staging', 'production')),
  last_synced_at timestamptz,
  created_by     uuid references public.users (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (org_id, name, environment)
);

-- ------------------------------------------------------------------
-- RLS — enabled from day one, org-scoped.
-- ------------------------------------------------------------------
alter table module_envsync.environment_vars enable row level security;

create or replace function module_envsync.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = target_org and m.user_id = auth.uid()
  );
$$;
drop policy if exists "envsync vars select within org" on module_envsync.environment_vars;

create policy "envsync vars select within org"
  on module_envsync.environment_vars for select
  using (module_envsync.is_org_member(org_id));
drop policy if exists "envsync vars insert within org" on module_envsync.environment_vars;

create policy "envsync vars insert within org"
  on module_envsync.environment_vars for insert
  to authenticated
  with check (module_envsync.is_org_member(org_id));
drop policy if exists "envsync vars update within org" on module_envsync.environment_vars;

create policy "envsync vars update within org"
  on module_envsync.environment_vars for update
  using (module_envsync.is_org_member(org_id))
  with check (module_envsync.is_org_member(org_id));
drop policy if exists "envsync vars delete within org" on module_envsync.environment_vars;

create policy "envsync vars delete within org"
  on module_envsync.environment_vars for delete
  using (module_envsync.is_org_member(org_id));

grant all on all tables in schema module_envsync to anon, authenticated, service_role;
grant all on all sequences in schema module_envsync to anon, authenticated, service_role;
grant all on all routines in schema module_envsync to anon, authenticated, service_role;