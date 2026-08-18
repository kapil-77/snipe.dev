import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/*
 * SectionHeading — the ossium-style heading block:
 * dashed-chip eyebrow flanked by hairlines + dots, then a display title
 * (text-3xl → 4xl → [2.75rem], tight tracking, 1.15 leading) and a sub.
 */
interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  align?: 'center' | 'left';
  id?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
  align = 'center',
  id,
}: SectionHeadingProps) {
  const centered = align === 'center';
  return (
    <div
      className={cn(
        'mb-10 flex flex-col sm:mb-12',
        centered ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      <div className="mb-3 inline-flex items-center gap-2 px-6 sm:gap-3 sm:px-0">
        <span
          aria-hidden="true"
          className={cn('h-px w-10 bg-gradient-to-l from-edge to-transparent sm:w-16', !centered && 'hidden')}
        />
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full border border-edge bg-transparent" />
        <span className="inline-flex h-7 items-center border border-edge bg-base px-4 text-sm normal-case tracking-[0.16em] text-ink">
          {eyebrow}
        </span>
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full border border-edge bg-transparent" />
        <span
          aria-hidden="true"
          className={cn('h-px w-10 bg-gradient-to-r from-edge to-transparent sm:w-20', !centered && 'hidden')}
        />
      </div>
      <h2
        id={id}
        className="max-w-3xl text-pretty text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-[2.75rem]"
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'mt-3 max-w-xl text-sm font-normal leading-relaxed text-faint',
            centered && 'mx-auto text-center',
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}