import { useCallback, useState } from 'react';

import { evaluatePr } from '../api';
import type { EvaluationResult, PrReport } from '../types';

/**
 * Runs one PR-report evaluation through `prunblocker-evaluate` and keeps
 * the result until the next run. `busy` guards against double-firing.
 * Returns the result (or null) so the caller can also react to the write.
 */
export function useEvaluate(orgId?: string) {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (report: PrReport): Promise<EvaluationResult | null> => {
      if (!orgId) {
        setError('No workspace org yet — bootstrap first.');
        return null;
      }
      setBusy(true);
      setError(null);
      try {
        const res = await evaluatePr({ ...report, org_id: orgId });
        setResult(res);
        return res;
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setResult(null);
        return null;
      } finally {
        setBusy(false);
      }
    },
    [orgId],
  );

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, busy, error, run, clear };
}