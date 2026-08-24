import { useCallback, useEffect, useState } from 'react';

import { bootstrapOrg } from '../api';
import type { WorkspaceOrg } from '../types';

/**
 * Bootstraps (idempotently) the caller's personal org via the
 * `prunblocker-bootstrap` edge function, then holds it for the module UI.
 * Module-local copy on purpose — modules never import another module's folder.
 */
export function useWorkspaceOrg() {
  const [org, setOrg] = useState<WorkspaceOrg | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setOrg(await bootstrapOrg());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { org, loading, error, refresh };
}