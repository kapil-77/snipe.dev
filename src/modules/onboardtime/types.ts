import type {
  ChecklistItemRow,
  ChecklistTemplateRow,
  ItemPriority,
  ItemSection,
  TemplateRole,
} from '@/lib/database.types';

/*
 * Domain types for Onboardtime. Table rows are mirrored from the
 * `module_onboardtime` schema (see supabase/migrations/*module_onboardtime*).
 * The module API only talks to `onboardtime-*` edge functions.
 */

/** A checklist / runbook, enriched with progress + status by the runbooks fn. */
export type Runbook = ChecklistTemplateRow & {
  itemCount: number;
  itemDone: number;
  pct: number;
  blocked: boolean;
  allDone: boolean;
};

export type RunbookDraft = {
  title: string;
  description?: string | null;
  role?: TemplateRole | null;
  owner_id?: string | null;
  next_milestone?: string | null;
  next_milestone_due?: string | null;
};

export type ChecklistItem = ChecklistItemRow;

export type ItemStatus = ChecklistItem['status'];

export const ITEM_STATUSES: ItemStatus[] = ['todo', 'doing', 'done'];

export type ItemDraft = {
  title: string;
  section?: ItemSection;
  category?: string | null;
  priority?: ItemPriority;
  blocked?: boolean;
  due_on?: string | null;
  owner_id?: string | null;
};

export type RunbookAnalytics = {
  activeOnboardings: number;
  avgCompletion: number;
  blockedTasks: number;
  commonBlockers: Array<{ section: string; count: number }>;
};

export type RunbookStatus =
  | 'not-started'
  | 'in-progress'
  | 'blocked'
  | 'complete';

export function getRunbookStatus(runbook: Pick<Runbook, 'itemCount' | 'itemDone' | 'blocked' | 'allDone'>): RunbookStatus {
  if (runbook.allDone) return 'complete';
  if (runbook.itemCount === 0) return 'not-started';
  if (runbook.blocked) return 'blocked';
  if (runbook.itemDone > 0) return 'in-progress';
  return 'not-started';
}

/* ------------------------------------------------------------------ */
/*  Domain label maps — keep UI strings out of the data layer           */
/* ------------------------------------------------------------------ */

export const ROLE_LABELS: Record<TemplateRole, string> = {
  core: 'Core',
  frontend: 'Frontend',
  backend: 'Backend',
  qa: 'QA',
  designer: 'Designer',
  product: 'Product',
  custom: 'Custom',
};

export const SECTION_LABELS: Record<ItemSection, string> = {
  access: 'Access',
  'dev-setup': 'Development Setup',
  codebase: 'Codebase',
  team: 'Team',
  contribution: 'First Contribution',
  general: 'General',
};

export const PRIORITY_LABELS: Record<ItemPriority, string> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
};

export interface WorkspaceOrg {
  orgId: string;
  orgName: string;
  userEmail?: string;
}