import { GitPullRequest, History, LoaderCircle } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Frame } from '@/components/ui/Frame';

import type { PrEvaluation } from '../types';
import { VERDICT_LABELS } from '../types';

/*
 * Enforcement audit feed — the persisted proof that evaluations ran and what
 * they decided. Reads from module_prunblocker.pr_evaluations (written by the
 * evaluate edge fn, read back through the same fn — never a direct query).
 */

interface EvaluationFeedProps {
  evaluations: PrEvaluation[];
  loading?: boolean;
  error?: string | null;
  empty?: string;
  onRetry?: () => void;
}

const DATE_FMT = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? DATE_FMT.format(d) : String(iso);
}

export function EvaluationFeed({ evaluations, loading, error, empty, onRetry }: EvaluationFeedProps) {
  return (
    <Frame className="w-full">
      <div className="flex flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
            <History className="size-3.5 text-accent" aria-hidden="true" />
            Enforcement audit trail
          </div>
          {loading && <LoaderCircle className="size-4 animate-spin text-muted" aria-hidden="true" />}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {loading ? (
            <p className="text-xs text-faint">Loading recent evaluations…</p>
          ) : error ? (
            <div className="text-sm leading-relaxed text-warning">
              <p>{error}</p>
              {onRetry && (
                <button type="button" onClick={onRetry} className="mt-2 text-xs text-muted underline">
                  Retry
                </button>
              )}
            </div>
          ) : evaluations.length === 0 ? (
            <p className="text-xs leading-relaxed text-faint">{empty ?? 'No evaluations recorded yet.'}</p>
          ) : (
            evaluations.map((evaluation) => (
              <div
                key={evaluation.id}
                className={`border px-3 py-2.5 ${
                  evaluation.verdict === 'ready'
                    ? 'border-accent/40 bg-accent-soft'
                    : 'border-warning/40 bg-warning/10'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5 text-xs text-ink">
                    <GitPullRequest className="size-3.5 shrink-0" aria-hidden="true" />
                    <code className="whitespace-nowrap">{evaluation.repo}</code>
                    <span className="min-w-0 truncate">
                      {evaluation.source_branch} → {evaluation.target_branch}
                    </span>
                  </div>
                  <Badge tone={evaluation.verdict === 'ready' ? 'accent' : 'warning'} dot>
                    {VERDICT_LABELS[evaluation.verdict]}
                  </Badge>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-faint">
                  <span>
                    checks {evaluation.passed_checks.length}/{evaluation.required_checks.length}
                  </span>
                  {evaluation.required_reviews > 0 && <span>· review {evaluation.review_approvals}</span>}
                  {evaluation.has_conflicts && <span className="text-warning">· conflicts</span>}
                  <span>· {formatDate(evaluation.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Frame>
  );
}