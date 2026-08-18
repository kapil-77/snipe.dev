import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type BadgeTone = 'accent' | 'muted' | 'warning' | 'line';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  dot?: boolean;
}

const TONES: Record<BadgeTone, string> = {
  accent: 'border-accent/40 bg-accent-soft text-accent-bright',
  muted: 'border-edge bg-raised text-muted',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  line: 'border-line text-faint',
};

/** Small square-cornered status chip (`coming soon`, `free`, `~env`…). */
export function Badge({ children, tone = 'muted', className, dot = false }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 border px-2.5 text-[11px] font-semibold uppercase tracking-[0.14em]',
        TONES[tone],
        className,
      )}
    >
      {dot && <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}