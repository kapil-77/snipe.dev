import type { ReactNode } from 'react';

import { AuthProvider } from './auth';

/**
 * Global providers, in dependency order. Theme is a single dark token set
 * (see src/styles/globals.css) — a ThemeProvider can be layered here later
 * if light mode ever ships.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}