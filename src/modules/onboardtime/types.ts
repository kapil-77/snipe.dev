import type {
  ChecklistItemRow,
  ChecklistTemplateRow,
} from '@/lib/database.types';

/*
 * Domain types for Onboardtime. Table rows are mirrored from the
 * `module_onboardtime` schema (see supabase/migrations/*module_onboardtime*).
 * The module API only talks to `onboardtime-*` edge functions.
 */

/** A checklist / runbook, enriched with progress counts by the runbooks fn. */
export type Runbook = ChecklistTemplateRow & {
  itemCount: number;
  itemDone: number;
};

export type RunbookDraft = {
  title: string;
  description?: string | null;
};

export type ChecklistItem = ChecklistItemRow;

export type ItemStatus = ChecklistItem['status'];

export const ITEM_STATUSES: ItemStatus[] = ['todo', 'doing', 'done'];

export type ItemDraft = { title: string };

export interface WorkspaceOrg {
  orgId: string;
  orgName: string;
  userEmail?: string;
}