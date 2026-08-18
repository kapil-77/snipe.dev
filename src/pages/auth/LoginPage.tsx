import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '@/app/auth';
import { buttonClasses } from '@/components/ui/Button';
import { Frame } from '@/components/ui/Frame';
import { GithubMark } from '@/components/ui/GithubMark';
import { Input } from '@/components/ui/Input';
import { Reveal } from '@/components/ui/Reveal';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type AuthMode = 'sign-in' | 'sign-up';

/**
 * Shared auth page (email + GitHub OAuth) — one identity for every module.
 * In demo mode (no Supabase env) it still renders and explains what's
 * missing, so the shell is testable before the backend is wired.
 */
export function LoginPage() {
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session && !busy) navigate('/app/modules', { replace: true });
  }, [session, loading, busy, navigate]);

  async function submitEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) {
      setError(
        'Supabase isn\u2019t configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart the dev server.',
      );
      return;
    }
    setBusy(true);
    setError(null);

    if (mode === 'sign-up') {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (err) setError(err.message);
      else if (data.user && !data.session) setError('Confirmation link sent — check your inbox.');
      else navigate('/app/modules');
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
      else navigate('/app/modules');
    }
    setBusy(false);
  }

  async function github() {
    if (!supabase) {
      setError(
        'Supabase isn\u2019t configured yet. Add your VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to .env first.',
      );
      return;
    }
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  if (loading) {
    return (
      <section className="mx-auto flex w-full max-w-[1280px] justify-center px-6 py-24 md:px-8 md:py-40">
        <p className="text-sm text-faint">fetching session…</p>
      </section>
    );
  }
  if (session) {
    return <Navigate to="/app/modules" replace />;
  }

  const buttonDisabled = busy || !isSupabaseConfigured;

  return (
    <section className="mx-auto flex w-full max-w-[1280px] justify-center px-6 py-24 md:px-8 md:py-32">
      <Reveal className="w-full max-w-md">
        <Frame className="w-full">
          <div className="flex flex-col p-7 sm:p-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
              {isSupabaseConfigured ? 'one session · every module' : 'demo mode'}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              C&apos;mon in.
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Sign in once and every sealed module unlocks. Your profile lives in{' '}
              <span className="text-ink">public.users</span> — nothing else.
            </p>

            <button
              type="button"
              onClick={github}
              disabled={buttonDisabled}
              className={buttonClasses('outline', 'lg', 'mt-7 w-full')}
            >
              <GithubMark className="size-4" />
              Continue with GitHub
            </button>

            <div aria-hidden="true" className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-faint">
              <span className="h-px flex-1 bg-line/60" />
              or
              <span className="h-px flex-1 bg-line/60" />
            </div>

            <form onSubmit={submitEmail} className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                required
                value={email}
                disabled={busy}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                required
                minLength={8}
                value={password}
                disabled={busy}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && (
                <p role="status" className="text-xs leading-relaxed text-warning">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={buttonDisabled}
                className={buttonClasses('primary', 'lg', 'w-full')}
              >
                {busy ? 'One moment…' : mode === 'sign-up' ? 'Create account' : 'Log in'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
              className="mt-5 text-center text-xs text-faint transition-colors duration-200 ease-out hover:text-muted"
            >
              {mode === 'sign-in' ? (
                <>
                  New here? <span className="text-accent-bright">Create an account</span>
                </>
              ) : (
                <>
                  Already registered? <span className="text-accent-bright">Log in</span>
                </>
              )}
            </button>

            {!isSupabaseConfigured && (
              <p className="mt-6 border border-dashed border-line/50 p-3 text-xs leading-relaxed text-faint">
                Auth is disabled in demo mode. Create a Supabase project, set{' '}
                <code className="text-muted">VITE_SUPABASE_URL</code> +{' '}
                <code className="text-muted">VITE_SUPABASE_ANON_KEY</code>, run the migrations
                and deploy the edge functions, then this form goes live.
              </p>
            )}
          </div>
        </Frame>
        <p className="mt-5 text-center text-xs text-faint">
          By continuing you agree to the{' '}
          <Link to="/" className="underline underline-offset-2 hover:text-muted">
            terms
          </Link>
          .
        </p>
      </Reveal>
    </section>
  );
}