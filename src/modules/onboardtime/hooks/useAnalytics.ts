import { useCallback, useEffect, useState } from 'react';

import { getTeamAnalytics } from '../api';
import type { RunbookAnalytics } from '../types';

/** Org-wide team analytics (active onboardings, avg completion, blockers). */
export function useAnalytics(orgId?: string) {
  const [analytics, setAnalytics] = useState<RunbookAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setAnalytics(await getTeamAnalytics(orgId));
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

  return { analytics, loading, error, refresh };
}