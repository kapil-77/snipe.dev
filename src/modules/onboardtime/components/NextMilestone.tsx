import { GitPullRequest, Target } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Frame } from '@/components/ui/Frame';

interface NextMilestoneProps {
  title: string;
  dueOn?: string | null;
}

/** Prominent "next milestone / First PR" callout shown when a runbook has one. */
export function NextMilestone({ title, dueOn }: NextMilestoneProps) {
  return (
    <Frame className="w-full" innerClassName="h-full">
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div className="grid size-9 shrink-0 place-items-center border border-accent/50 bg-accent-soft text-accent-bright">
          <GitPullRequest className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
            Next milestone
          </p>
          <p className="mt-1 text-sm font-medium leading-snug text-ink">{title}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {dueOn && (
            <Badge tone="accent" dot>
              {dueOn}
            </Badge>
          )}
          <Target className="size-4 text-accent" aria-hidden="true" />
        </div>
      </div>
    </Frame>
  );
}