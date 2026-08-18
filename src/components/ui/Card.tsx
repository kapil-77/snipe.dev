import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { Frame } from './Frame';

/*
 * Card — dashed blueprint outline (Frame) around arbitrary content.
 * Hover: subtle scale + accent border-glow (no colour flash, no gradients).
 */
interface CardProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  hover?: boolean;
  /** Render the card in a visually muted state (used by coming-soon). */
  muted?: boolean;
  knockout?: string;
}

export function Card({
  children,
  className,
  innerClassName,
  hover = true,
  muted = false,
  knockout,
}: CardProps) {
  return (
    <Frame
      className={cn(
        'h-full',
        hover &&
          'transition-[transform,box-shadow] duration-200 ease-out hover:scale-[1.02] hover:shadow-accent-glow',
        muted && 'opacity-70 saturate-[0.6]',
        className,
      )}
      innerClassName={cn('h-full', innerClassName)}
      knockout={knockout}
      cornerClass={cn(muted && 'opacity-70')}
    >
      {children}
    </Frame>
  );
}