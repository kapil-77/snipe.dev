import type { RouteObject } from 'react-router-dom';

import { PrunblockerDetail } from './components/PrunblockerDetail';

/**
 * Routes owned by the PR Unblocker module.
 * Coming-soon: registers a dedicated detail page (interactive preview +
 * architecture + waitlist). The app router ranks it above the :slug blueprint.
 */
export const prunblockerRoutes: RouteObject[] = [
  { path: 'modules/prunblocker', element: <PrunblockerDetail /> },
];