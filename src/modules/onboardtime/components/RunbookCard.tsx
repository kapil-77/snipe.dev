import { ListChecks, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { buttonClasses } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Runbook } from '../types';

interface RunbookCardProps {
  runbook: Runbook;
  onDelete: (id: string) => void;
}

/** One onboarding runbook on the module home — dashed frame + progress. */
export function RunbookCard({ runbook, onDelete }: RunbookCardProps) {
  const pct =
    runbook.itemCount > 0
      ? Math.round((runbook.itemDone / runbook.itemCount) * 100)
      : 0;

  return (
    <Card className="flex flex-col">
      <div className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="grid size-10 shrink-0 place-items-center border border-line bg-raised text-accent">
            <ListChecks className="size-5" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={() => onDelete(runbook.id)}
            aria-label={`Delete runbook “${runbook.title}”`}
            className="grid size-8 shrink-0 place-items-center border border-line text-faint transition-colors duration-200 ease-out hover:border-warning/60 hover:text-warning"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>

        <h3 className="mt-4 text-base font-bold tracking-tight text-white">
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
              className="h-full bg-accent transition-[width] duration-200 ease-out"
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