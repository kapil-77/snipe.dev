# PROJECT_CONTEXT — snipe.dev

Multi-module dev-tools SaaS shell. **One module = one Postgres schema = one set of
edge functions = isolated by default.** Internal engineering notes.

## Current State (high level)

- **Shell + landing + auth are fully functional and live.**
- **Onboardtime is the first built module** (runbooks + checklist items).
- **envsync is still "coming soon"** — scaffolded (schema, RLS, hello edge fn) but no real UI.
- Auth (email + GitHub OAuth) works against a real hosted Supabase project.
- Waitlist form **stores** emails only — **does not send email** (see Known Issues).
- **PR Unblocker is the second live module** — merge-gate CRUD, an in-app evaluation
  runner, and a persisted enforcement audit trail (module_prunblocker). Availability is
  in-shell; real-GitHub webhook enforcement is a reserved seam (not yet connected).

**Stack:** Vite 8 · React 19 · TypeScript 5.9 (.tsx, bundler/noEmit) · Tailwind CSS 4
( @tailwindcss/vite ) · react-router dom 7 (new Route element API) · lucide-react ·
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
  are to `public.users(id)` and `public.orgs(id)`.
- `public` schema holds ONLY shared tables: users, orgs, org_members, waitlist.
- **RLS enabled from day one** on every module table; policies scoped via
  `module_onboardtime.is_org_member(org_id)` — a security definer that checks `public.org_members`.
- Edge-function name prefix **must match** its module schema (`onboardtime-*` → `module_onboardtime`).
- A module's `/src/modules/NAME` imports ONLY from `@/components/ui` and `@/lib`. Never a module's folder.
- Frontend never queries tables directly — all module data flows through its OWN edge functions (RLS enforcement).

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
  lib/      supabase, cn, constants, module-registry, edge-fn (shared invoke),
            use-async (shared load/loading/error/refresh), workspace-org, api(probe),
            database.types, waitlist
  modules/  onboardtime (LIVE) / prunblocker (LIVE) / envsync (coming soon; no
            client runtime yet — schema + hello edge fn live; see its README) / _template
  pages/    Landing + landing/*, auth/* (LoginPage, AuthCallback, NotFound)
  styles/   globals.css (design tokens)
  main.tsx, vite-env.d.ts

supabase/
  functions/  onboardtime-{hello,bootstrap,runbooks,items},
              prunblocker-{hello,bootstrap,gates,evaluate,webhook},
              envsync-hello, _shared/cors.ts
  migrations/ 00000..00007

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
| supabase/functions/onboardtime-bootstrap/index.ts | Provisions org. Uses SERVICE_ROLE (see Known Issues). |
| supabase/migrations/00005_shared_grants.sql | Retroactive API-role table grants (idempotent). |
---

## Decisions & their WHY

1. Bootstrap uses SERVICE_ROLE table inserts, not an RPC — the RPC path hit a stuck PostgREST function cache.
2. functions.invoke({ query }) is silently DROPPED by supabase-js — query is built INTO the function name.
3. Every "permission denied for table" was a missing API-role GRANT; migration 00005 + default privileges fix it.
4. PublicLayout must NOT querySelector an OAuth hash (invalid selector → SyntaxError/blank); fixed with a guard.
5. Figtree only; lucide removed brand icons — GithubMark is inline SVG.

---

## Remaining Work

### One-off / now
- If not done: run ./scripts/deploy.sh once to push migrations + deploy edge functions.
- Set SUPABASE SERVICE_ROLE_KEY as a **function secret** on onboardtime-bootstrap AND prunblocker-bootstrap.
- expect 10 edge functions ACTIVE in deploy.sh --verify output

### Future modules (build like Onboardtime)
- prunblocker - **NOW LIVE** (see "PR Unblocker (implemented)" below). Real GitHub webhook enforcement remains ON THE ROADMAP via the reserved `github_installations` table + `prunblocker-webhook` endpoint.
- envsync — module_envsync + envsync-hello + env-var CRUD UI.

### How to build a new module
1. Copy src/modules/onboardtime (reference).
2. Migration <ts>_module_<name>_init.sql; add default privileges.
3. Edge functions supabase/functions/<name>-*.
4. Flip module-registry.ts status; register routes in app/routes.tsx (before :slug).
5. npm run build & tsc -b.

### Do NOT
- Don't run supabase init --force (regenerates config) unless re-merging custom settings.
- Don't use bare functions.invoke({ query }) — append query to the fn name.

---

## Known Issues

1. Waitlist does NOT send email — only inserts into public.waitlist (verified). No email provider.
   To send: add a waitlist-notify (alert admin) / confirm-waitlist (email user) edge fn + Resend API key + sender domain.
2. Onboardtime bootstrap needs the SERVICE_ROLE_KEY secret — 500 without it.
3. PostgREST function-catalog cache — prefer table inserts / service role over new RPCs; else NOTIFY pgrst + ALTER ROLE + reload.
4. functions.invoke({ query }) is silently DROPPED by supabase-js — build query into the fn name.
5. Supabase CLI is the npm wrapper — "spawn UNKNOWN" in Git Bash if native binary missing.

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

1. /login → GitHub → Supabase → Site URL http://localhost:5173 → session written to localStorage.
2. PublicLayout no longer crashes on the OAuth fragment (fixed).
3. Protected /app/* requires a session via RequireAuth.

---

## Next steps

Run ./scripts/deploy.sh --verify (expect 10 ACTIVE functions: onboardtime-{hello,bootstrap,runbooks,items},
prunblocker-{hello,bootstrap,gates,evaluate,webhook}, envsync-hello). Both Onboardtime and PR Unblocker are
live; build envsync in the same pattern next.
**Keep the isolation convention sacred.**
---

## PR Unblocker (implemented — 000007 + edge fns + module UI)

**STATUS: IMPLEMENTED.** `tsc -b` clean + `vite build` passes. Not yet deployed to hosted
Supabase (see Verification). Scope: take PR Unblocker from coming-soon preview to a real
**in-shell merge-gate workflow** with a persisted enforcement audit trail. No change to the
module isolation conventions; `module_prunblocker.is_org_member` RLS is reused unchanged.

### Schema (additive — migration 20260101000007_module_prunblocker_workflow.sql)
- `pr_evaluations` — org-scoped audit trail written by every evaluate run
  (repo/branches, required vs passed checks, review counts, conflicts, `verdict
  ('ready'|'blocked')`, `blocked_reasons[]`, `created_by`, `created_at`).
- `github_installations` — **reserved seam** for future real-GitHub enforcement
  (github_app_id, installation_id, repo_name, account_login, enabled). No live GitHub calls
  today; declared now so a future webhook can join without a schema rewrite.
- Indexes on `merge_gates(org_id, repo)`, `pr_evaluations(org_id|gate_id)`,
  `github_installations(org_id)`.

### Edge functions (prefix `prunblocker-`)
- `bootstrap`: idempotent personal-org provisioning (mirror of onboardtime-bootstrap;
  needs `SERVICE_ROLE_KEY`).
- `gates`: CRUD + enable/disable for `merge_gates`.
- `evaluate`: enforcement engine. POST: resolves the first enabled gate whose repo matches
  (case-insensitive) AND whose source/target branch regex both match; computes
  ready/blocked + `blocked_reasons[]`; PERSISTS a `pr_evaluations` row; returns 404
  `{applies:false,reason}` when out of scope. GET: audit-trail readback
  (`?org_id&gate_id?`, newest first, limit 50).
- `webhook`: JSON `501 not_configured` STUB documenting the GitHub delivery seam.
- `hello`: now `status: "live"` listing the three tables.

### Data layer (src/modules/prunblocker)
- `types.ts`: `MergeGate`, `PrEvaluation`, `GateDraft`, `PrReport`, `EvaluationResult`,
  `WorkspaceOrg`, `VERDICT_LABELS`, `GATE_POLICY_OPTIONS` (field-keyed).
- `api.ts`: `bootstrapOrg`, `listGates/createGate/updateGate/deleteGate`, `evaluatePr`,
  `listEvaluations`. (Edge transport is shared via `@/lib/edge-fn`; optimistic
  `applyGateLocally` / `removeGateLocally` / `prependLocally` on the hooks.)
- `hooks/`: `useWorkspaceOrg` (module-local), `useGates`, `useEvaluate`
  (returns the `EvaluationResult` for optimistic feed prepend), `useEvaluations`.
- `database.types.ts`: `MergeGateRow` synced (`repo`, `created_by`), `PrEvaluationRow`,
  `GithubInstallationRow`, and the schema's table registration.

### UI
- `routes.tsx`: `modules/prunblocker` -> `PrunblockerHome`; `modules/prunblocker/:gateId` -> `GateDetail`.
- `PrunblockerHome`: declare gate form (repo, branch regexes, required checks, policy
  toggles), gate grid (`GateCard`), evaluate runner (`EvaluatePanel`), and the org-wide
  enforcement `Feed`.
- `GateDetail`: policy toggles, required-checks editor, pause/resume + delete,
  per-gate evaluate runner, per-gate feed.
- The dedicated coming-soon preview (`PrunblockerDetail.tsx`) was removed — replaced by
  the live module.

### Verification
- `tsc -b` clean; `vite build` succeeds (the single >500kB chunk warning is pre-existing).
- **Not yet deployed to hosted Supabase.** To stage: `supabase db push` +
  `supabase functions deploy prunblocker-bootstrap prunblocker-gates prunblocker-evaluate prunblocker-webhook`
  (`skip` hello only), set SERVICE_ROLE_KEY on prunblocker-bootstrap, then `deploy.sh --verify`
  (expect 10).

---

## Onboardtime Upgrade (implemented — 000006 + edge fns + module UI)

**STATUS: IMPLEMENTED.** `tsc -b` clean + `vite build` passes. Not yet deployed to
hosted Supabase (see Verification). Scope: polish Onboardtime into a real
dev-onboarding workflow. **No change to core architecture or visual identity.** The
existing runbook/checklist functionality, `module_onboardtime.is_org_member` RLS, the
edge-function-per-resource split, and the terminal dark theme (`#0e0f10` / `#09ae5b`
accent) are all preserved. Role templates are **TS-only** (no DB seeding).
### Schema (additive — migration 20260101000006_module_onboardtime_workflow.sql)
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
- Query is built into the function name (supabase-js drops `query:` — see Decisions #2).

### Data layer (src/modules/onboardtime)
- `types.ts`: `RunbookAnalytics`, `RunbookStatus` + `getRunbookStatus()`, label maps
  (`ROLE_LABELS`, `SECTION_LABELS`, `PRIORITY_LABELS`); `RunbookDraft`/`ItemDraft` carry the new fields.
- `templates.ts` (NEW, TS-only): `RoleSections = Record<ItemSection, TemplateSection>` shared
  `coreSections`, overridden per role; `sectionsForRole()` + `templateItemsForRole()`. No DB seed.
- `api.ts`: `updateRunbook(id, patch)`, `getTeamAnalytics(orgId)`,
  `createRunbookFromTemplate(orgId, role)` (create checklist + bulk-add items — the primary
  TS-only path). Server-side `template_id` cloning still exists in the runbooks edge fn.

### Hooks
- `useRunbookDetail` also fetch analytics in its `Promise.all`.
- Add `useTemplates()` (role templates), `useRunbooks()` etc. — all backed by the shared
  `@/lib/use-async`. (A standalone `useAnalytics` was removed: the detail page loads
  analytics through `useRunbookDetail`.)

### UI
- **Home**: template picker (role cards, dashed Frame + accent hover) beside the existing
  create form; selecting a role calls `createRunbookFromTemplate`. `RunbookCard` keeps the progress bar, adds
  owner initials + priority dot.
- **Detail**: analytics header bar (4 stats) above the existing progress; items grouped by
  section with collapsible headers (chevron, 200ms); "Next milestone" `Frame` callout when
  set; `ItemRow` gains inline priority/category/due-date/blocked/owner tags (only when present).
- New components: `RunbookTemplates`, `AnalyticsBar`, `SectionHeader`, `NextMilestone`, `ItemMeta`.
- **States**: section-level empties (`ListChecks` dull icon), preserved loading spinners,
  item enter-fade via existing `Reveal` + stagger.
- **Checkbox behavior**: the status box is a **direct complete-toggle** (`todo → done`,
  `done → todo`; `doing` still exists in schema/types for future explicit "in progress"
  but is no longer cycled through by the box).
- **Mutation sync (no refresh flicker)**: item mutations (cycle / add / move / delete) are
  **optimistic** — the edge fn's returned row is applied locally via
  `applyItemLocally` / `swapLocal` / `removeItemLocally` in `useRunbookDetail`, so the
  list never full-reloads (no `Reveal` re-fade). `refresh()` is only used by the
  error-state Retry button. Analytics updates happen via a silent `refreshAnalyticsOnly()`
  (never touches the list).
### Non-goals (unchanged)
- No RBAC beyond existing per-org RLS; no notifications/cron (analytics computed on request);
  no DnD libs (reuse `sort_order` swap); no new top-level routes/pages; no new
  colors/fonts; no changes to waitlist (stores-only) or auth.

### Files affected (all under the existing module or this doc)
- Migration `20260101000006_module_onboardtime_workflow.sql`;
  `supabase/functions/onboardtime-{runbooks,items}/index.ts`; `src/lib/database.types.ts`;
  `src/modules/onboardtime/{types,api,templates,hooks/useRunbookDetail,useTemplates,useRunbooks}`;
  `src/modules/onboardtime/components/{OnboardtimeHome,ChecklistDetail,ItemRow,
  RunbookCard,RunbookTemplates,AnalyticsBar,SectionHeader,NextMilestone,ItemMeta}`.

### Verification
- `tsc -b` clean; `vite build` succeeds (the single >500kB chunk warning is pre-existing).
- **Not yet deployed to hosted Supabase.** To stage: `supabase functions deploy
  onboardtime-runbooks onboardtime-items` + `supabase db push`; then `deploy.sh --verify`
  (expect 10).

---

## Production deploy checklist (Vercel + Supabase hosted)

### Vercel (live: https://snipedev.vercel.app)
- Env vars (dashboard → your project → Settings → Environment Variables):
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
  Vercel serves real files (assets) before applying the rewrite — safe for a BrowserRouter SPA.
- Without it, any non-home path gives a filesystem **404** (e.g. `/auth/callback#access_token=…`).

### Supabase hosted (via Dashboard)
- **Authentication → URL Configuration**:
  - **Site URL** = `https://snipedev.vercel.app` (or a custom domain).
  - **Redirect URLs** include `https://snipedev.vercel.app/**` AND `http://localhost:5173/**` (local dev).
- **Authentication → Providers → GitHub**:
  - Client ID + secret from the GitHub OAuth app; callback `https://savvsjckbgtccqvgmooo.supabase.co/auth/v1/callback`.
- **Edge-function secrets**: set `SERVICE_ROLE_KEY` (JWT from Dashboard → Settings → API) on `onboardtime-bootstrap` AND `prunblocker-bootstrap` — required for personal-org provisioning.
- Apply pending migrations + deploy edge functions once from the CLI:
  `supabase db push` + `supabase functions deploy` for each of the 10 functions in
  `scripts/deploy.sh` (then `deploy.sh --verify`, expect 10).

### Login/OAuth flow (post-fix)
1. `/login` → GitHub → Supabase → redirect to `https://snipedev.vercel.app/auth/callback#access_token=…`
2. `vercel.json` rewrite serves `index.html` → `AuthCallback` runs →
   `detectSessionInUrl` exchanges the fragment → forwards `/app/modules`.

### ⚠️ Token hygiene
`#access_token=…&refresh_token=…&provider_token=gho_/ghr_…` are LIVE credentials shown in
the URL bar. Revoke any leaked sessions via Supabase Dashboard (Authentication → Users →
Revoke sessions) and GitHub (Settings → Applications → Revoke the OAuth grant).