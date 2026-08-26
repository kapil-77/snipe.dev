/**
 * Shared workspace-org shape returned by every module's bootstrap edge fn.
 * Lives in /lib because both live modules define it identically — they still
 * re-export it from their own `types.ts` so module import surfaces are unchanged.
 */
export interface WorkspaceOrg {
  orgId: string;
  orgName: string;
  userEmail?: string;
}