/**
 * Supabase Database types.
 *
 * Convention (strict per-module isolation):
 *  - `public` schema holds shared tables only (users, orgs, org_members, waitlist)
 *  - every module owns an isolated schema (`module_onboardtime`, …) and never
 *    references another module's tables.
 *
 * These types mirror /supabase/migrations/*.sql. Regenerate against a live
 * project with `supabase gen types typescript` (config.toml `[api].schemas`
 * includes every module schema).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type OrgRow = {
  id: string;
  name: string;
  slug: string;
  created_by: string | null;
  created_at: string;
}

export type OrgMemberRow = {
  id: string;
  org_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

export type WaitlistRow = {
  id: number;
  email: string;
  module_slug: string | null;
  source: string | null;
  created_at: string | null;
}

export type ItemPriority = 'low' | 'medium' | 'high';

export type ItemSection =
  | 'access'
  | 'dev-setup'
  | 'codebase'
  | 'team'
  | 'contribution'
  | 'general';

export type TemplateRole =
  | 'core'
  | 'frontend'
  | 'backend'
  | 'qa'
  | 'designer'
  | 'product'
  | 'custom';

export type ChecklistTemplateRow = {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  is_template: boolean;
  role: TemplateRole | null;
  owner_id: string | null;
  next_milestone: string | null;
  next_milestone_due: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ChecklistItemRow = {
  id: string;
  org_id: string;
  checklist_id: string | null;
  user_id: string | null;
  title: string;
  status: 'todo' | 'doing' | 'done';
  section: ItemSection;
  category: string | null;
  priority: ItemPriority;
  blocked: boolean;
  owner_id: string | null;
  due_on: string | null;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type MergeGateRow = {
  id: string;
  org_id: string;
  source_branch: string;
  target_branch: string;
  required_checks: string[];
  require_review: boolean;
  block_on_conflicts: boolean;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type EnvVarRow = {
  id: string;
  org_id: string;
  name: string;
  value: string | null;
  environment: 'development' | 'staging' | 'production';
  last_synced_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

type MakeTable<T> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      users: MakeTable<UserRow>;
      orgs: MakeTable<OrgRow>;
      org_members: MakeTable<OrgMemberRow>;
      waitlist: MakeTable<WaitlistRow>;
    };
    Views: Record<string, never>;
    Functions: {
      handle_new_user: { Args: Record<never, never>; Returns: undefined };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
  module_onboardtime: {
    Tables: {
      checklists: MakeTable<ChecklistTemplateRow>;
      checklist_items: MakeTable<ChecklistItemRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
  module_prunblocker: {
    Tables: {
      merge_gates: MakeTable<MergeGateRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
  module_envsync: {
    Tables: {
      environment_vars: MakeTable<EnvVarRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}