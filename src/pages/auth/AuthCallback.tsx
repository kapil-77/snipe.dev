import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@/app/auth';

/**
 * Terminal for the GitHub OAuth + email-verification redirects.
 * supabase-js exchanges the auth code on load and flips the session via
 * onAuthStateChange; this page just waits and forwards.
 */
export function AuthCallback() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) navigate('/app/modules', { replace: true });
  }, [loading, session, navigate]);

  return (
    <section className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-center px-6 py-32 md:px-8">
      <div className="flex flex-col items-center text-center">
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
        {!session && !loading && (
          <Link
            to="/login"
            className="mt-5 text-xs text-accent-bright underline underline-offset-2 hover:text-white"
          >
            Back to login
          </Link>
        )}
      </div>
    </section>
  );
}