<div align="center">

# `snipe.dev`

### **Dev tools that ship as sealed modules.**

Onboard engineers, control pull requests, and keep environments aligned —
with one login and isolated boundaries by design.

<br />

[![Live](https://img.shields.io/badge/Live-snipedev.vercel.app-09AE5B?style=flat-square)](https://snipedev.vercel.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## The idea

`snipe.dev` is a modular developer-tools workspace.

Instead of building one giant shared backend, every tool is treated as a **sealed module**:

```text
                    ┌──────────────────────┐
                    │      snipe.dev       │
                    │   one auth surface   │
                    └──────────┬───────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
   │ Onboardtime │      │ PR Unblocker │      │   Envsync   │
   ├─────────────┤      ├─────────────┤      ├─────────────┤
   │ own schema  │      │ own schema  │      │ own schema  │
   │ own RLS     │      │ own RLS     │      │ own RLS     │
   │ own edge fn │      │ own edge fn │      │ own edge fn │
   └─────────────┘      └─────────────┘      └─────────────┘
```

**One module → one Postgres schema → one RLS boundary → one set of Edge Functions.**

That makes new tools additive instead of invasive.

---

## ✦ What ships inside

| Module | Status | What it does |
|---|:---:|---|
| **Onboardtime** | 🟢 Live | Role-based onboarding checklists, owners, milestones & progress |
| **PR Unblocker** | ⚪ Soon | Merge gates, review requirements, blocking checks & conflict locks |
| **Envsync** | ⚪ Soon | Environment variables, rotation & encrypted delivery |

### Architecture at a glance

```text
                         Supabase
                            │
                ┌───────────┴───────────┐
                │       public          │
                │ users · orgs · waitlist│
                └───────────┬───────────┘
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
       ▼                    ▼                    ▼
 module_onboardtime   module_prunblocker   module_envsync
       │                    │                    │
       ▼                    ▼                    ▼
 Edge Functions        Edge Functions        Edge Functions
       │                    │                    │
      RLS                  RLS                  RLS
```

> **Shared identity. Isolated data. Independent evolution.**

---

## ◉ Interface

<p align="center">
  <img src="image.png" alt="snipe.dev landing page" width="900" />
</p>


<p align="center">
  <img src="image-1.png" alt="snipe.dev modules page" width="900" />
</p>

---

## Stack

```text
Frontend       React 19 · TypeScript 5.9 · Vite 8
UI             Tailwind CSS 4 · Lucide React
Routing        React Router 7
Backend        Supabase Postgres · Auth · Edge Functions
Security       RLS · module-level schema isolation
Deployment     Vercel + Supabase
```

### Why the architecture is interesting

- **Schema isolation** — module data does not live in one shared bucket.
- **RLS from day one** — access policies are part of the data model.
- **Module boundaries** — each tool owns its schema and Edge Functions.
- **Shared identity** — one authentication surface across the workspace.
- **Additive growth** — activating a new module does not require rewriting existing migrations.
- **Template-ready** — new modules can follow the same isolated structure.

---

## `module → ship`

Adding a tool follows a predictable path:

```text
01  Create module schema
        ↓
02  Add RLS + module migrations
        ↓
03  Add Edge Functions
        ↓
04  Register module + route
        ↓
05  Ship without touching existing modules
```

This is the core design constraint behind the project.

---

## Local setup

```bash
git clone https://github.com/kapil-77/snipe.dev.git
cd snipe.dev

npm install
npm run dev
```

For the hosted Supabase setup, copy:

```text
.env.example → .env
```

and provide your Supabase URL + public anon key.

Build:

```bash
npm run build
```

---

## Project map

```text
src/
├── app/             # router, providers, auth
├── shell/           # navigation, layouts, workspace
├── components/ui/   # reusable design system
├── modules/         # onboardtime · prunblocker · envsync
├── lib/             # Supabase, registry, API/types
├── hooks/           # reusable hooks
└── styles/          # design tokens

supabase/
├── functions/       # module Edge Functions
└── migrations/      # public + module schemas
```
---

<div align="center">

### Built to add tools without adding chaos.

**snipe.dev** · modular developer infrastructure

[Live App](https://snipedev.vercel.app/) · [Repository](https://github.com/kapil-77/snipe.dev)

</div>
