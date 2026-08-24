import type { RouteObject } from 'react-router-dom';

import { GateDetail } from './components/GateDetail';
import { PrunblockerHome } from './components/PrunblockerHome';

/**
 * Routes owned by the PR Unblocker module (live).
 * Registered by the app router under the authenticated workspace layout.
 */
export const prunblockerRoutes: RouteObject[] = [
  { path: 'modules/prunblocker', element: <PrunblockerHome /> },
  { path: 'modules/prunblocker/:gateId', element: <GateDetail /> },
];