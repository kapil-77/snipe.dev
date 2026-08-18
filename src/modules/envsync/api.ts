import { probeEdgeFunction, type ProbeResult } from '@/lib/api';

/*
 * API surface for the Envsync module.
 *
 * Talks exclusively to `envsync-*` edge functions → `module_envsync`.
 */

export const ENVSYNC_FUNCTIONS = ['envsync-hello'] as const;

export async function pingEnvsync(): Promise<ProbeResult> {
  return probeEdgeFunction('envsync-hello');
}