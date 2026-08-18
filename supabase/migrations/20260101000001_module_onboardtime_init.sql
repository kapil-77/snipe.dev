-- ============================================================
-- module_onboardtime — Onboarding checklists & runbooks
--
-- Owned EXCLUSIVELY by the Onboardtime module. No other module
-- may reference these tables. The only cross-schema edges are
-- back to public.users(id) and public.orgs(id).
--
-- This migration is intentionally the FULL skeleton so that
-- activation later is additive, not a schema rewrite.
-- ============================================================

create schema if not exists module_onboardtime;

-- API roles get schema access + future object privileges *before*
-- tables are created, so everything in this file inherits grants.
grant usage on schema module_onboardtime to anon, authenticated, service_role;
alter default privileges in schema module_onboardtime
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema module_onboardtime
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema module_onboardtime
  grant all on routines to anon, authenticated, service_role;

-- ------------------------------------------------------------------
-- tables (schema-qualified; no redundant name prefix)
-- ------------------------------------------------------------------
create table if not exists module_onboardtime.checklists
(
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.orgs (id) on delete cascade,
  title       text not null,
  description text,
  is_template boolean not null default false,
  created_by  uuid references public.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists module_onboardtime.checklist_items
(
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.orgs (id) on delete cascade,
  checklist_id uuid references module_onboardtime.checklists (id) on delete cascade,
  title        text not null,
  status       text not null default 'todo'
               check (status in ('todo', 'doing', 'done')),
  due_on       date,
  sort_order   integer not null default 0,
  created_by   uuid references public.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- RLS — enabled from day one, scoped to org membership.
-- ------------------------------------------------------------------
alter table module_onboardtime.checklists      enable row level security;
alter table module_onboardtime.checklist_items enable row level security;

-- Shared org-scoped predicate (security definer is safe: it only reads
-- public.org_members and forces the caller's auth.uid()).
create or replace function module_onboardtime.is_org_member(target_org uuid)
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
drop policy if exists "onboardtime checklists select within org" on module_onboardtime.checklists;

create policy "onboardtime checklists select within org"
  on module_onboardtime.checklists for select
  using (module_onboardtime.is_org_member(org_id));
drop policy if exists "onboardtime checklists insert within org" on module_onboardtime.checklists;

create policy "onboardtime checklists insert within org"
  on module_onboardtime.checklists for insert
  to authenticated
  with check (module_onboardtime.is_org_member(org_id));
drop policy if exists "onboardtime checklists update within org" on module_onboardtime.checklists;

create policy "onboardtime checklists update within org"
  on module_onboardtime.checklists for update
  using (module_onboardtime.is_org_member(org_id))
  with check (module_onboardtime.is_org_member(org_id));
drop policy if exists "onboardtime checklists delete within org" on module_onboardtime.checklists;

create policy "onboardtime checklists delete within org"
  on module_onboardtime.checklists for delete
  using (module_onboardtime.is_org_member(org_id));
drop policy if exists "onboardtime selectItems within org" on module_onboardtime.checklist_items;

create policy "onboardtime selectItems within org"
  on module_onboardtime.checklist_items for select
  using (module_onboardtime.is_org_member(org_id));
drop policy if exists "onboardtime insertItems within org" on module_onboardtime.checklist_items;

create policy "onboardtime insertItems within org"
  on module_onboardtime.checklist_items for insert
  to authenticated
  with check (module_onboardtime.is_org_member(org_id));
drop policy if exists "onboardtime updateItems within org" on module_onboardtime.checklist_items;

create policy "onboardtime updateItems within org"
  on module_onboardtime.checklist_items for update
  using (module_onboardtime.is_org_member(org_id))
  with check (module_onboardtime.is_org_member(org_id));
drop policy if exists "onboardtime deleteItems within org" on module_onboardtime.checklist_items;

create policy "onboardtime deleteItems within org"
  on module_onboardtime.checklist_items for delete
  using (module_onboardtime.is_org_member(org_id));

-- Explicit grants for anything created above (belt & braces with defaults).
grant all on all tables in schema module_onboardtime to anon, authenticated, service_role;
grant all on all sequences in schema module_onboardtime to anon, authenticated, service_role;
grant all on all routines in schema module_onboardtime to anon, authenticated, service_role;