import { CheckCircle2, GitPullRequest, ListChecks, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Runbook } from '../types';
import { getRunbookStatus, ROLE_LABELS } from '../types';

interface RunbookCardProps {
  runbook: Runbook;
  onDelete: (id: string) => void;
}

const STATUS_TONE: Record<string, 'muted' | 'accent' | 'warning'> = {
  'not-started': 'muted',
  'in-progress': 'accent',
  blocked: 'warning',
  complete: 'accent',
};

/** One onboarding runbook on the module home — dashed frame + status + progress. */
export function RunbookCard({ runbook, onDelete }: RunbookCardProps) {
  const pct =
    runbook.itemCount > 0
      ? Math.round((runbook.itemDone / runbook.itemCount) * 100)
      : 0;
  const status = getRunbookStatus(runbook);

  return (
    <Card className="flex flex-col">
      <div className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="grid size-10 shrink-0 place-items-center border border-line bg-raised text-accent">
            {status === 'complete' ? (
              <CheckCircle2 className="size-5" aria-hidden="true" />
            ) : (
              <ListChecks className="size-5" aria-hidden="true" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={STATUS_TONE[status] ?? 'muted'}>{status}</Badge>
            <button
              type="button"
              onClick={() => onDelete(runbook.id)}
              aria-label={`Delete runbook “${runbook.title}”`}
              className="grid size-8 shrink-0 place-items-center border border-line text-faint transition-colors duration-200 ease-out hover:border-warning/60 hover:text-warning"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {runbook.is_template ? (
            <Badge tone="line">template</Badge>
          ) : (
            runbook.role && <Badge tone="muted">{ROLE_LABELS[runbook.role]}</Badge>
          )}
          {runbook.next_milestone && (
            <span className="inline-flex items-center gap-1 text-[11px] text-accent-bright">
              <GitPullRequest className="size-3.5" aria-hidden="true" />
              {runbook.next_milestone}
            </span>
          )}
        </div>

        <h3 className="mt-3 text-base font-bold tracking-tight text-white">
          {runbook.title}
        </h3>
        {runbook.description && (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
            {runbook.description}
          </p>
        )}

        <div className="mt-5">
          <div className="flex items-center justify-between text-[11px] text-faint">
            <span>
              {runbook.itemDone} / {runbook.itemCount} done
            </span>
            <span>{pct}%</span>
          </div>
          <div aria-hidden="true" className="mt-1 h-1 w-full bg-raised">
            <div
              className={`h-full transition-[width] duration-200 ease-out ${
                status === 'blocked' ? 'bg-warning' : 'bg-accent'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <Link
          to={`/app/modules/onboardtime/${runbook.id}`}
          className={buttonClasses('outline', 'sm', 'mt-5 w-full')}
        >
          Open runbook
        </Link>
      </div>
    </Card>
  );
}