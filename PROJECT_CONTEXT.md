# PROJECT_CONTEXT ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â snipe.dev

Multi-module dev-tools SaaS shell. **One module = one Postgres schema = one set of
edge functions = isolated by default.** Handoff document for the next coding agent.

## Current State (high level)

- **Shell + landing + auth are fully functional and live.**
- **Onboardtime is the first built module** (runbooks + checklist items).
- **prunblocker / envsync are still "coming soon"** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â scaffolded (schema, RLS, hello edge fn) but no real UI.
- Auth (email + GitHub OAuth) works against a real hosted Supabase project.
- Waitlist form **stores** emails only ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â **does not send email** (see Known Issues).

**Stack:** Vite 8 ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· React 19 ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· TypeScript 5.9 (.tsx, bundler/noEmit) ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· Tailwind CSS 4
( @tailwindcss/vite ) ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· react-router dom 7 (new Route element API) ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· lucide-react ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â·
@supabase/supabase-js 2.112.3 (Deno edge fns via esm.sh).

**Design system:** extracted from ossium.in. Base #0E0F10, abyss #000, ink #E5E5E5,
accent #09AE5B (the one accent), muted #a3a3a0 (neutral-400), dashed lines #444.
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
   module_onboardtime.is_org_member(org_id) ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ checks public.org_members.
- Edge-function name prefix **must match** its module schema (onboardtime-* ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â module_onboardtime).
- A module\'s /src/modules/NAME imports ONLY from @/components/ui and @/lib. Never a module\'s folder.
- Frontend never queries tables directly ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â all module data flows through its OWN edge functions (RLS enforcement).

---

## Directory Layout

```
src/
  app/      App.tsx, routes.tsx, providers.tsx, auth.tsx, RequireAuth.tsx
  shell/    Navbar, Footer, Sidebar, layouts, DashboardPage, ModulePage,
            ModuleCard, ModuleGrid
  components/ui/  Frame, Divider, Button, Input, Badge, Card, Accordion,
                    Marquee, Logo, SectionHeading, GithubMark (Reveal re-exports)
  hooks/    use-in-view.tsx  (scroll reveal)
  lib/      supabase, cn, constants, module-registry, api(probe), database.types, waitlist
  modules/  onboardtime (LIVE) / prunblocker / envsync (coming soon) / _template
  pages/    Landing + landing/*, auth/* (LoginPage, AuthCallback, NotFound)
  styles/   globals.css (design tokens)
  main.tsx, vite-env.d.ts

supabase/
  functions/  onboardtime-{hello,bootstrap,runbooks,items},
              prunblocker-hello, envsync-hello, _shared/cors.ts
  migrations/ 00000..00006

scripts/    deploy.sh / deploy.ps1
```

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

1. Bootstrap uses SERVICE_ROLE table inserts, not an RPC ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â the RPC path hit a stuck PostgREST function cache.
2. functions.invoke({ query }) is silently DROPPED by supabase-js ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â query is built INTO the function name.
3. Every "permission denied for table" was a missing API-role GRANT; migration 00005 + default privileges fix it.
4. PublicLayout must NOT querySelector an OAuth hash (invalid selector ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ SyntaxError/blank); fixed with a guard.
5. Figtree only; lucide removed brand icons ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ GithubMark is inline SVG.

---

## Remaining Work

### One-off / now
- If not done: run ./scripts/deploy.sh once to push migrations + deploy edge functions.
- Set SUPABASE SERVICE_ROLE_KEY as a **function secret** on onboardtime-bootstrap .
- Expect 6 edge functions ACTIVE in deploy.sh --verify output

### Future modules (build like Onboardtime)
- prunblocker - module_prunblocker + prunblocker-hello + gate CRUD UI. (Since 2026-08: has a dedicated coming-soon detail page with an interactive merge-gate preview, module-architecture section + vibe flow, and waitlist CTA - still coming-soon; the dedicated page is routed via src/modules/prunblocker/routes.tsx above the :slug blueprint.)
- envsync ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â module_envsync + envsync-hello + env-var CRUD UI.

### How to build a new module
1. Copy src/modules/onboardtime (reference).
2. Migration <ts>_module_<name>_init.sql; add default privileges.
3. Edge functions supabase/functions/<name>-*.
4. Flip module-registry.ts status; register routes in app/routes.tsx (before :slug).
5. npm run build & tsc -b.

### Do NOT
- Don\'t run supabase init --force (regenerates config) unless re-merging custom settings.
- Don\'t use bare functions.invoke({ query }) ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â append query to the fn name.

---

## Known Issues

1. Waitlist does NOT send email ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â only inserts into public.waitlist (verified). No email provider.
   To send: add a waitlist-notify (alert admin) / confirm-waitlist (email user) edge fn + Resend API key + sender domain.
2. Onboardtime bootstrap needs the SERVICE_ROLE_KEY secret ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â 500 without it.
3. PostgREST function-catalog cache ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â prefer table inserts / service role over new RPCs; else NOTIFY pgrst + ALTER ROLE + reload.
4. functions.invoke({ query }) dropped ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â build query into the fn name.
5. Supabase CLI is the npm wrapper ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â "spawn UNKNOWN" in Git Bash if native binary missing.

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

1. /login ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ email/GitHub ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ Site URL http://localhost:5173 ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ session written to localStorage.
2. PublicLayout no longer crashes on the OAuth fragment (fixed).
3. Protected /app/* requires a session via RequireAuth.

---

## Next steps for the next coding agent

Run ./scripts/deploy.sh --verify (expect 6 ACTIVE functions: onboardtime-{hello,bootstrap,runbooks,items},
prunblocker-hello, envsync-hello). Then build prunblocker or envsync in the same pattern as Onboardtime.
**Keep the isolation convention sacred.**

---

## Onboardtime Upgrade (implemented ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â 000006 + edge fns + module UI)

**STATUS: IMPLEMENTED.** `tsc -b` clean + `vite build` passes. Not yet deployed to
hosted Supabase (see Verification). Scope: polish Onboardtime into a real
dev-onboarding workflow. **No change to core architecture or visual identity.** The
existing runbook/checklist functionality, `module_onboardtime.is_org_member` RLS, the
edge-function-per-resource split, and the terminal dark theme (`#0e0f10` / `#09ae5b`
accent) are all preserved. Role templates are **TS-only** (no DB seeding).

### Schema (additive ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â migration 20260101000006_module_onboardtime_workflow.sql)
Existing columns/rows untouched; new nullable/defaulted columns inherit the
`00001` default-privilege grants:
- `checklists`: `role` (template role), `owner_id` -> public.users,
  `next_milestone` + `next_milestone_due` (First-PR callout), `completed_at`.
- `checklist_items`: `section` (Access/Dev Setup/Codebase/Team/First Contribution,
  default `general`), `category`, `priority` low/medium/high (default medium),
  `blocked` boolean (default false), `owner_id` -> public.users.
- Indexes: `checklists(role)`, `checklists(owner_id)`,
  `checklist_items(checklist_id,section,sort_order)`, `priority`, `(blocked,status)`, `owner_id`.

### Edge functions
- `onboardtime-runbooks`: accept the new `checklists` fields; add a
  `GET ?analytics=true&org_id=...` branch returning `{ activeOnboardings, avgCompletion,
  blockedTasks, commonBlockers[] }`; PATCH already exists.
- `onboardtime-items`: accept the new `checklist_items` fields
  (section/category/priority/blocked/owner_id).
- Query is built into the function name (supabase-js drops `query:` ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â see Decisions #2).

### Data layer (src/modules/onboardtime)
- `types.ts`: `RunbookAnalytics`, `RunbookStatus` + `getRunbookStatus()`, label maps
  (`ROLE_LABELS`, `SECTION_LABELS`, `PRIORITY_LABELS`); `RunbookDraft`/`ItemDraft` carry the new fields.
- `templates.ts` (NEW, TS-only): `RoleSections = Record<ItemSection, TemplateSection>` shared
  `coreSections`, overridden per role; `sectionsForRole()` + `templateItemsForRole()`. No DB seed.
- `api.ts`: `updateRunbook(id, patch)`, `getTeamAnalytics(orgId)`,
  `createRunbookFromTemplate(orgId, role)` (create checklist + bulk-add items - the primary
  TS-only path). `cloneTemplate(orgId, templateId)` kept as an edge power-feature.
### Hooks
- Extend `useRunbookDetail` to also fetch analytics in its `Promise.all`.
- Add `useTemplates()` (lists `is_template=true` role templates) and `useAnalytics()`.

### UI
- **Home**: template picker (role cards, dashed Frame + accent hover) beside the existing
  create form; cloning calls `cloneTemplate`. `RunbookCard` keeps the progress bar, adds
  owner initials + priority dot.
- **Detail**: analytics header bar (4 stats) above the existing progress; items grouped by
  section with collapsible headers (chevron, 200ms); "Next milestone" `Frame` callout when
  set; `ItemRow` gains inline priority/category/due-date/blocked/owner tags (only when present).
- New components: `RunbookTemplates`, `AnalyticsBar`, `SectionHeader`, `NextMilestone`, `ItemMeta`.
- **States**: section-level empties (`ListChecks` dull icon), preserved loading spinners,
  item enter-fade via existing `Reveal` + stagger.
- **Checkbox behavior**: the status box is a **direct complete-toggle** (`todo â†’ done`,
  `done â†’ todo`; `doing` still exists in schema/types for future explicit "in progress"
  but is no longer cycled through by the box).
- **Mutation sync (no refresh flicker)**: item mutations (cycle / add / move / delete) are
  **optimistic** â€” the edge fn's returned row is applied locally via
  `applyItemLocally` / `swapLocal` / `removeItemLocally` in `useRunbookDetail`, so the
  list never full-reloads (no `Reveal` re-fade). `refresh()` is only used by the
  error-state Retry button. Analytics updates happen via a silent `refreshAnalyticsOnly()`
  (never touches the list).

### Non-goals (unchanged)
- No RBAC beyond existing per-org RLS; no notifications/cron (analytics computed on request);
  no DnD libs (reuse `sort_order` swap); no new top-level routes/pages; no new
  colors/fonts; no changes to waitlist (stores-only) or auth.

### Files affected (all under the existing module or this doc)
Migration `20260101000006_module_onboardtime_workflow.sql`;
`supabase/functions/onboardtime-{runbooks,items}/index.ts`; `src/lib/database.types.ts`;
`src/modules/onboardtime/{types,api,templates,hooks/useRunbookDetail,useTemplates,useAnalytics}`;
`src/modules/onboardtime/components/{OnboardtimeHome,ChecklistDetail,ItemRow,
RunbookCard,RunbookTemplates,AnalyticsBar,SectionHeader,NextMilestone,ItemMeta}`.

### Verification
- `tsc -b` clean; `vite build` succeeds (the single >500kB chunk warning is pre-existing).
- **Not yet deployed to hosted Supabase.** To stage: `supabase functions deploy
  onboardtime-runbooks onboardtime-items` + `supabase db push`; then `deploy.sh --verify`
  (expect 6).

---

## Production deploy checklist (Vercel + Supabase hosted)

### Vercel (live: https://snipedev.vercel.app)
- Env vars (dashboard â†’ your project â†’ Settings â†’ Environment Variables):
  | Var | Value |
  |---|---|
  | `VITE_SUPABASE_URL` | `https://savvsjckbgtccqvgmooo.supabase.co` |
  | `VITE_SUPABASE_ANON_KEY` | the anon (public) key |
  | `VITE_SUPABASE_FUNCTIONS_URL` | optional; client auto-derives `/functions/v1` |
  Redeploy after adding/changing env vars (Vercel builds are env-snapshotted).
- **`vercel.json` (root)** provides the SPA fallback so OAuth callbacks + deep links work:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
  Vercel serves real files (assets) before applying the rewrite â€” safe for a BrowserRouter SPA.
- Without it, any non-home path gives a filesystem **404** (e.g. `/auth/callback#access_token=â€¦`).

### Supabase hosted (via Dashboard)
- **Authentication â†’ URL Configuration**:
  - **Site URL** = `https://snipedev.vercel.app` (or a custom domain).
  - **Redirect URLs** include `https://snipedev.vercel.app/**` AND `http://localhost:5173/**` (local dev).
- **Authentication â†’ Providers â†’ GitHub**:
  - Client ID + secret from the GitHub OAuth app; callback `https://savvsjckbgtccqvgmooo.supabase.co/auth/v1/callback`.
- **Edge-function secrets**: set `SERVICE_ROLE_KEY` (JWT from Dashboard â†’ Settings â†’ API) on `onboardtime-bootstrap` â€” required for personal-org provisioning.
- Apply pending migrations + deploy edge functions once from the CLI:
  `supabase db push && supabase functions deploy onboardtime-runbooks onboardtime-items` (then `deploy.sh --verify`, expect 6).

### Login/OAuth flow (post-fix)
1. `/login` â†’ GitHub â†’ Supabase â†’ redirect to `https://snipedev.vercel.app/auth/callback#access_token=â€¦`
2. `vercel.json` rewrite serves `index.html` â†’ `AuthCallback` runs â†’
   `detectSessionInUrl` exchanges the fragment â†’ forwards `/app/modules`.

### âš ï¸ Token hygiene
`#access_token=â€¦&refresh_token=â€¦&provider_token=gho_/ghr_â€¦` are LIVE credentials shown in
the URL bar. Revoke any leaked sessions via Supabase Dashboard (Authentication â†’ Users â†’
Revoke sessions) and GitHub (Settings â†’ Applications â†’ Revoke the OAuth grant).
