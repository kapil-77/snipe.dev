import type { ItemPriority, ItemSection, TemplateRole } from '@/lib/database.types';

import type { ItemDraft } from './types';

/*
 * TS-only role templates — the only source of starter tasks for each role.
 * Deliberately NOT seeded in the database: the UI offers these presets from
 * the client, and selecting one creates a runbook + its items through the
 * module edge functions.
 *
 * Each role is a `Record<ItemSection, TemplateSection>` so role overrides can
 * spread the shared `coreSections` and replace only the sections they want.
 */

export interface TemplateSection {
  section: ItemSection;
  title: string;
  items: Array<{
    title: string;
    category?: string;
    priority?: ItemPriority;
  }>;
}

export const SECTION_ORDER: ItemSection[] = [
  'access',
  'dev-setup',
  'codebase',
  'team',
  'contribution',
];

export type RoleSections = Record<ItemSection, TemplateSection>;

const coreSections: RoleSections = {
  access: {
    section: 'access',
    title: 'Access',
    items: [
      { title: 'Send HR + payroll paperwork', category: 'admin', priority: 'high' },
      { title: 'Create account + set up password manager', category: 'admin', priority: 'high' },
      { title: 'Add to GitHub org (engineer team)', category: 'infra', priority: 'high' },
      { title: 'Request laptop + development machine', category: 'infra', priority: 'medium' },
    ],
  },
  'dev-setup': {
    section: 'dev-setup',
    title: 'Development Setup',
    items: [
      { title: 'Install editor + suggested extensions', category: 'tooling', priority: 'medium' },
      { title: 'Install git + configure SSH keys', category: 'tooling', priority: 'high' },
      { title: 'Add Envsync credential (dark_souls-secrets)', category: 'infra', priority: 'medium' },
      { title: 'Clone repos & bootstrap dependencies', category: 'tooling', priority: 'high' },
    ],
  },
  codebase: {
    section: 'codebase',
    title: 'Codebase',
    items: [
      { title: 'Read CONTRIBUTING.md + ARCHITECTURE.md', category: 'docs', priority: 'medium' },
      { title: 'Run local lint + type-check', category: 'tooling', priority: 'medium' },
      { title: 'Write a failing test for a small feature', category: 'test', priority: 'low' },
    ],
  },
  team: {
    section: 'team',
    title: 'Team',
    items: [
      { title: 'Intro 1:1 with your onboarding buddy', category: 'people', priority: 'high' },
      { title: 'Join the #engineering channel & calendar', category: 'people', priority: 'medium' },
      { title: 'Weekly sync with your manager', category: 'people', priority: 'medium' },
    ],
  },
  contribution: {
    section: 'contribution',
    title: 'First Contribution',
    items: [
      { title: 'Pick a good-first-issue', category: 'review', priority: 'high' },
      { title: 'Open your first pull request', category: 'merge', priority: 'high' },
    ],
  },
  general: {
    section: 'general',
    title: 'General',
    items: [],
  },
};

export const templateTasks: Record<TemplateRole, RoleSections> = {
  core: coreSections,
  frontend: {
    ...coreSections,
    'dev-setup': {
      section: 'dev-setup',
      title: 'Development Setup',
      items: [
        { title: 'Install editor + Prettier + ESLint config', category: 'tooling', priority: 'medium' },
        { title: 'Install git + SSH keys', category: 'tooling', priority: 'high' },
        { title: 'Install Marketplace Figma design tokens', category: 'design', priority: 'medium' },
        { title: 'Install Marketplace node + pnpm', category: 'tooling', priority: 'high' },
      ],
    },
    codebase: {
      section: 'codebase',
      title: 'Codebase',
      items: [
        { title: 'Read CONTRIBUTING.md (frontend section)', category: 'docs', priority: 'medium' },
        { title: 'Run eslint + type-check on the web app', category: 'tooling', priority: 'medium' },
        { title: 'Implement a small responsive component', category: 'test', priority: 'low' },
      ],
    },
    contribution: {
      section: 'contribution',
      title: 'First Contribution',
      items: [
        { title: 'Write a small visual regression test', category: 'test', priority: 'medium' },
        { title: 'Open your first frontend pull request', category: 'merge', priority: 'high' },
      ],
    },
  },
  backend: {
    ...coreSections,
    'dev-setup': {
      section: 'dev-setup',
      title: 'Development Setup',
      items: [
        { title: 'Install editor + dotfiles', category: 'tooling', priority: 'medium' },
        { title: 'Install git + SSH keys', category: 'tooling', priority: 'high' },
        { title: 'Add Postgres local + migration tooling', category: 'infra', priority: 'high' },
        { title: 'Install node + pnpm + runtimes', category: 'tooling', priority: 'high' },
      ],
    },
    codebase: {
      section: 'codebase',
      title: 'Codebase',
      items: [
        { title: 'Read CONTRIBUTING.md (backend section)', category: 'docs', priority: 'medium' },
        { title: 'Run backend unit + integration tests', category: 'test', priority: 'medium' },
        { title: 'Write an integration test for an endpoint', category: 'test', priority: 'low' },
      ],
    },
    contribution: {
      section: 'contribution',
      title: 'First Contribution',
      items: [{ title: 'Open your first backend PR', category: 'merge', priority: 'high' }],
    },
  },
  qa: {
    ...coreSections,
    'dev-setup': {
      section: 'dev-setup',
      title: 'Development Setup',
      items: [
        { title: 'Install editor + QA tooling (Playwright/Cypress)', category: 'tooling', priority: 'medium' },
        { title: 'Install git + SSH keys', category: 'tooling', priority: 'high' },
        { title: 'Install local test runner + fixtures', category: 'tooling', priority: 'high' },
      ],
    },
    codebase: {
      section: 'codebase',
      title: 'Codebase',
      items: [
        { title: 'Read CONTRIBUTING.md (QA section)', category: 'docs', priority: 'medium' },
        { title: 'Learn the smoke-test suite', category: 'test', priority: 'medium' },
        { title: 'Create a test case for a bug', category: 'test', priority: 'medium' },
      ],
    },
    contribution: {
      section: 'contribution',
      title: 'First Contribution',
      items: [
        { title: 'File your first QA bug report', category: 'review', priority: 'medium' },
        { title: 'Open your first test PR', category: 'merge', priority: 'high' },
      ],
    },
  },
  designer: {
    ...coreSections,
    'dev-setup': {
      section: 'dev-setup',
      title: 'Development Setup',
      items: [
        { title: 'Get Figma + design tokens (dark/ui) access', category: 'design', priority: 'high' },
        { title: 'Install git + SSH keys', category: 'tooling', priority: 'medium' },
        { title: 'Install Storybook + design system', category: 'design', priority: 'medium' },
      ],
    },
    codebase: {
      section: 'codebase',
      title: 'Codebase',
      items: [
        { title: 'Read design-system README + tokens', category: 'docs', priority: 'medium' },
        { title: 'Create one design token / component sketch', category: 'design', priority: 'medium' },
      ],
    },
    contribution: {
      section: 'contribution',
      title: 'First Contribution',
      items: [{ title: 'Open your first design PR', category: 'merge', priority: 'high' }],
    },
  },
  product: {
    ...coreSections,
    'dev-setup': {
      section: 'dev-setup',
      title: 'Development Setup',
      items: [
        { title: 'Get product tools (Linear, Notion, Figma)', category: 'admin', priority: 'high' },
        { title: 'Install git + SSH keys', category: 'tooling', priority: 'medium' },
        { title: 'Set up local env + preview builds', category: 'tooling', priority: 'medium' },
      ],
    },
    codebase: {
      section: 'codebase',
      title: 'Codebase',
      items: [
        { title: 'Read product briefs + README', category: 'docs', priority: 'medium' },
        { title: 'Review the backlog in Linear', category: 'admin', priority: 'medium' },
      ],
    },
    contribution: {
      section: 'contribution',
      title: 'First Contribution',
      items: [
        { title: 'Interview a roadmap item with a real user', category: 'people', priority: 'medium' },
        { title: 'Draft a spec for an upcoming feature', category: 'review', priority: 'high' },
      ],
    },
  },
  custom: {
    ...coreSections,
    access: { section: 'access', title: 'Access', items: [] },
    'dev-setup': { section: 'dev-setup', title: 'Development Setup', items: [] },
    codebase: { section: 'codebase', title: 'Codebase', items: [] },
    team: { section: 'team', title: 'Team', items: [] },
    contribution: { section: 'contribution', title: 'First Contribution', items: [] },
  },
};

/** Ordered, non-empty sections for a role (drops empty ones like general). */
export function sectionsForRole(role: TemplateRole): TemplateSection[] {
  return Object.values(templateTasks[role]).filter((s) => s.items.length > 0);
}

/** Build the full non-empty ItemDraft list for a role. */
export function templateItemsForRole(role: TemplateRole): ItemDraft[] {
  const out: ItemDraft[] = [];
  for (const section of sectionsForRole(role)) {
    for (const item of section.items) {
      out.push({
        title: item.title,
        section: section.section,
        category: item.category ?? null,
        priority: item.priority ?? 'medium',
      });
    }
  }
  return out;
}