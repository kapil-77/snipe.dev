import type { RouteObject } from 'react-router-dom';

import { ChecklistDetail } from './components/ChecklistDetail';
import { OnboardtimeHome } from './components/OnboardtimeHome';

/**
 * Routes owned by the Onboardtime module (live).
 * Registered by the app router under the authenticated workspace layout.
 */
export const onboardtimeRoutes: RouteObject[] = [
  { path: 'modules/onboardtime', element: <OnboardtimeHome /> },
  { path: 'modules/onboardtime/:checklistId', element: <ChecklistDetail /> },
];