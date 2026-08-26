import { useCallback } from 'react';

import { useAsync } from '@/lib/use-async';

import { listEvaluations } from '../api';
import type { PrEvaluation } from '../types';

/** Loads the recent enforcement (pr_evaluations) records via the evaluate fn. */
export function useEvaluations(orgId?: string, gateId?: string) {
  const { data: evaluations, loading, error, refresh, setData } = useAsync<PrEvaluation[]>({
    fetcher: () => listEvaluations(orgId!, gateId),
    deps: [orgId, gateId],
    enabled: Boolean(orgId),
    initial: [],
  });

  /** Prepend a freshly-written evaluation (from a POST) without a reload. */
  const prependLocally = useCallback((evaluation: PrEvaluation) => {
    setData((prev) => [evaluation, ...(prev ?? []).filter((e) => e.id !== evaluation.id)]);
  }, [setData]);

  return { evaluations: evaluations ?? [], loading, error, refresh, prependLocally };
}