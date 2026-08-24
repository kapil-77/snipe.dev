-- ============================================================
-- module_prunblocker — PR Unblocker workflow upgrade (live v1)
--
-- ADDITIVE ONLY. Keeps every existing merge_gates column/row and
-- continues to work with the 00002 skeleton + RLS. Adds:
--
--   1. pr_evaluations        — a real, org-scoped AUDIT TRAIL for every
--                              "merge-gate evaluation" performed by the
--                              prunblocker-evaluate edge function. This is
--                              the persisted proof that enforcement ran and
--                              what it decided (READY→MERGE / blocked).
--   2. github_installations  — the RESERVED SEAM for real GitHub app
--                              installs. Declared now (additive, inert) so
--                              future webhook-based enforcement can look up
--                              an org's connected GitHub account without a
--                              schema rewrite. No GitHub calls happen today.
--
-- RLS (module_prunblocker.is_org_member) is reused unchanged — the new
-- tables inherit the org-scoped posture. No cross-module references; the
-- only foreign keys are back to public.users(id) / public.orgs(id).
-- ============================================================

-- ------------------------------------------------------------------
-- pr_evaluations — enforcement audit trail
-- ------------------------------------------------------------------
create table if not exists module_prunblocker.pr_evaluations
(
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references public.orgs (id) on delete cascade,
  gate_id          uuid references module_prunblocker.merge_gates (id) on delete set null,
  repo             text not null,
  source_branch    text not null,
  target_branch    text not null,
  required_checks  text[] not null default '{}',
  passed_checks    text[] not null default '{}',
  required_reviews integer not null default 0,
  review_approvals integer not null default 0,
  has_conflicts    boolean not null default false,
  verdict          text not null check (verdict in ('ready', 'blocked')),
  blocked_reasons  text[] not null default '{}',
  created_by       uuid references public.users (id) on delete set null,
  created_at       timestamptz not null default now()
);
-- ------------------------------------------------------------------
-- github_installations — reserved seam for future real-GitHub enforcement
-- ------------------------------------------------------------------
create table if not exists module_prunblocker.github_installations
(
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.orgs (id) on delete cascade,
  github_app_id   text not null,
  installation_id text not null,
  repo_name       text not null,
  account_login   text,
  enabled         boolean not null default true,
  created_by      uuid references public.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- RLS — enabled from day one, org-scoped via the shared predicate.
-- ------------------------------------------------------------------
alter table module_prunblocker.pr_evaluations       enable row level security;
alter table module_prunblocker.github_installations enable row level security;
drop policy if exists "prunblocker evaluations select within org" on module_prunblocker.pr_evaluations;

create policy "prunblocker evaluations select within org"
  on module_prunblocker.pr_evaluations for select
  using (module_prunblocker.is_org_member(org_id));
drop policy if exists "prunblocker evaluations insert within org" on module_prunblocker.pr_evaluations;

create policy "prunblocker evaluations insert within org"
  on module_prunblocker.pr_evaluations for insert
  to authenticated
  with check (module_prunblocker.is_org_member(org_id));
drop policy if exists "prunblocker evaluations update within org" on module_prunblocker.pr_evaluations;

create policy "prunblocker evaluations update within org"
  on module_prunblocker.pr_evaluations for update
  using (module_prunblocker.is_org_member(org_id))
  with check (module_prunblocker.is_org_member(org_id));
drop policy if exists "prunblocker evaluations delete within org" on module_prunblocker.pr_evaluations;

create policy "prunblocker evaluations delete within org"
  on module_prunblocker.pr_evaluations for delete
  using (module_prunblocker.is_org_member(org_id));

drop policy if exists "prunblocker installations select within org" on module_prunblocker.github_installations;

create policy "prunblocker installations select within org"
  on module_prunblocker.github_installations for select
  using (module_prunblocker.is_org_member(org_id));
drop policy if exists "prunblocker installations insert within org" on module_prunblocker.github_installations;

create policy "prunblocker installations insert within org"
  on module_prunblocker.github_installations for insert
  to authenticated
  with check (module_prunblocker.is_org_member(org_id));
drop policy if exists "prunblocker installations update within org" on module_prunblocker.github_installations;

create policy "prunblocker installations update within org"
  on module_prunblocker.github_installations for update
  using (module_prunblocker.is_org_member(org_id))
  with check (module_prunblocker.is_org_member(org_id));
drop policy if exists "prunblocker installations delete within org" on module_prunblocker.github_installations;

create policy "prunblocker installations delete within org"
  on module_prunblocker.github_installations for delete
  using (module_prunblocker.is_org_member(org_id));

-- ------------------------------------------------------------------
-- indexes — cheap org/repo lookups
-- ------------------------------------------------------------------
create index if not exists idx_pr_gates_org_repo   on module_prunblocker.merge_gates (org_id, repo);
create index if not exists idx_pr_eval_org         on module_prunblocker.pr_evaluations (org_id);
create index if not exists idx_pr_eval_gate        on module_prunblocker.pr_evaluations (gate_id);
create index if not exists idx_pr_inst_org         on module_prunblocker.github_installations (org_id);

-- Explicit grants for anything created above (belt & braces with defaults).
grant all on all tables in schema module_prunblocker to anon, authenticated, service_role;
grant all on all sequences in schema module_prunblocker to anon, authenticated, service_role;
grant all on all routines in schema module_prunblocker to anon, authenticated, service_role;

-- Reload so PostgREST picks up the new tables/columns immediately.
notify pgrst, 'reload schema';