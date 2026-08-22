-- ============================================================
-- module_onboardtime — Onboardtime workflow upgrade (Layer 1)
--
-- ADDITIVE ONLY. Keeps every existing column/row; existing
-- bootstrap + edge-function paths continue to work. The new
-- columns power role templates, sections, owners, priority,
-- blocked-state and runbook-level analytics/progress.
--
-- RLS (module_onboardtime.is_org_member) is UNCHANGED — the new
-- columns inherit the existing org-scoped policies via the
-- default-privileges grants already set in migration 00001.
-- ============================================================

-- ----------------------------------------------------------------
-- checklists (runbooks) — role templates + next-milestone callout
-- ----------------------------------------------------------------
alter table module_onboardtime.checklists
  add column if not exists role              text;          -- 'core'|'frontend'|'backend'|'qa'|'designer'|'product'|'custom'
alter table module_onboardtime.checklists
  add column if not exists owner_id          uuid references public.users (id) on delete set null;
alter table module_onboardtime.checklists
  add column if not exists next_milestone    text;          -- human-readable "First PR" line
alter table module_onboardtime.checklists
  add column if not exists next_milestone_due date;
alter table module_onboardtime.checklists
  add column if not exists completed_at       timestamptz;  -- set when all non-template items are 'done'

-- ----------------------------------------------------------------
-- checklist_items — sections, priority, ownership, blocking
-- ----------------------------------------------------------------
alter table module_onboardtime.checklist_items
  add column if not exists section    text not null default 'general'; -- 'access'|'dev-setup'|'codebase'|'team'|'contribution'
alter table module_onboardtime.checklist_items
  add column if not exists category   text;               -- 'infra'|'tooling'|'review'|'merge'|...
alter table module_onboardtime.checklist_items
  add column if not exists priority   text not null default 'medium'
                                    check (priority in ('low', 'medium', 'high'));
alter table module_onboardtime.checklist_items
  add column if not exists blocked    boolean not null default false;
alter table module_onboardtime.checklist_items
  add column if not exists owner_id   uuid references public.users (id) on delete set null;

-- ----------------------------------------------------------------
-- Indexes for the new analytics + sectioned views (cheap queries)
-- ----------------------------------------------------------------
create index if not exists idx_ot_checklists_role        on module_onboardtime.checklists (role);
create index if not exists idx_ot_checklists_owner      on module_onboardtime.checklists (owner_id);
create index if not exists idx_ot_items_section         on module_onboardtime.checklist_items (checklist_id, section, sort_order);
create index if not exists idx_ot_items_priority        on module_onboardtime.checklist_items (priority);
create index if not exists idx_ot_items_blocked         on module_onboardtime.checklist_items (blocked, status);
create index if not exists idx_ot_items_owner           on module_onboardtime.checklist_items (owner_id);

-- Reload so PostgREST picks up the new columns immediately.
notify pgrst, 'reload schema';