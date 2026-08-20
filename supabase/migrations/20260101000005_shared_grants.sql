-- ============================================================
-- snipe.dev · migration 0005 — one-time retroactive table GRANTs
--
-- Migrations set `default privileges` so FUTURE tables auto-grant
-- to the API roles. Tables that already exist (orgs, org_members,
-- waitlist, module_* tables created before the default-privileges
-- lines were added) need their grants applied once. This migration
-- does that and is idempotent (GRANTs are naturally re-grantable),
-- so `supabase db push` can replay it safely.
--
-- Applied automatically in production via `supabase db push`
-- (wired into scripts/deploy.sh and scripts/deploy.ps1).
-- ============================================================

-- Shared `public` tables
grant select, insert, update, delete on public.users        to anon, authenticated, service_role;
grant select, insert, update, delete on public.orgs         to anon, authenticated, service_role;
grant select, insert, update, delete on public.org_members  to anon, authenticated, service_role;
grant select, insert, update, delete on public.waitlist     to anon, authenticated, service_role;

-- Module tables (grant as soon as each module's schema is created)
grant select, insert, update, delete on all tables in schema module_onboardtime to anon, authenticated, service_role;
grant all on all sequences in schema module_onboardtime to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema module_prunblocker to anon, authenticated, service_role;
grant all on all sequences in schema module_prunblocker to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema module_envsync to anon, authenticated, service_role;
grant all on all sequences in schema module_envsync to anon, authenticated, service_role;

-- Reload PostgREST so any cached grant state clears
NOTIFY pgrst, 'reload schema';