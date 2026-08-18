-- ============================================================
-- snipe.dev · database verification
--
-- Run in Supabase Dashboard → SQL Editor and read all three results.
-- Rule of thumb: every table you own must show `rowsecurity = true`.
-- ============================================================

-- 1) Table inventory + RLS state across every schema
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname in
      ('public', 'module_onboardtime', 'module_prunblocker', 'module_envsync')
order by schemaname, tablename;

-- 2) Policy count per table (expect >= 1 for every table; policies are
--    what actually allow `anon`/`authenticated` roles through RLS)
select schemaname as schema, tablename as "table", count(*) as policies
from pg_policies
where schemaname in
  ('public', 'module_onboardtime', 'module_prunblocker', 'module_envsync')
group by schemaname, tablename
order by schemaname, tablename;

-- 3) Cross-check: tables in these schemas that have RLS enabled but ZERO
--    policies (those are locked down — nothing can read/write them).
select pt.schemaname, pt.tablename
from pg_tables pt
where pt.schemaname in
      ('public', 'module_onboardtime', 'module_prunblocker', 'module_envsync')
  and pt.rowsecurity = true
  and not exists (
        select 1 from pg_policies pp
        where pp.schemaname = pt.schemaname and pp.tablename = pt.tablename
      )
order by pt.schemaname, pt.tablename;

-- 4) Expected shared tables (sanity check for the public namespace)
select table_schema, table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('users', 'orgs', 'org_members', 'waitlist')
order by table_name