import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { dashedLineStyle } from './Frame';

/*
 * Divider — the "-----" rule that separates major landing sections,
 * terminated by "+" corner marks at each end (blueprint crop marks).
 */
interface DividerProps {
  className?: string;
  /** Optional small centred label between the dashes (e.g. `05 / faq`). */
  label?: ReactNode;
  /** Vertical padding around the rule. */
  gap?: 'sm' | 'md' | 'lg';
}

const GAPS: Record<NonNullable<DividerProps['gap']>, string> = {
  sm: 'py-6',
  md: 'py-10',
  lg: 'py-14',
};

export function Divider({ className, label, gap = 'md' }: DividerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('relative mx-auto w-full max-w-[1280px] select-none', GAPS[gap], className)}
    >
      {label ? (
        <div className="flex items-center gap-4 px-6 md:px-8 lg:px-12">
          <span className="h-px flex-1" style={dashedLineStyle()} />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-faint">{label}</span>
          <span className="h-px flex-1" style={dashedLineStyle()} />
        </div>
      ) : (
        <>
          <span className="absolute inset-x-6 top-1/2 -translate-y-1/2 md:inset-x-10" style={dashedLineStyle()} />
          <span className="absolute left-0 top-1/2 -translate-y-1/2 bg-base px-1.5 text-[15px] font-light text-muted">
            +
          </span>
          <span className="absolute right-0 top-1/2 -translate-y-1/2 bg-base px-1.5 text-[15px] font-light text-muted">
            +
          </span>
        </>
      )}
    </div>
  );
}