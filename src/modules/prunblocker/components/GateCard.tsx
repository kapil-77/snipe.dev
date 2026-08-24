import { Check, GitPullRequest, ShieldAlert, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

import type { MergeGate } from '../types';

interface GateCardProps {
  gate: MergeGate;
  onDelete: (id: string) => void;
}

/** One declared merge gate on the module home — dashed frame + policy + status. */
export function GateCard({ gate, onDelete }: GateCardProps) {
  return (
    <Card className="flex flex-col">
      <div className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`grid size-10 shrink-0 place-items-center border border-line ${
              gate.enabled ? 'bg-accent-soft text-accent-bright' : 'bg-raised text-faint'
            }`}
          >
            {gate.enabled ? (
              <Check className="size-5" aria-hidden="true" />
            ) : (
              <GitPullRequest className="size-5" aria-hidden="true" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={gate.enabled ? 'accent' : 'muted'}>
              {gate.enabled ? 'enforcing' : 'paused'}
            </Badge>
            <button
              type="button"
              onClick={() => onDelete(gate.id)}
              aria-label={`Delete gate for ${gate.repo}`}
              className="grid size-8 shrink-0 place-items-center border border-line text-faint transition-colors duration-200 ease-out hover:border-warning/60 hover:text-warning"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <h3 className="mt-4 text-base font-bold tracking-tight text-white">{gate.repo}</h3>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-faint">
          <GitPullRequest className="size-3.5" aria-hidden="true" />
          <code className="text-muted">{gate.source_branch}</code>
          <span aria-hidden="true">→</span>
          <code className="text-muted">{gate.target_branch}</code>
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {gate.require_review && <Badge tone="line">review</Badge>}
          {gate.block_on_conflicts && (
            <span className="inline-flex items-center gap-1 border border-edge px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-faint">
              <ShieldAlert className="size-3" aria-hidden="true" />
              conflict lock
            </span>
          )}
          {gate.required_checks.map((check) => (
            <code key={check} className="border border-edge px-1.5 py-0.5 text-xs text-muted">
              {check}
            </code>
          ))}
        </div>

        <Link
          to={`/app/modules/prunblocker/${gate.id}`}
          className={buttonClasses('outline', 'sm', 'mt-5 w-full')}
        >
          Inspect gate
        </Link>
      </div>
    </Card>
  );
}