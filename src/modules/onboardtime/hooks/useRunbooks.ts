import { useCallback, useEffect, useState } from 'react';

import { listRunbooks } from '../api';
import type { Runbook } from '../types';

/** Loads the org's runbooks (with progress counts) via the runbooks edge fn. */
export function useRunbooks(orgId?: string) {
  const [runbooks, setRunbooks] = useState<Runbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setRunbooks(await listRunbooks(orgId));
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

  return { runbooks, loading, error, refresh };
}