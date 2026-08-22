import { sectionsForRole, templateTasks } from '../templates';
import type { TemplateRole } from '@/lib/database.types';
import { ROLE_LABELS } from '../types';

export interface TemplateMeta {
  role: TemplateRole;
  label: string;
  taskCount: number;
  sectionCount: number;
}

/*
 * TS-only role templates — the picker reads directly from templates.ts,
 * no server seed. Each meta is a clickable card ("start from this role").
 */

function metaFor(role: TemplateRole): TemplateMeta {
  const sections = sectionsForRole(role);
  return {
    role,
    label: ROLE_LABELS[role],
    taskCount: sections.reduce((n, s) => n + s.items.length, 0),
    sectionCount: sections.length,
  };
}

/** Non-empty, non-custom role templates in fixed order. */
export function useTemplates(): TemplateMeta[] {
  return (Object.keys(templateTasks) as TemplateRole[])
    .filter((r) => r !== 'custom')
    .map(metaFor);
}