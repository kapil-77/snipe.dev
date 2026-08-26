import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  /** Raw state setter — lets consumers apply optimistic local updates. */
  setData: Dispatch<SetStateAction<T | null>>;
}

export interface UseAsyncOptions<T> {
  fetcher: () => Promise<T>;
  /** Re-run the effect when any of these change. */
  deps?: readonly unknown[];
  /** Initial `data` value (before the first load resolves). */
  initial?: T | null;
  /** When false the load is skipped — `data` stays at `initial`, `loading` stays false. */
  enabled?: boolean;
}

/**
 * Loads `fetcher()` once on mount and on any `deps` change, exposing the
 * standard `{ data, loading, error, refresh }` shape shared by every module
 * screen. Consumers keep their own stateful rows and layer optimistic
 * helpers (apply/prepend/remove locally) on top.
 */
export function useAsync<T>({
  fetcher,
  deps = [],
  initial = null,
  enabled = true,
}: UseAsyncOptions<T>): AsyncState<T> {
  const [data, setData] = useState<T | null>(initial);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setData(await fetcher());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
    // `deps` intentionally drives the callback identity (it includes the
    // captured `enabled`/`fetcher` closure inputs) — no eslint in build.
  }, deps);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh, setData };
}