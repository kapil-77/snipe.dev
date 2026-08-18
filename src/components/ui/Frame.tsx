import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { DASHED } from '@/lib/constants';

/*
 * Frame — the signature snipe.dev surface.
 *
 * Implementation faithfully extracted from ossium.in:
 *  - the dashed "-----" outline is drawn with four stacked
 *    `repeating-linear-gradient` layers (no border-image, no SVG),
 *  - every corner carries a literal "+" glyph, absolutely positioned and
 *    translated (-50%,-50%) onto the corner point, with a small knockout
 *    padding box that hides the dashes behind it.
 */

export type CornerPlacement =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export type FrameEdges = 'all' | 'horizontal' | 'vertical' | 'none';

export function dashedBorderStyle(edges: FrameEdges = 'all'): CSSProperties {
  const { color, on, off, thickness } = DASHED;
  const seg = `${color} 0 ${on}px, transparent ${on}px ${on + off}px`;
  const horizontal = `repeating-linear-gradient(90deg, ${seg})`;
  const vertical = `repeating-linear-gradient(180deg, ${seg})`;

  const layers: string[] = [];
  const sizes: string[] = [];
  const positions: string[] = [];
  const repeats: string[] = [];

  if (edges === 'all' || edges === 'horizontal') {
    layers.push(horizontal, horizontal);
    sizes.push(`100% ${thickness}px`, `100% ${thickness}px`);
    positions.push('top left', 'bottom left');
    repeats.push('repeat-x', 'repeat-x');
  }
  if (edges === 'all' || edges === 'vertical') {
    layers.push(vertical, vertical);
    sizes.push(`${thickness}px 100%`, `${thickness}px 100%`);
    positions.push('top left', 'top right');
    repeats.push('repeat-y', 'repeat-y');
  }
  if (layers.length === 0) return {};

  return {
    backgroundImage: layers.join(', '),
    backgroundSize: sizes.join(', '),
    backgroundPosition: positions.join(', '),
    backgroundRepeat: repeats.join(', '),
  };
}

export function dashedLineStyle(): CSSProperties {
  const { color, on, off, thickness } = DASHED;
  return {
    height: thickness,
    backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 ${on}px, transparent ${on}px ${on + off}px)`,
  };
}

interface CornerMarkProps {
  placement: CornerPlacement;
  knockout?: string;
  className?: string;
}

export function CornerMark({ placement, knockout = 'var(--color-base)', className }: CornerMarkProps) {
  const y = placement.startsWith('bottom') ? { bottom: 0 } : { top: 0 };
  const x = placement.endsWith('right') ? { right: 0 } : { left: 0 };
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute z-20 select-none font-light leading-none text-muted',
        className,
      )}
      style={{
        ...y,
        ...x,
        transform: 'translate(-50%, -50%)',
        padding: 5,
        backgroundColor: knockout,
        fontSize: 15,
      }}
    >
      +
    </span>
  );
}

interface FrameProps {
  children?: ReactNode;
  className?: string;
  innerClassName?: string;
  edges?: FrameEdges;
  /** Set to false to drop all four "+" corner marks (e.g. tiny logo glyphs). */
  corners?: boolean;
  cornerClass?: string;
  /** Background behind corner glyphs — defaults to the page base so the
   *  "+" axes cleanly re-cut the dashed lines. */
  knockout?: string;
}

export function Frame({
  children,
  className,
  innerClassName,
  edges = 'all',
  corners = true,
  cornerClass,
  knockout,
}: FrameProps) {
  return (
    <div className={cn('relative', className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={dashedBorderStyle(edges)}
      />
      {corners && (
        <>
          <CornerMark placement="top-left" knockout={knockout} className={cornerClass} />
          <CornerMark placement="top-right" knockout={knockout} className={cornerClass} />
          <CornerMark placement="bottom-left" knockout={knockout} className={cornerClass} />
          <CornerMark placement="bottom-right" knockout={knockout} className={cornerClass} />
        </>
      )}
      <div className={cn('relative', innerClassName)}>{children}</div>
    </div>
  );
}