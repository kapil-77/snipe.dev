# snipe.dev

Multi-module dev-tools SaaS shell. **One module = one Postgres schema = one set of
edge functions — isolated by default.**

Extracted design reference (from live sites): dark `#0E0F10` base, `#09AE5B` accent,
`#E5E5E5` text, `#444` dashed "-----" edges drawn as repeating-linear-gradients with
`+` corner marks (blueprint crop marks), Figtree typography.

## Stack

- Vite 8 + React 19 + TypeScript 5.9
- Tailwind CSS 4 (`@tailwindcss/vite`, tokens in `src/styles/globals.css`)
- React Router 7 · lucide-react icons
- Supabase (Auth email+GitHub, Postgres, Edge Functions/Deno)

## Commands

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build
npm run preview
```

## Structure

```
src/
  app/            router, providers, auth context, RequireAuth
  shell/          navbar, footer, sidebar, workspace layouts, module cards/pages
  components/ui/  design system: Frame (+ borders & + corners), Button, Input,
                  Accordion, Reveal (IO scroll animations), Marquee, …
  modules/        onboardtime · prunblocker · envsync (+ _template scaffold)
                  ⚠ module folders import ONLY from @/components/ui and @/lib
  lib/            supabase client, module registry, api probe, database types
  hooks/          use-in-view (reveal)
  styles/         globals.css — the entire design-token set
supabase/
  functions/      *_hello edge stubs (prefix = module schema name)
  migrations/     per-module SQL (public + module_*), RLS enabled from day one
```

## Supabase convention (must stay strict)

- Shared data lives ONLY in `public`: `users`, `orgs`, `org_members`, `waitlist`.
- Every module owns an isolated schema: `module_onboardtime`, `module_prunblocker`,
  `module_envsync`. No cross-schema FKs except `→ public.users(id)` / `→ public.orgs(id)`.
- Edge function name prefix matches the module schema (`onboardtime-hello`, …).
- RLS enabled on every table at creation; policies org-/user-scoped.
- Activating a "coming soon" module is additive: flip `status` in
  `src/lib/module-registry.ts`, register routes, build out — no migration rewrites.

## Local Supabase

```bash
supabase start
supabase db reset            # applies supabase/migrations/*
supabase functions serve     # edge functions on http://127.0.0.1:54321/functions/v1
```

Copy `.env.example` → `.env` with the local project URL + anon key (or the hosted
project equivalents). Without env vars the app runs in **demo mode** — landing + shell
work end-to-end; auth forms explain exactly what to configure.

## Placeholders

Brand strip names, testimonials and hero stats are clearly-marked placeholder copy —
swap for real content before launch.