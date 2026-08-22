import { CalendarDays, User, AlertTriangle } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

import type { ChecklistItem } from '../types';
import { PRIORITY_LABELS } from '../types';

interface ItemMetaProps {
  item: ChecklistItem;
}

const PRIORITY_TONE: Record<ChecklistItem['priority'], 'muted' | 'warning' | 'accent'> = {
  low: 'muted',
  medium: 'muted',
  high: 'warning',
};

/**
 * Inline item tags — priority + category + due date + owner. Renders nothing
 * when the item has no supplementary fields, so the minimal row stays clean.
 */
export function ItemMeta({ item }: ItemMetaProps) {
  const hasMeta =
    item.category != null ||
    item.due_on != null ||
    item.owner_id != null ||
    item.priority !== 'medium';
  if (!hasMeta) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {item.priority !== 'medium' && (
        <Badge tone={PRIORITY_TONE[item.priority]}>{PRIORITY_LABELS[item.priority]}</Badge>
      )}
      {item.category && (
        <span className="inline-flex items-center gap-1 border border-edge px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-faint">
          {item.category}
        </span>
      )}
      {item.due_on && (
        <span className="inline-flex items-center gap-1 text-[11px] text-ink">
          <CalendarDue date={item.due_on} />
        </span>
      )}
      {item.owner_id && (
        <span
          title="Assigned"
          className="inline-flex size-5 items-center justify-center border border-edge bg-raised text-faint"
        >
          <User className="size-3" aria-hidden="true" />
        </span>
      )}
      {item.blocked && <AlertTriangle className="size-3.5 text-warning" aria-hidden="true" />}
    </div>
  );
}

const DATE_FMT = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

function CalendarDue({ date }: { date: string }) {
  const d = new Date(`${date}T00:00:00`);
  const past = Number.isFinite(d.getTime()) && d < new Date(new Date().toDateString());
  return (
    <span className={cn('inline-flex items-center gap-1', past && 'text-warning')}>
      <CalendarDays className="size-3.5" aria-hidden="true" />
      {Number.isFinite(d.getTime()) ? DATE_FMT.format(d) : String(date)}
    </span>
  );
}