-- ============================================================
-- module_prunblocker — merge-ready gates for pull requests
--
-- Owned EXCLUSIVELY by the PR Unblocker module. Cross-schema edges
-- only back to public.users(id) / public.orgs(id). Skeleton ships
-- with RLS so activation is purely additive.
-- ============================================================

create schema if not exists module_prunblocker;

grant usage on schema module_prunblocker to anon, authenticated, service_role;
alter default privileges in schema module_prunblocker
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema module_prunblocker
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema module_prunblocker
  grant all on routines to anon, authenticated, service_role;

-- ------------------------------------------------------------------
-- tables
-- ------------------------------------------------------------------
create table if not exists module_prunblocker.merge_gates
(
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references public.orgs (id) on delete cascade,
  repo               text not null,
  source_branch      text not null default '.*',
  target_branch      text not null default '(main|master)',
  required_checks    text[] not null default '{}',
  require_review     boolean not null default true,
  block_on_conflicts boolean not null default true,
  enabled            boolean not null default true,
  created_by         uuid references public.users (id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- RLS — enabled from day one, org-scoped.
-- ------------------------------------------------------------------
alter table module_prunblocker.merge_gates enable row level security;

create or replace function module_prunblocker.is_org_member(target_org uuid)
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
drop policy if exists "prunblocker gates select within org" on module_prunblocker.merge_gates;

create policy "prunblocker gates select within org"
  on module_prunblocker.merge_gates for select
  using (module_prunblocker.is_org_member(org_id));
drop policy if exists "prunblocker gates insert within org" on module_prunblocker.merge_gates;

create policy "prunblocker gates insert within org"
  on module_prunblocker.merge_gates for insert
  to authenticated
  with check (module_prunblocker.is_org_member(org_id));
drop policy if exists "prunblocker gates update within org" on module_prunblocker.merge_gates;

create policy "prunblocker gates update within org"
  on module_prunblocker.merge_gates for update
  using (module_prunblocker.is_org_member(org_id))
  with check (module_prunblocker.is_org_member(org_id));
drop policy if exists "prunblocker gates delete within org" on module_prunblocker.merge_gates;

create policy "prunblocker gates delete within org"
  on module_prunblocker.merge_gates for delete
  using (module_prunblocker.is_org_member(org_id));

grant all on all tables in schema module_prunblocker to anon, authenticated, service_role;
grant all on all sequences in schema module_prunblocker to anon, authenticated, service_role;
grant all on all routines in schema module_prunblocker to anon, authenticated, service_role;