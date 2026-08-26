import type { TemplateRole } from '@/lib/database.types';
import { invokeEdgeFn } from '@/lib/edge-fn';

import { templateItemsForRole } from './templates';
import type {
  ChecklistItem,
  ItemDraft,
  ItemStatus,
  Runbook,
  RunbookAnalytics,
  RunbookDraft,
  WorkspaceOrg,
} from './types';
import { ROLE_LABELS } from './types';

/*
 * API surface for the Onboardtime module.
 *
 * ISOLATION RULE: every request here talks to an `onboardtime-*` edge
 * function that only touches the `module_onboardtime` schema. No other
 * module is ever imported here, and the browser never queries tables
 * directly — RLS does the gating inside the edge functions.
 */

/* ------------------------------------------------------------------ */
/*  bootstrap                                                          */
/* ------------------------------------------------------------------ */

export async function bootstrapOrg(): Promise<WorkspaceOrg> {
  const result = await invokeEdgeFn<{
    orgId: string;
    orgName: string;
    user: { id: string; email: string };
  }>('onboardtime-bootstrap', { method: 'POST' });
  return {
    orgId: result.orgId,
    orgName: result.orgName,
    userEmail: result.user.email,
  };
}

/* ------------------------------------------------------------------ */
/*  runbooks                                                           */
/* ------------------------------------------------------------------ */

export async function listRunbooks(orgId: string): Promise<Runbook[]> {
  return invokeEdgeFn<Runbook[]>('onboardtime-runbooks', {
    method: 'GET',
    query: { org_id: orgId },
  });
}

export async function createRunbook(
  orgId: string,
  draft: RunbookDraft,
): Promise<Runbook> {
  return invokeEdgeFn<Runbook>('onboardtime-runbooks', {
    method: 'POST',
    body: { org_id: orgId, ...draft },
  });
}

export async function deleteRunbook(id: string): Promise<void> {
  await invokeEdgeFn<{ ok: boolean }>('onboardtime-runbooks', {
    method: 'DELETE',
    query: { id },
  });
}

export interface RunbookPatch {
  title?: string;
  description?: string | null;
  role?: string | null;
  owner_id?: string | null;
  next_milestone?: string | null;
  next_milestone_due?: string | null;
}

export async function updateRunbook(id: string, patch: RunbookPatch): Promise<Runbook> {
  return invokeEdgeFn<Runbook>('onboardtime-runbooks', {
    method: 'PATCH',
    body: { id, ...patch },
  });
}

/**
 * Create a runbook from a TS-only role preset (templates.ts): creates the
 * checklist with the role, then bulk-inserts the preset's starter items.
 */
export async function createRunbookFromTemplate(
  orgId: string,
  role: TemplateRole,
): Promise<Runbook> {
  const runbook = await createRunbook(orgId, {
    title: `${ROLE_LABELS[role]} onboarding`,
    role,
  });
  const items = templateItemsForRole(role);
  for (const item of items) {
    await createItem(orgId, runbook.id, item);
  }
  return runbook;
}

/** Org-wide team analytics (active onboardings, avg completion, blockers). */
export async function getTeamAnalytics(orgId: string): Promise<RunbookAnalytics> {
  return invokeEdgeFn<RunbookAnalytics>('onboardtime-runbooks', {
    method: 'GET',
    query: { org_id: orgId, analytics: 'true' },
  });
}

/* ------------------------------------------------------------------ */
/*  checklist items                                                    */
/* ------------------------------------------------------------------ */

export async function listItems(
  orgId: string,
  checklistId: string,
): Promise<ChecklistItem[]> {
  return invokeEdgeFn<ChecklistItem[]>('onboardtime-items', {
    method: 'GET',
    query: { org_id: orgId, checklist_id: checklistId },
  });
}

export async function createItem(
  orgId: string,
  checklistId: string,
  draft: ItemDraft,
): Promise<ChecklistItem> {
  return invokeEdgeFn<ChecklistItem>('onboardtime-items', {
    method: 'POST',
    body: { org_id: orgId, checklist_id: checklistId, ...draft },
  });
}

export interface ItemPatch {
  title?: string;
  status?: ItemStatus;
  sort_order?: number;
  section?: ChecklistItem['section'];
  category?: string | null;
  priority?: ChecklistItem['priority'];
  blocked?: boolean;
  due_on?: string | null;
  owner_id?: string | null;
}

export async function updateItem(id: string, patch: ItemPatch): Promise<ChecklistItem> {
  return invokeEdgeFn<ChecklistItem>('onboardtime-items', {
    method: 'PATCH',
    body: { id, ...patch },
  });
}

export async function deleteItem(id: string): Promise<void> {
  await invokeEdgeFn<{ ok: boolean }>('onboardtime-items', {
    method: 'DELETE',
    query: { id },
  });
}