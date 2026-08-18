import { supabase, isSupabaseConfigured } from './supabase';

/*
 * Generic edge-function probe used across module screens.
 * Every module owns its functions (name prefix === schema name, e.g.
 * `module_onboardtime` → `onboardtime-*`) and its own /api.ts wrapper —
 * the shell only needs the prefix to wire up the blueprint panel.
 */

export interface ProbeResult {
  ok: boolean;
  label: string;
  body: unknown;
  error?: string;
  demo: boolean;
}

export async function probeEdgeFunction(fnName: string): Promise<ProbeResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      label: fnName,
      demo: true,
      body: null,
      error:
        'Supabase not configured — add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to .env',
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke<Record<string, unknown>>(
      fnName,
      {
        method: 'GET',
        headers: { 'X-Snipe-Probe': fnName },
      },
    );
    if (error) {
      return { ok: false, label: fnName, demo: false, body: null, error: error.message };
    }
    return { ok: true, label: fnName, demo: false, body: data };
  } catch (error) {
    return {
      ok: false,
      label: fnName,
      demo: false,
      body: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}