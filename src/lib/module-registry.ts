import { FileKey, GitPullRequest, Route, type LucideIcon } from 'lucide-react';

export type ModuleStatus = 'coming-soon' | 'live';

/**
 * Single source of truth for every product module.
 *
 * The /src/modules/<name> folders must never import another module —
 * this registry (in /lib, shared) is the only place the whole list is
 * assembled, mirroring the Supabase schema-isolation convention.
 */
export interface ModuleDef {
  /** URL slug + waitlist key. */
  slug: string;
  name: string;
  /** Terminal-style identifier shown in generous margins. */
  handle: string;
  icon: LucideIcon;
  tagline: string;
  /** One-line description shown on landing cards. */
  description: string;
  status: ModuleStatus;
  /** Postgres schema owned exclusively by this module. */
  schema: string;
  /** Every Supabase Edge Function owned by this module starts with this. */
  edgePrefix: string;
  /** Display order in sidebar/grid. */
  order: number;
}

export const MODULES: ModuleDef[] = [
  {
    slug: 'onboardtime',
    name: 'Onboardtime',
    handle: '~/onboardtime',
    icon: Route,
    tagline: 'Onboarding checklists & runbooks',
    description:
      'Per-role checklists with owners, due milestones and progress tracking, so new team members ship their first task faster.',
    status: 'live',
    schema: 'module_onboardtime',
    edgePrefix: 'onboardtime-',
    order: 0,
  },
  {
    slug: 'prunblocker',
    name: 'PR Unblocker',
    handle: '~/prunblocker',
    icon: GitPullRequest,
    tagline: 'Merge-ready gates for pull requests',
    description:
      'Declare merge policies — blocking checks, review requirements, conflict locks — enforced the moment a PR leaves draft.',
    status: 'live',
    schema: 'module_prunblocker',
    edgePrefix: 'prunblocker-',
    order: 1,
  },
  {
    slug: 'envsync',
    name: 'Envsync',
    handle: '~/envsync',
    icon: FileKey,
    tagline: 'Environment variables, synced',
    description:
      'Declare .env keys per environment, rotate values once, and ship encrypted variables to every platform your team uses.',
    status: 'coming-soon',
    schema: 'module_envsync',
    edgePrefix: 'envsync-',
    order: 2,
  },
];

export function getModule(slug: string | undefined): ModuleDef | undefined {
  return MODULES.find((m) => m.slug === slug);
}

export function getLiveModules(): ModuleDef[] {
  return MODULES.filter((m) => m.status === 'live');
}

/**
 * Scaffolded table inventory per module (mirrors supabase/migrations/*.sql).
 * Shared by the module blueprint screens — single source of truth.
 */
export const MODULE_TABLES: Record<string, string[]> = {
  onboardtime: ['checklists', 'checklist_items'],
  prunblocker: ['merge_gates', 'pr_evaluations', 'github_installations'],
  envsync: ['environment_vars'],
};

/** Stub edge functions scaffolded per module. */
export const MODULE_FUNCTIONS: Record<string, string[]> = {
  onboardtime: [
    'onboardtime-hello',
    'onboardtime-bootstrap',
    'onboardtime-runbooks',
    'onboardtime-items',
  ],
  prunblocker: [
    'prunblocker-hello',
    'prunblocker-bootstrap',
    'prunblocker-gates',
    'prunblocker-evaluate',
    'prunblocker-webhook',
  ],
  envsync: ['envsync-hello'],
};