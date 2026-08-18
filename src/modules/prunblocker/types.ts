import type { MergeGateRow } from '@/lib/database.types';

/*
 * Domain types for PR Unblocker (module_prunblocker schema).
 */

export type MergeGate = MergeGateRow;

export type MergePolicy = 'require-review' | 'block-conflicts' | 'require-checks';