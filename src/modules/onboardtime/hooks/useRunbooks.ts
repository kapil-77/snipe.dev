import { useAsync } from '@/lib/use-async';

import { listRunbooks } from '../api';
import type { Runbook } from '../types';

/** Loads the org's runbooks (with progress counts) via the runbooks edge fn. */
export function useRunbooks(orgId?: string) {
  const { data: runbooks, loading, error, refresh } = useAsync<Runbook[]>({
    fetcher: () => listRunbooks(orgId!),
    deps: [orgId],
    enabled: Boolean(orgId),
    initial: [],
  });
  return { runbooks: runbooks ?? [], loading, error, refresh };
}