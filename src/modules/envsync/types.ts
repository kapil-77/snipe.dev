import type { EnvVarRow } from '@/lib/database.types';

/*
 * Domain types for Envsync (module_envsync schema).
 */

export type EnvVar = EnvVarRow;

export type Environment = 'development' | 'staging' | 'production';

export const ENVIRONMENTS: Environment[] = ['development', 'staging', 'production'];