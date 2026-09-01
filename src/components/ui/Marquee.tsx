import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/lib/cn';

/*
 * Marquee - continuous horizontal loop for the brands strip. Renders the
 * children several times (4 copies by default) in one row and translates by
 * exactly one copy width, so the loop restarts with no visible seam or gap
 * between the last and first brand. Edge fading applied with an inline mask
 * (kept looping under reduced motion via the globals exception).
 */
interface MarqueeProps {
  children: ReactNode;
  className?: string;
  /** seconds per full loop */
  duration?: number;
  /** how many copies of the children sit side by side (two or more) */
  copies?: number;
}

export function Marquee({
  children,
  className,
  duration = 26,
  copies = 4,
}: MarqueeProps) {
  const style = {
    animationDuration: `${duration}s`,
    '--marquee-shift': `${(-100 / copies).toFixed(4)}%`,
  } as CSSProperties;

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
      <div className="flex w-max animate-marquee will-change-transform" style={style}>
        {Array.from({ length: copies }).map((_, i) => (
          <ul key={i} aria-hidden={i > 0} className="flex shrink-0 items-center">
            {children}
          </ul>
        ))}
      </div>
    </div>
  );
}