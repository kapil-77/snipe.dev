/**
 * Split a comma / newline separated list of check names into trimmed,
 * non-empty values. Shared by the gate create form, gate detail and the
 * evaluation runner (previously copy-pasted in three places).
 */
export function parseChecks(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((c) => c.trim())
    .filter(Boolean);
}