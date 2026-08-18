import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export interface AuthState {
  /** null while loading or when signed out / unconfigured. */
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * Shared auth, one provider for every module — mirroring the Supabase
 * convention: module schemas share `auth.users` but never each other's data.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;
    let settleTimer: number | undefined;

    const settle = () => {
      if (mounted) setLoading(false);
    };

    // Subscribe BEFORE the initial session is resolved. `detectSessionInUrl`
    // processes the OAuth fragment (`#access_token=…`) synchronously during
    // this call and broadcasts `INITIAL_SESSION`/`SIGNED_IN` — if we
    // subscribed after `getSession()`, that event is missed and the auth
    // callback page would hang until a manual refresh.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (
        event === 'INITIAL_SESSION' ||
        event === 'SIGNED_IN' ||
        event === 'SIGNED_OUT' ||
        event === 'TOKEN_REFRESHED'
      ) {
        settle();
      }
    });

    // Belt-and-suspenders: resolve the stored/staged session, and guarantee
    // loading settles even if no auth event ever fires.
    settleTimer = window.setTimeout(settle, 4000);

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (mounted) {
          setSession(data.session);
          settle();
        }
      })
      .catch(() => {
        if (mounted) settle();
      });

    return () => {
      mounted = false;
      clearTimeout(settleTimer);
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      loading,
      configured: isSupabaseConfigured,
      signOut: async () => {
        await supabase?.auth.signOut();
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}