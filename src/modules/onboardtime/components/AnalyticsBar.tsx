import { Activity, Clock, Lock, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';

import type { RunbookAnalytics } from '../types';
import { SECTION_LABELS } from '../types';

interface Stat {
  icon: typeof Activity;
  label: string;
  value: string;
  hint?: string;
}

/*
 * Lightweight org-level analytics strip. Pure presentational — expects the
 * data already computed by the runbooks edge function analytics branch.
 */
export function AnalyticsBar({ data }: { data: RunbookAnalytics | null }) {
  if (!data) return null;

  const topBlocker = data.commonBlockers[0];
  const stats: Stat[] = [
    { icon: Activity, label: 'Active onboardings', value: String(data.activeOnboardings) },
    { icon: TrendingUp, label: 'Avg completion', value: `${data.avgCompletion}%` },
    {
      icon: Lock,
      label: 'Blocked tasks',
      value: String(data.blockedTasks),
      hint: data.blockedTasks > 0 ? 'Need a nudge' : undefined,
    },
    {
      icon: Clock,
      label: 'Common blocker',
      value: topBlocker ? SECTION_LABELS[topBlocker.section as keyof typeof SECTION_LABELS] ?? topBlocker.section : '—',
      hint: topBlocker ? `${topBlocker.count} task${topBlocker.count === 1 ? '' : 's'}` : 'None blocked',
    },
  ];

  return (
    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="border border-line bg-raised px-3 py-3"
        >
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-faint">
            <s.icon className="size-3.5" aria-hidden="true" />
            <span className="truncate">{s.label}</span>
          </div>
          <div className="mt-2 text-lg font-bold tracking-tight text-ink">{s.value}</div>
          {s.hint && (
            <div className="mt-1.5">
              <Badge tone={s.hint === 'critical' ? 'warning' : 'muted'}>{s.hint}</Badge>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}