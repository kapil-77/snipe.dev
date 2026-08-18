/*
 * Design-system entry point for scroll reveals.
 * Implementation lives in src/hooks/use-in-view.tsx (IntersectionObserver,
 * 200ms ease-out fade + slide-up); re-exported here so every module and
 * shell component imports ONE primitive from @/components/ui.
 */
export { Reveal, useInView } from '@/hooks/use-in-view';
export type { RevealProps } from '@/hooks/use-in-view';
