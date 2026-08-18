# `_template` — how to start a new module

Copy this folder to `src/modules/<name>` when adding a module, then:

## 1. Frontend
- `api.ts` — functions that call only `<name>-*` edge functions
- `types.ts` — domain types backed by the `<name>` schema rows in `src/lib/database.types.ts`
- `routes.tsx` — RouteObjects registered from `src/app/routes.tsx` (additively — see the
  comment in an existing module's routes file)
- `components/` + `hooks/` — module UI/logic. **Isolation rule:** import ONLY from
  `@/components/ui` and `@/lib`. Never import another module's folder.
- Register the module in `src/lib/module-registry.ts` (name, icon, slug, schema,
  edgePrefix, order). Metadata there flips it to `status: 'live'`.

## 2. Backend (mirror the naming convention everywhere)

```sql
-- supabase/migrations/<ts>_module_<name>_init.sql
CREATE SCHEMA module_<name>;            -- <name> uses the module slug
CREATE TABLE module_<name>.<table> (...);
ALTER TABLE module_<name>.<table> ENABLE ROW LEVEL SECURITY;
-- policy scoped to public.orgs(id) / public.users(id) — NEVER another module
GRANT USAGE ON SCHEMA module_<name> TO anon, authenticated, service_role;
```

- Edge functions in `supabase/functions/<name>-*` (prefix matches the schema).
- No references between modules. The only cross-schema edges are
  `→ public.users(id)` and `→ public.orgs(id)`.

## 3. Activation is additive
Keep the coming-soon card, waitlist and blueprint screen intact. When the module
is built, swap `status` to `live` and register real routes — nothing else regresses.