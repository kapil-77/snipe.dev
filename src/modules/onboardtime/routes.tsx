import type { RouteObject } from 'react-router-dom';

import { lazyRouteElement } from '@/lib/lazy-route';

/**
 * Routes owned by the Onboardtime module (live).
 * Registered by the app router under the authenticated workspace layout.
 *
 * The Home + Detail screens are lazily loaded via React 19's `lazy()` so the
 * module's UI (components, hooks, api + lucide icons) only downloads when the
 * user actually opens Onboardtime — before this change, AppRoutes statically
 * imported every module and the whole app shipped as one ~564 kB chunk.
 */
export const onboardtimeRoutes: RouteObject[] = [
  {
    path: 'modules/onboardtime',
    element: lazyRouteElement(() =>
      import('@/modules/onboardtime/components/OnboardtimeHome').then((m) => ({
        default: m.OnboardtimeHome,
      })),
    ),
  },
  {
    path: 'modules/onboardtime/:checklistId',
    element: lazyRouteElement(() =>
      import('@/modules/onboardtime/components/ChecklistDetail').then((m) => ({
        default: m.ChecklistDetail,
      })),
    ),
  },
];