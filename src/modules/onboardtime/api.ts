import { probeEdgeFunction, type ProbeResult } from '@/lib/api';

/*
 * API surface for the Onboardtime module.
 *
 * ISOLATION RULE: every request here talks to an `onboardtime-*` edge
 * function that only touches the `module_onboardtime` schema. No other
 * module is ever imported here.
 */

/** Every function owned by this module (mirrors /supabase/functions). */
export const ONBOARD_TIME_FUNCTIONS = ['onboardtime-hello'] as const;

/** Warm-up / health probe against our own hello edge function. */
export async function pingOnboardtime(): Promise<ProbeResult> {
  return probeEdgeFunction('onboardtime-hello');
}

export type OnboardtimeProbe = ProbeResult;