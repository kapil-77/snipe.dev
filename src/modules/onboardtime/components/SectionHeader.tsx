import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/cn';

interface SectionHeaderProps {
  title: string;
  count: number;
  done: number;
  open: boolean;
  onToggle: () => void;
}

/** Collapsible onboarding-section header (Access, Dev Setup, …). */
export function SectionHeader({ title, count, done, open, onToggle }: SectionHeaderProps) {
  const pct = count > 0 ? Math.round((done / count) * 100) : 0;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center justify-between gap-3 border border-line bg-raised px-4 py-2.5 text-left transition-colors duration-200 ease-out hover:bg-hover"
    >
      <span className="flex min-w-0 items-center gap-2 text-sm font-semibold tracking-tight text-ink">
        {title}
        <span className="text-[11px] text-faint">
          {done}/{count}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span
          aria-hidden="true"
          className="h-1 w-16 bg-raised"
        >
          <span
            className="h-full bg-accent transition-[width] duration-200 ease-out"
            style={{ width: `${pct}%` }}
          />
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn('size-4 transition-transform duration-200 ease-out', open ? 'rotate-180' : '')}
        />
      </span>
    </button>
  );
}