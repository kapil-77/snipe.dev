import { useCallback, useEffect, useState } from 'react';

import { listGates } from '../api';
import type { MergeGate } from '../types';

/** Loads the org's declared merge gates via the gates edge fn. */
export function useGates(orgId?: string) {
  const [gates, setGates] = useState<MergeGate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setGates(await listGates(orgId));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /** Replace (or append) one gate locally after a server POST/PATCH. */
  const applyGateLocally = useCallback((updated: MergeGate) => {
    setGates((prev) => {
      const idx = prev.findIndex((g) => g.id === updated.id);
      if (idx === -1) return [...prev, updated];
      const next = [...prev];
      next[idx] = updated;
      return next;
    });
  }, []);

  /** Remove one gate locally (after DELETE). */
  const removeGateLocally = useCallback((id: string) => {
    setGates((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return { gates, loading, error, refresh, applyGateLocally, removeGateLocally };
}