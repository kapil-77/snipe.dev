import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@/app/auth';
import { supabase } from '@/lib/supabase';

/**
 * Terminal for the GitHub OAuth + email-verification redirects.
 *
 * Normal path: supabase-js exchanges the OAuth fragment on load and the
 * (race-safe) AuthProvider flips the session → this page forwards on next
 * render. If the event was somehow missed, a direct `getSession()` re-check
 * after a grace window guarantees the page either forwards or shows a
 * recoverable message — never a permanent blank screen.
 */
export function AuthCallback() {
  const { session, loading, configured } = useAuth();
  const navigate = useNavigate();

  const [localSession, setLocalSession] = useState<Session | null>(null);
  const [rechecked, setRechecked] = useState(false);
  const [handoff, setHandoff] = useState('waiting for OAuth exchange');

  const activeSession = session ?? localSession;

  useEffect(() => {
    if (activeSession) navigate('/app/modules', { replace: true });
  }, [activeSession, navigate]);

  useEffect(() => {
    if (session) setHandoff('oauth exchange → auth event');
  }, [session]);

  useEffect(() => {
    if (localSession) setHandoff('recovered from storage re-check');
  }, [localSession]);

  // Grace window: if the provider missed the handoff event, fetch the session
  // directly (tokens were persisted in localStorage) and forward anyway.
  useEffect(() => {
    const client = supabase;
    if (activeSession || loading || !client) return;
    const id = window.setTimeout(async () => {
      const { data } = await client.auth.getSession();
      setLocalSession(data.session ?? null);
      setRechecked(true);
    }, 2500);
    return () => window.clearTimeout(id);
  }, [activeSession, loading]);

  const failed = !loading && rechecked && !activeSession;
  const pending = !failed && !activeSession;

  return (
    <section className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-center px-6 py-32 md:px-8">
      <div className="flex flex-col items-center text-center">
        {!configured ? (
          <>
            <h1 className="text-lg font-bold tracking-tight text-white">Auth isn’t configured</h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-faint">
              Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to `.env`, then restart the
              dev server.
            </p>
            <Link
              to="/login"
              className="mt-5 text-xs text-accent-bright underline underline-offset-2 hover:text-white"
            >
              Back to login
            </Link>
          </>
        ) : pending ? (
          <>
            <span
              aria-hidden="true"
              className="size-8 animate-spin rounded-full border-2 border-line border-t-accent"
            />
            <h1 className="mt-6 text-lg font-bold tracking-tight text-white">
              Completing sign-in…
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-faint">
              Exchanging the OAuth code and loading your shared session.
            </p>
            <p className="mt-4 text-[11px] tracking-[0.12em] text-faint">
              handoff: {handoff}
            </p>
          </>
        ) : (
          <p className="text-sm text-faint">
            Session handoff delayed —{' '}
            <Link
              to="/app/modules"
              className="text-accent-bright underline underline-offset-2 hover:text-white"
            >
              press here to continue
            </Link>
            .
          </p>
        )}

        {failed && (
          <div className="mt-6 flex flex-col items-center gap-1">
            <p className="text-xs leading-relaxed text-warning">
              We couldn’t restore your session after sign-in.
            </p>
            <Link
              to="/login"
              className="mt-2 text-xs text-accent-bright underline underline-offset-2 hover:text-white"
            >
              Back to login
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}