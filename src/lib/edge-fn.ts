import { isSupabaseConfigured, supabase } from './supabase';

/**
 * Shared edge-function invocation used by every module's `/api.ts` wrapper.
 *
 * ISOLATION RULE: modules still own their functions (name prefix === schema),
 * this helper only centralises the transport so the duplicated ~35-line
 * builder that used to live in each module's api.ts lives in exactly one place.
 *
 * NOTE: the installed supabase-js ignores the `query` option in
 * functions.invoke (it builds the URL from the function name only). The query
 * string is therefore built into the function name so org-scoped calls
 * actually reach the function.
 */
export interface EdgeFnInit {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string>;
}

export async function invokeEdgeFn<T>(fn: string, init: EdgeFnInit = {}): Promise<T> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase is not configured — add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to .env',
    );
  }

  let target = fn;
  if (init.query) target = `${fn}?${new URLSearchParams(init.query).toString()}`;

  const { data, error } = await supabase.functions.invoke<T>(target, {
    method: init.method ?? 'POST',
    ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
  });
  if (error) {
    throw new Error(error.message ?? 'Edge function call failed');
  }
  return data as T;
}