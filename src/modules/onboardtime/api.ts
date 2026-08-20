import { probeEdgeFunction, type ProbeResult } from '@/lib/api';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

import type {
  ChecklistItem,
  ItemDraft,
  ItemStatus,
  Runbook,
  RunbookDraft,
  WorkspaceOrg,
} from './types';

/*
 * API surface for the Onboardtime module.
 *
 * ISOLATION RULE: every request here talks to an `onboardtime-*` edge
 * function that only touches the `module_onboardtime` schema. No other
 * module is ever imported here, and the browser never queries tables
 * directly — RLS does the gating inside the edge functions.
 */

/** Every function owned by this module (mirrors /supabase/functions). */
export const ONBOARD_TIME_FUNCTIONS = [
  'onboardtime-hello',
  'onboardtime-bootstrap',
  'onboardtime-runbooks',
  'onboardtime-items',
] as const;

interface InvokeInit {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string>;
}

async function invoke<T>(fn: string, init: InvokeInit = {}): Promise<T> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase is not configured — add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to .env',
    );
  }
  // The installed supabase-js ignores the `query` option in functions.invoke
  // (it builds the URL from the function name only). Build the query string
  // into the function name so org-scoped calls actually reach the function.
  let target = fn;
  if (init.query) target = `${fn}?${new URLSearchParams(init.query).toString()}`;

  const { data, error } = await supabase.functions.invoke<T>(target, {
    method: init.method ?? 'POST',
    ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
  });
  if (error) {
    throw new Error(error.message ?? 'Edge function call failed');
  }
  return data as T;
}

/* ------------------------------------------------------------------ */
/*  bootstrap                                                          */
/* ------------------------------------------------------------------ */

export async function bootstrapOrg(): Promise<WorkspaceOrg> {
  const result = await invoke<{
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
  return invoke<Runbook[]>('onboardtime-runbooks', {
    method: 'GET',
    query: { org_id: orgId },
  });
}

export async function createRunbook(
  orgId: string,
  draft: RunbookDraft,
): Promise<Runbook> {
  return invoke<Runbook>('onboardtime-runbooks', {
    method: 'POST',
    body: { org_id: orgId, ...draft },
  });
}

export async function deleteRunbook(id: string): Promise<void> {
  await invoke<{ ok: boolean }>('onboardtime-runbooks', {
    method: 'DELETE',
    query: { id },
  });
}

/* ------------------------------------------------------------------ */
/*  checklist items                                                    */
/* ------------------------------------------------------------------ */

export async function listItems(
  orgId: string,
  checklistId: string,
): Promise<ChecklistItem[]> {
  return invoke<ChecklistItem[]>('onboardtime-items', {
    method: 'GET',
    query: { org_id: orgId, checklist_id: checklistId },
  });
}

export async function createItem(
  orgId: string,
  checklistId: string,
  draft: ItemDraft,
): Promise<ChecklistItem> {
  return invoke<ChecklistItem>('onboardtime-items', {
    method: 'POST',
    body: { org_id: orgId, checklist_id: checklistId, ...draft },
  });
}

export interface ItemPatch {
  title?: string;
  status?: ItemStatus;
  sort_order?: number;
}

export async function updateItem(id: string, patch: ItemPatch): Promise<ChecklistItem> {
  return invoke<ChecklistItem>('onboardtime-items', {
    method: 'PATCH',
    body: { id, ...patch },
  });
}

export async function deleteItem(id: string): Promise<void> {
  await invoke<{ ok: boolean }>('onboardtime-items', {
    method: 'DELETE',
    query: { id },
  });
}

/* ------------------------------------------------------------------ */
/*  health probe                                                       */
/* ------------------------------------------------------------------ */

/** Warm-up / health probe against our own hello edge function. */
export async function pingOnboardtime(): Promise<ProbeResult> {
  return probeEdgeFunction('onboardtime-hello');
}

export type OnboardtimeProbe = ProbeResult;