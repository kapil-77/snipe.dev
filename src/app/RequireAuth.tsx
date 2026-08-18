import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/app/auth';

/**
 * Guards /app/* — every module shares this one gate.
 * Demo mode (no Supabase env) intentionally bounces to /login, which
 * explains the wiring that’s missing.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <span
          aria-hidden="true"
          className="size-7 animate-spin rounded-full border-2 border-line border-t-accent"
        />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}