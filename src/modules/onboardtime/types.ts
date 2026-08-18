import type {
  ChecklistItemRow,
  ChecklistTemplateRow,
} from '@/lib/database.types';

/*
 * Domain types for Onboardtime. Table rows are mirrored from the
 * `module_onboardtime` schema (see supabase/migrations/*module_onboardtime*).
 */

export type Checklist = ChecklistTemplateRow;
export type ChecklistItem = ChecklistItemRow;

export type ChecklistStatus = ChecklistItem['status'];

export const CHECKLIST_STATUSES: ChecklistStatus[] = ['todo', 'doing', 'done'];