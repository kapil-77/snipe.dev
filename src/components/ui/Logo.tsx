import { Link } from 'react-router-dom';

import { cn } from '@/lib/cn';

import { Frame } from './Frame';

/**
 * Wordmark: snipe.dev rendered under a small blueprint frame ("~/" caret).
 * Squares with the favicon.
 */
interface LogoProps {
  className?: string;
  to?: string;
}

export function Logo({ className, to = '/' }: LogoProps) {
  return (
    <Link
      to={to}
      aria-label="snipe.dev home"
      className={cn('group inline-flex items-center gap-2.5', className)}
    >
      <Frame
        corners={false}
        className="size-7 shrink-0"
        innerClassName="grid size-7 place-items-center"
      >
        <span aria-hidden="true" className="text-[13px] font-bold leading-none text-ink">
          ~/
        </span>
      </Frame>
      <span className="text-[15px] font-bold tracking-tight text-ink transition-colors duration-200 ease-out group-hover:text-white">
        snipe<span className="text-accent">.dev</span>
      </span>
    </Link>
  );
}