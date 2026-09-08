import type { RouteObject } from 'react-router-dom';

import { lazyRouteElement } from '@/lib/lazy-route';

/**
 * Routes owned by the PR Unblocker module (live).
 * Registered by the app router under the authenticated workspace layout.
 *
 * The Home + Detail screens are lazily loaded via React 19's `lazy()` so the
 * module's UI (components, hooks, api + lucide icons) only downloads when the
 * user actually opens PR Unblocker — before this change, AppRoutes statically
 * imported every module and the whole app shipped as one ~564 kB chunk.
 */
export const prunblockerRoutes: RouteObject[] = [
  {
    path: 'modules/prunblocker',
    element: lazyRouteElement(() =>
      import('@/modules/prunblocker/components/PrunblockerHome').then((m) => ({
        default: m.PrunblockerHome,
      })),
    ),
  },
  {
    path: 'modules/prunblocker/:gateId',
    element: lazyRouteElement(() =>
      import('@/modules/prunblocker/components/GateDetail').then((m) => ({
        default: m.GateDetail,
      })),
    ),
  },
];