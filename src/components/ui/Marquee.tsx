import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/*
 * Marquee — CSS-only drift for the brands strip. Duplicates children
 * exactly once and slides -50%, pausing on hover. Edge fading applied
 * with an inline mask (respects prefers-reduced-motion via globals).
 */
interface MarqueeProps {
  children: ReactNode;
  className?: string;
  /** seconds per full loop */
  duration?: number;
}

export function Marquee({ children, className, duration = 42 }: MarqueeProps) {
  return (
    <div
      className={cn('group relative w-full overflow-hidden', className)}
      style={{
        maskImage:
          'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
      }}
    >
      <div
        className="flex w-max min-w-full animate-marquee motion-reduce:animate-none group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${duration}s` }}
      >
        <ul aria-hidden="false" className="flex min-w-full shrink-0 items-center">
          {children}
        </ul>
        <ul aria-hidden="true" className="flex min-w-full shrink-0 items-center">
          {children}
        </ul>
      </div>
    </div>
  );
}