# PROJECT_CONTEXT â€” snipe.dev

Multi-module dev-tools SaaS shell. **One module = one Postgres schema = one set of
edge functions = isolated by default.** Handoff document for the next coding agent.

## Current State (high level)

- **Shell + landing + auth are fully functional and live.**
- **Onboardtime is the first built module** (runbooks + checklist items).
- **prunblocker / envsync are still "coming soon"** â€” scaffolded (schema, RLS, hello edge fn) but no real UI.
- Auth (email + GitHub OAuth) works against a real hosted Supabase project.
- Waitlist form **stores** emails only â€” **does not send email** (see Known Issues).

**Stack:** Vite 8 Â· React 19 Â· TypeScript 5.9 (.tsx, bundler/noEmit) Â· Tailwind CSS 4
( @tailwindcss/vite ) Â· react-router dom 7 (new Route element API) Â· lucide-react Â·
@supabase/supabase-js 2.112.3 (Deno edge fns via esm.sh).

**Design system:** extracted from ossium.in. Base #0E0F10, abyss #000, ink #E5E5E5,
accent #09AE5B (the one accent), muted #a0a0a0, dashed lines #444.
Dashed "-----" borders are **4 stacked repeating-linear-gradient layers**; **"+" corner
marks are literal glyphs** (translate 50%,50% + knockout bg). Figtree font only.
Scroll reveal = IntersectionObserver, 200ms ease-out, via src/hooks/use-in-view.

---

## Architecture & Strict Convention (do NOT violate)

- Every module owns an isolated Postgres schema: module_onboardtime,
  module_prunblocker, module_envsync. No cross-module FKs. Only cross-schema edges
   are to public.users(id) and public.orgs(id).
- `public` schema holds ONLY shared tables: users, orgs, org_members, waitlist.
- **RLS enabled from day one** on every module table; policies scoped via
   module_onboardtime.is_org_member(org_id) â†’ checks public.org_members.
- Edge-function name prefix **must match** its module schema (onboardtime-* â†” module_onboardtime).
- A module\'s /src/modules/NAME imports ONLY from @/components/ui and @/lib. Never a module\'s folder.
- Frontend never queries tables directly â€” all module data flows through its OWN edge functions (RLS enforcement).

---

## Directory Layout

shell
 source/app â€” App, routes, providers, auth, RequireAuth
 shell      â€” Navbar, Footer, Sidebar, layouts, ModulePage (generic blueprint) , ModuleCard, ModuleGrid
 ui         â€” Design system primitives (Frame, Divider, Button, Input, Badge, Card, Accordion, Marquee, Logo, SectionHeading, GithubMark)
 hooks      â€” use-in-view
 lib        â€” supabase, cn, constants, module-registry, api(probe), database.types, waitlist
 modules    â€” onboardtime (LIVE), prunblocker, envsync (coming soon), _template
 pages      â€” Landing sections, auth pages, NotFound
 styles     â€” globals.css tokens
supabase/    functions â€” onboardtime-{hello,bootstrap,runbooks,items}, prunblocker-hello, envsync-hello, _shared/cors
              migrations 00000â€¦00005
scripts      â€” deploy.sh / deploy.ps1

---

## Key Files

| File | What it does |
|---|---|
| src/lib/module-registry.ts | **Single source of truth**. Flip status to live to activate a module. |
| src/app/routes.tsx | Router. Live module routes registered **before** modules/:slug catch-all. |
| src/app/auth.tsx | AuthProvider. Must subscribe to onAuthStateChange BEFORE getSession() (else OAuth races). |
| src/shell/PublicLayout.tsx | Scroll-anchor: only runs on well-formed #section hashes; OAuth fragment crash fixed. |
| src/lib/waitlist.ts | Waitlist insert. Supabase if configured else localStorage. Does NOT send email. |
| supabase/functions/onboardtime-bootstrap/index.ts | Provisions org. Uses SERVICE ROLE (see Known Issues). |
| supabase/migrations/00005_shared_grants.sql | Retroactive API-role table grants (idempotent). |

---

## Decisions & their WHY

1. Bootstrap uses SERVICE_ROLE table inserts, not an RPC â€” the RPC path hit a stuck PostgREST function cache.
2. functions.invoke({ query }) is silently DROPPED by supabase-js â€” query is built INTO the function name.
3. Every "permission denied for table" was a missing API-role GRANT; migration 00005 + default privileges fix it.
4. PublicLayout must NOT querySelector an OAuth hash (invalid selector â†’ SyntaxError/blank); fixed with a guard.
5. Figtree only; lucide removed brand icons â†’ GithubMark is inline SVG.

---

## Remaining Work

### One-off / now
- If not done: run ./scripts/deploy.sh once to push migrations + deploy edge functions.
- Set SUPABASE SERVICE_ROLE_KEY as a **function secret** on onboardtime-bootstrap .
- Expect 7 edge functions ACTIVE in deploy.sh --verify output

### Future modules (build like Onboardtime)
- prunblocker â€” module_prunblocker + prunblocker-hello + gate CRUD UI.
- envsync â€” module_envsync + envsync-hello + env-var CRUD UI.

### How to build a new module
1. Copy src/modules/onboardtime (reference).
2. Migration <ts>_module_<name>_init.sql; add default privileges.
3. Edge functions supabase/functions/<name>-*.
4. Flip module-registry.ts status; register routes in app/routes.tsx (before :slug).
5. npm run build & tsc -b.

### Do NOT
- Don\'t run supabase init --force (regenerates config) unless re-merging custom settings.
- Don\'t use bare functions.invoke({ query }) â€” append query to the fn name.

---

## Known Issues

1. Waitlist does NOT send email â€” only inserts into public.waitlist (verified). No email provider.
   To send: add a waitlist-notify (alert admin) / confirm-waitlist (email user) edge fn + Resend API key + sender domain.
2. Onboardtime bootstrap needs the SERVICE_ROLE_KEY secret â€” 500 without it.
3. PostgREST function-catalog cache â€” prefer table inserts / service role over new RPCs; else NOTIFY pgrst + ALTER ROLE + reload.
4. functions.invoke({ query }) dropped â€” build query into the fn name.
5. Supabase CLI is the npm wrapper â€” "spawn UNKNOWN" in Git Bash if native binary missing.

---

## Environment / Secrets

| Variable | Where it lives | Notes |
|---|---|---|
| VITE_SUPABASE_URL | root .env | project URL |
| VITE_SUPABASE_ANON_KEY | root .env | public anon key |
| VITE_SUPABASE_FUNCTIONS_URL | root .env | optional override; auto-resolves |
| SUPABASE_SERVICE_ROLE_KEY | function secret (never .env) | required by bootstrap |
| GITHUB_CLIENT_ID / SECRET | Supabase Dashboard / GitHub provider | server-side only |

---

## Auth Flow (already working)

1. /login â†’ email/GitHub â†’ Site URL http://localhost:5173 â†’ session written to localStorage.
2. PublicLayout no longer crashes on the OAuth fragment (fixed).
3. Protected /app/* requires a session via RequireAuth.

---

## Next steps for the next coding agent

Run ./scripts/deploy.sh --verify (expect 7 ACTIVE functions). Then build prunblocker or envsync
in the same pattern as Onboardtime. **Keep the isolation convention sacred.**