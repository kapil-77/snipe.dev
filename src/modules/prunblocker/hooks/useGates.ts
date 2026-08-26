import { useCallback } from 'react';

import { useAsync } from '@/lib/use-async';

import { listGates } from '../api';
import type { MergeGate } from '../types';

/** Loads the org's declared merge gates via the gates edge fn. */
export function useGates(orgId?: string) {
  const { data: gates, loading, error, refresh, setData } = useAsync<MergeGate[]>({
    fetcher: () => listGates(orgId!),
    deps: [orgId],
    enabled: Boolean(orgId),
    initial: [],
  });

  /** Replace (or append) one gate locally after a server POST/PATCH. */
  const applyGateLocally = useCallback((updated: MergeGate) => {
    setData((prev) => {
      const cur = prev ?? [];
      const idx = cur.findIndex((g) => g.id === updated.id);
      if (idx === -1) return [...cur, updated];
      const next = [...cur];
      next[idx] = updated;
      return next;
    });
  }, [setData]);

  return {
    gates: gates ?? [],
    loading,
    error,
    refresh,
    applyGateLocally,
    removeGateLocally: useCallback((id: string) => {
      setData((prev) => (prev ?? []).filter((g) => g.id !== id));
    }, [setData]),
  };
}