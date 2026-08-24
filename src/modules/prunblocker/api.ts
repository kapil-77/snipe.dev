import { probeEdgeFunction, type ProbeResult } from '@/lib/api';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

import type {
  EvaluationResult,
  GateDraft,
  MergeGate,
  PrEvaluation,
  PrReport,
  WorkspaceOrg,
} from './types';

/*
 * API surface for the PR Unblocker module.
 *
 * ISOLATION RULE: every request here talks to a `prunblocker-*` edge
 * function that only touches the `module_prunblocker` schema. No other
 * module is ever imported here, and the browser never queries tables
 * directly — RLS does the gating inside the edge functions.
 */

/** Every function owned by this module (mirrors /supabase/functions). */
export const PR_UNBLOCKER_FUNCTIONS = [
  'prunblocker-hello',
  'prunblocker-bootstrap',
  'prunblocker-gates',
  'prunblocker-evaluate',
  'prunblocker-webhook',
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
  }>('prunblocker-bootstrap', { method: 'POST' });
  return {
    orgId: result.orgId,
    orgName: result.orgName,
    userEmail: result.user.email,
  };
}

/* ------------------------------------------------------------------ */
/*  merge gates                                                        */
/* ------------------------------------------------------------------ */

export async function listGates(orgId: string): Promise<MergeGate[]> {
  return invoke<MergeGate[]>('prunblocker-gates', {
    method: 'GET',
    query: { org_id: orgId },
  });
}

/** Map a human GateDraft into snake_case edge-fn fields. */
function serializeDraft(draft: GateDraft) {
  return {
    repo: draft.repo,
    source_branch: draft.sourceBranch ?? '.*',
    target_branch: draft.targetBranch ?? '(main|master)',
    required_checks: draft.requiredChecks ?? [],
    require_review: draft.requireReview ?? true,
    block_on_conflicts: draft.blockOnConflicts ?? true,
  };
}

export async function createGate(orgId: string, draft: GateDraft): Promise<MergeGate> {
  return invoke<MergeGate>('prunblocker-gates', {
    method: 'POST',
    body: { org_id: orgId, ...serializeDraft(draft) },
  });
}

export interface GatePatch {
  repo?: string;
  sourceBranch?: string;
  targetBranch?: string;
  requiredChecks?: string[];
  requireReview?: boolean;
  blockOnConflicts?: boolean;
  enabled?: boolean;
}

/** PATCH a gate — pass `enabled` to toggle enforcement without editing fields. */
export async function updateGate(id: string, patch: GatePatch): Promise<MergeGate> {
  return invoke<MergeGate>('prunblocker-gates', {
    method: 'PATCH',
    body: {
      id,
      ...(patch.repo !== undefined ? { repo: patch.repo } : {}),
      ...(patch.sourceBranch !== undefined ? { source_branch: patch.sourceBranch } : {}),
      ...(patch.targetBranch !== undefined ? { target_branch: patch.targetBranch } : {}),
      ...(patch.requiredChecks !== undefined ? { required_checks: patch.requiredChecks } : {}),
      ...(patch.requireReview !== undefined ? { require_review: patch.requireReview } : {}),
      ...(patch.blockOnConflicts !== undefined ? { block_on_conflicts: patch.blockOnConflicts } : {}),
      ...(patch.enabled !== undefined ? { enabled: patch.enabled } : {}),
    },
  });
}

export async function deleteGate(id: string): Promise<void> {
  await invoke<{ ok: boolean }>('prunblocker-gates', {
    method: 'DELETE',
    query: { id },
  });
}

/* ------------------------------------------------------------------ */
/*  evaluation (run a PR through the gates)                            */
/* ------------------------------------------------------------------ */

/**
 * Run one enforcement evaluation for a real PR report. A `404 applies:false`
 * response is NOT an error (the repo/branches are simply out of gate scope)
 * — it is surfaced as `{ applies: false, reason }`.
 */
export async function evaluatePr(payload: PrReport & { org_id: string }): Promise<EvaluationResult> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase is not configured — add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to .env',
    );
  }

  const { data, error } = await supabase.functions.invoke<EvaluationResult>(
    'prunblocker-evaluate',
    {
      method: 'POST',
      body: JSON.stringify({
        org_id: payload.org_id,
        repo: payload.repo,
        source_branch: payload.sourceBranch,
        target_branch: payload.targetBranch,
        passed_checks: payload.passedChecks,
        review_approvals: payload.reviewApprovals ?? 0,
        has_conflicts: payload.hasConflicts ?? false,
      }),
    },
  );

  // Non-2xx with a JSON body: supabase-js exposes it as error.context.
  if (error) {
    const ctx = (error as { context?: unknown }).context;
    if (ctx && typeof ctx === 'object' && 'applies' in ctx) {
      const reason = (ctx as { reason?: unknown }).reason;
      return { applies: false, reason: typeof reason === 'string' ? reason : '' };
    }
    throw new Error(error.message ?? 'Evaluation failed');
  }

  return data as EvaluationResult;
}

/* ------------------------------------------------------------------ */
/*  evaluation history (audit trail readback)                          */
/* ------------------------------------------------------------------ */

/** Recent enforcement records — for the whole org or one gate. */
export async function listEvaluations(
  orgId: string,
  gateId?: string,
): Promise<PrEvaluation[]> {
  const query: Record<string, string> = { org_id: orgId };
  if (gateId) query.gate_id = gateId;
  return invoke<PrEvaluation[]>('prunblocker-evaluate', {
    method: 'GET',
    query,
  });
}

/* ------------------------------------------------------------------ */
/*  health probe                                                       */
/* ------------------------------------------------------------------ */

/** Warm-up / health probe against our own hello edge function. */
export async function pingPrunblocker(): Promise<ProbeResult> {
  return probeEdgeFunction('prunblocker-hello');
}

export type PrunblockerProbe = ProbeResult;