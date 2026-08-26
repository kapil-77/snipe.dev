# Envsync — module scaffold (coming soon)

Not yet live. `status: 'coming-soon'` in `src/lib/module-registry.ts` drives the
landing/download cards, the waitlist and the blueprint screen — the registry
(not this folder) is the source of truth.

Real scaffold that already ships:

- **Schema + RLS** — `supabase/migrations/20260101000003_module_envsync_init.sql`
  (`module_envsync.environment_vars`, org-scoped `is_org_member` policies).
- **Edge function** — `supabase/functions/envsync-hello` (health probe, uses the
  shared `_shared/cors.ts` helper).

This client folder intentionally has **no runtime files yet** — the module owns
none of `api.ts` / `routes.ts` / `types.ts` until it goes live. Copy the pattern
from `src/modules/onboardtime` (or `src/modules/prunblocker`) when building it:

- `api.ts` → talk only to `envsync-*` edge functions (import `invokeEdgeFn` from
  `@/lib/edge-fn`, not a local duplicate).
- `types.ts` — domain types backed by `EnvVarRow` in `src/lib/database.types.ts`.
- `routes.tsx` — `envsyncRoutes: RouteObject[]` registered additively in
  `src/app/routes.tsx`.
- **Isolation rule:** import ONLY from `@/components/ui` and `@/lib`; never
  another module's folder.