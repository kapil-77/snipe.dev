-- ============================================================
-- shared · public.ensure_personal_org
--
-- Problem: module tables are org-scoped and RLS admits users only via
-- public.org_members, but a brand-new user has no org (org_members INSERT
-- is restricted to owners/admins). This helper idempotently provisions
-- the user's personal org + an owner membership so org-scoped module RLS
-- (is_org_member) admits them immediately.
--
-- Runs as `security definer` (owner: postgres) and ONLY touches shared
-- `public` tables — no module data, no cross-module references.
-- ============================================================

create or replace function public.ensure_personal_org()
returns table (id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id public.orgs.id%type;
  v_uid    uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'must be authenticated';
  end if;

  -- Reuse the user's existing personal org if one is already present.
  select o.id into v_org_id
  from public.orgs o
  inner join public.org_members m
          on m.org_id = o.id and m.user_id = v_uid
  where o.slug = 'personal-' || v_uid
  limit 1;

  if v_org_id is not null then
    return query select v_org_id;
    return;
  end if;

  insert into public.orgs (name, slug, created_by)
  values ('Personal workspace', 'personal-' || v_uid, v_uid)
  returning id into v_org_id;

  insert into public.org_members (org_id, user_id, role)
  values (v_org_id, v_uid, 'owner');

  return query select v_org_id;
end;
$$;

-- Only authenticated users may call it; block anon + the catch-all role.
revoke execute on function public.ensure_personal_org() from public, anon;
grant  execute on function public.ensure_personal_org() to authenticated, service_role;