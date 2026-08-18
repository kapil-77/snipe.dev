import { probeEdgeFunction, type ProbeResult } from '@/lib/api';

/*
 * API surface for the PR Unblocker module.
 * Talks exclusively to `prunblocker-*` edge functions → `module_prunblocker`.
 */

export const PR_UNBLOCKER_FUNCTIONS = ['prunblocker-hello'] as const;

export async function pingPrunblocker(): Promise<ProbeResult> {
  return probeEdgeFunction('prunblocker-hello');
}