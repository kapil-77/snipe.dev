import { useCallback, useEffect, useState } from 'react';

import { listEvaluations } from '../api';
import type { PrEvaluation } from '../types';

/** Loads the recent enforcement (pr_evaluations) records via the evaluate fn. */
export function useEvaluations(orgId?: string, gateId?: string) {
  const [evaluations, setEvaluations] = useState<PrEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setEvaluations(await listEvaluations(orgId, gateId));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [orgId, gateId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /** Prepend a freshly-written evaluation (from a POST) without a reload. */
  const prependLocally = useCallback((evaluation: PrEvaluation) => {
    setEvaluations((prev) => [evaluation, ...prev.filter((e) => e.id !== evaluation.id)]);
  }, []);

  return { evaluations, loading, error, refresh, prependLocally };
}