import {
  createElement,
  lazy,
  Suspense,
  type ComponentType,
  type JSXElementConstructor,
  type ReactElement,
} from 'react';

import { LoaderCircle } from 'lucide-react';

/*
 * React 19 lazy() route helper — shared by every module's routes.tsx.
 *
 * PROBLEM (pre-existing): App > AppRoutes statically imported every module's
 * components, so the ENTIRE UI (landing + shell + onboardtime + prunblocker +
 * their lucide icons + supabase-js) was one ~564 kB chunk — the recurring
 * ">500 kB" Vite warning.
 *
 * FIX: module routes defer loading their component subtree until the route is
 * first opened. Each routes.tsx passes a LITERAL `import('…')` loader to
 * lazyRouteElement; Vite's static analysis turns that into a separate chunk,
 * and React 19's `lazy()` (stable, typed as `lazy(load) → LazyExoticComponent`)
 * suspends rendering inside <Suspense> until the chunk arrives. Landing + auth
 * pages no longer download module UI at all.
 */

function chunkFallback(label: string): ReactElement {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
      <LoaderCircle className="size-7 animate-spin text-muted" aria-hidden="true" />
      <p className="text-sm text-faint">{label}…</p>
    </div>
  );
}

/**
 * Wrap a lazy-loaded component in the Suspense boundary it needs.
 *
 * `load` MUST be a closure over a literal `import('@/…')` path so Vite can emit
 * the chunk statically, and must resolve to `{ default: Component }` to satisfy
 * React 19's `lazy()` contract. Each call creates one lazy component that is
 * loaded at most once and cached thereafter.
 *
 * Why createElement and not JSX for `<LazyComp />`: the JSX type-checker
 * resolves component props through `LibraryManagedAttributes`, a conditional
 * that cannot reduce while the lazy component's type parameter is still generic
 * (TS2322: "'{}' is not assignable to ... Memo|Lazy<infer U> ..."). Building the
 * element with React.createElement(LazyComp, null) is EXACTLY what JSX compiles
 * `<LazyComp />` to at runtime — same behavior, type-checks cleanly. The cast is
 * contained here so route files stay free of it.
 */
export function lazyRouteElement(
  load: () => Promise<{ default: ComponentType<Record<string, never>> }>,
  label = 'Loading module',
): ReactElement {
  const LazyComp = lazy(load);
  const content = createElement(
    LazyComp as unknown as JSXElementConstructor<Record<string, never>>,
    null,
  );
  return createElement(Suspense, { fallback: chunkFallback(label) }, content);
}