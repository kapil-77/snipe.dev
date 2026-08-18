import { supabase, isSupabaseConfigured } from './supabase';

const WAITLIST_EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface WaitlistResult {
  ok: boolean;
  message: string;
  /** Inserted into Supabase `public.waitlist`. When false → stored locally instead. */
  storedLocally: boolean;
}

const LOCAL_KEY = 'snipe.waitlist';

function readLocal(): Array<{ email: string; module_slug: string }> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Array<{ email: string; module_slug: string }>) : [];
  } catch {
    return [];
  }
}

function writeLocal(entry: { email: string; module_slug: string }) {
  const next = [...readLocal(), { ...entry, joined_at: new Date().toISOString() }];
  localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
}

/**
 * Register interest for a coming-soon module. Persists to `public.waitlist`
 * when Supabase is configured (RLS allows anonymous inserts only), otherwise
 * degrades to localStorage so the UI is fully demo-able.
 */
export async function joinModuleWaitlist(
  email: string,
  module_slug: string,
  source = 'landing',
): Promise<WaitlistResult> {
  if (!WAITLIST_EMAIL_RE.test(email)) {
    return { ok: false, message: 'That email address doesn’t look right.', storedLocally: false };
  }

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('waitlist').insert({
      email,
      module_slug,
      source,
    });
    if (error) {
      // unique email/module row already exists → treat as success
      if (error.code === '23505') {
        return { ok: true, message: 'You’re already on this list — talk soon.', storedLocally: false };
      }
      return { ok: false, message: `Couldn’t save that right now. ${error.message}`, storedLocally: false };
    }
    return { ok: true, message: `You’re on the ${module_slug} waitlist.`, storedLocally: false };
  }

  try {
    writeLocal({ email, module_slug });
    return {
      ok: true,
      message: 'Saved locally (demo mode) — configure Supabase to persist waitlist entries.',
      storedLocally: true,
    };
  } catch {
    return { ok: false, message: 'This browser blocked local storage.', storedLocally: true };
  }
}