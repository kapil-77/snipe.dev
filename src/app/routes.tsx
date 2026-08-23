import { Navigate, Route, Routes } from 'react-router-dom';

import { RequireAuth } from './RequireAuth';
import { LoginPage } from '@/pages/auth/LoginPage';
import { AuthCallback } from '@/pages/auth/AuthCallback';
import { Landing } from '@/pages/Landing';
import { NotFound } from '@/pages/NotFound';
import { DashboardPage } from '@/shell/DashboardPage';
import { ModulePage } from '@/shell/ModulePage';
import { PublicLayout } from '@/shell/PublicLayout';
import { WorkspaceLayout } from '@/shell/WorkspaceLayout';
import { onboardtimeRoutes } from '@/modules/onboardtime/routes';
import { prunblockerRoutes } from '@/modules/prunblocker/routes';

/**
 * Module routes. Each sealed module registers its own subtree here once it
 * goes live (imported from /src/modules/<name>/routes) — the generic
 * placeholder screen below takes over for the remaining coming-soon modules.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Route>

      <Route
        path="/app"
        element={
          <RequireAuth>
            <WorkspaceLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/app/modules" replace />} />
        <Route path="modules" element={<DashboardPage />} />
        {/* Live modules register static routes here (ranked above :slug). */}
        {onboardtimeRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        {prunblockerRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        <Route path="modules/:slug" element={<ModulePage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}