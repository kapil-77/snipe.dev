import type {
  GithubInstallationRow,
  MergeGateRow,
  PrEvaluationRow,
  Verdict,
} from '@/lib/database.types';

/*
 * Domain types for PR Unblocker. Table rows are mirrored from the
 * `module_prunblocker` schema (see supabase/migrations/*module_prunblocker*).
 * The module API only talks to `prunblocker-*` edge functions.
 */

/** A declared merge gate (module_prunblocker.merge_gates). */
export type MergeGate = MergeGateRow;

/** A persisted enforcement audit record. */
export type PrEvaluation = PrEvaluationRow;

/** Reserved seam row for future GitHub App integration. */
export type GithubInstallation = GithubInstallationRow;

/** A merge policy: both toggles at once with a one-line description. */
export interface GatePolicy {
  requireReview: boolean;
  blockOnConflicts: boolean;
}

export type GateDraft = {
  repo: string;
  sourceBranch?: string;
  targetBranch?: string;
  requiredChecks?: string[];
  requireReview?: boolean;
  blockOnConflicts?: boolean;
  enabled?: boolean;
};

/** Input the UI collects for a single evaluation run. */
export type PrReport = {
  repo: string;
  sourceBranch: string;
  targetBranch: string;
  passedChecks: string[];
  reviewApprovals?: number;
  hasConflicts?: boolean;
};

/** Result of running an evaluation — the verdict + persisted record. */
export type EvaluationResult = {
  applies: boolean;
  reason?: string;
  gate?: MergeGate;
  verdict?: Verdict;
  blockedReasons?: string[];
  summary?: string;
  evaluation?: PrEvaluation;
};

export interface WorkspaceOrg {
  orgId: string;
  orgName: string;
  userEmail?: string;
}

export type GateStatus = 'enabled' | 'disabled';

export function getGateStatus(gate: Pick<MergeGate, 'enabled'>): GateStatus {
  return gate.enabled ? 'enabled' : 'disabled';
}

/* ------------------------------------------------------------------ */
/*  Domain label maps — keep UI strings out of the data layer          */
/* ------------------------------------------------------------------ */

export const VERDICT_LABELS: Record<Verdict, string> = {
  ready: 'ready to merge',
  blocked: 'merge blocked',
};

export const GATE_POLICY_OPTIONS: Array<{
  field: 'require_review' | 'block_on_conflicts';
  title: string;
  description: string;
}> = [
  {
    field: 'require_review',
    title: 'Require review',
    description: 'At least one approval before merge',
  },
  {
    field: 'block_on_conflicts',
    title: 'Conflict lock',
    description: 'Block merge while the PR has conflicts',
  },
];