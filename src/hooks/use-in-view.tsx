import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { cn } from '@/lib/cn';

/**
 * Scroll-triggered reveal.
 *
 * Mirrors the fade + slide-up behaviour used on manixh.dev (IntersectionObserver,
 * threshold-driven, no libraries), tuned to the brief: 150–250ms, ease-out,
 * subtle 16px rise. Elements reveal once and stay revealed.
 */
export function useInView<T extends HTMLElement>(
  options: { threshold?: number; rootMargin?: string } = {},
) {
  const { threshold = 0.15, rootMargin = '0px 0px -10% 0px' } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin]);

  return { ref, inView };
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms (e.g. dividers of a grid). */
  delay?: number;
  translate?: string;
  style?: CSSProperties;
}

export type { RevealProps };

export function Reveal({
  children,
  className,
  delay = 0,
  translate = 'translate-y-4',
  style,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn(
        'transition-[opacity,transform] duration-200 ease-out will-change-transform',
        !inView ? `opacity-0 ${translate}` : 'opacity-100 translate-y-0',
        className,
      )}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}