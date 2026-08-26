import type { WorkspaceOrg } from '@/lib/workspace-org';
import { useAsync } from '@/lib/use-async';

import { bootstrapOrg } from '../api';

/**
 * Bootstraps (idempotently) the caller's personal org via the
 * `onboardtime-bootstrap` edge function, then holds it for the module UI.
 */
export function useWorkspaceOrg() {
  const { data: org, loading, error, refresh } = useAsync<WorkspaceOrg>({
    fetcher: () => bootstrapOrg(),
  });
  return { org, loading, error, refresh };
}