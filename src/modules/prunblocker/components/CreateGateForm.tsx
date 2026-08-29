import { LoaderCircle, Plus, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Frame } from '@/components/ui/Frame';
import { Input } from '@/components/ui/Input';

import { createGate } from '../api';
import { parseChecks } from '../parseChecks';
import { GATE_POLICY_OPTIONS } from '../types';
import type { MergeGate } from '../types';

/** Map DB field -> camelCase GateDraft key used by the form state. */
const POLICY_TO_DRAFT = {
  require_review: 'requireReview',
  block_on_conflicts: 'blockOnConflicts',
} as const;

/*
 * "Declare a merge gate" form. Owns its own local form state so toggling a
 * policy checkbox only re-renders this small form - never the gate grid, the
 * evaluation runner or the audit feed. The created gate is handed to the
 * parent via `onCreated` (applied locally, no full reload), then the fields
 * reset.
 */
interface CreateGateFormProps {
  orgId: string;
  onCreated: (gate: MergeGate) => void;
}

export function CreateGateForm({ orgId, onCreated }: CreateGateFormProps) {
  const [repo, setRepo] = useState('');
  const [sourceBranch, setSourceBranch] = useState('.*');
  const [targetBranch, setTargetBranch] = useState('(main|master)');
  const [checksText, setChecksText] = useState('');
  const [policy, setPolicy] = useState({ requireReview: true, blockOnConflicts: true });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!repo.trim()) return;
    setSaving(true);
    setFormError(null);
    try {
      const gate = await createGate(orgId, {
        repo: repo.trim(),
        sourceBranch,
        targetBranch,
        requiredChecks: parseChecks(checksText),
        ...policy,
      });
      onCreated(gate);
      setRepo('');
      setChecksText('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Frame className="w-full">
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          <ShieldCheck className="size-3.5 text-accent" aria-hidden="true" />
          Declare a merge gate
        </div>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
            <Input
              label="Repo"
              placeholder="owner/repo"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              required
            />
            <Input
              label="Source branch (regex)"
              placeholder=".*"
              value={sourceBranch}
              onChange={(e) => setSourceBranch(e.target.value)}
            />
            <Input
              label="Target branch (regex)"
              placeholder="(main|master)"
              value={targetBranch}
              onChange={(e) => setTargetBranch(e.target.value)}
            />
            <Input
              label="Required checks"
              placeholder="lint, build"
              value={checksText}
              onChange={(e) => setChecksText(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {GATE_POLICY_OPTIONS.map((option) => (
              <label
                key={option.field}
                className="flex h-10 shrink-0 cursor-pointer select-none items-center gap-2 border px-3 text-xs transition-colors duration-200 ease-out"
                title={option.description}
              >
                <input
                  type="checkbox"
                  checked={policy[POLICY_TO_DRAFT[option.field]]}
                  onChange={(e) =>
                    setPolicy((p) => ({ ...p, [POLICY_TO_DRAFT[option.field]]: e.target.checked }))
                  }
                  className="size-3.5 accent-[--color-accent]"
                />
                <span className={policy[POLICY_TO_DRAFT[option.field]] ? 'text-ink' : 'text-faint'}>
                  {option.title}
                </span>
              </label>
            ))}

            <Button type="submit" variant="primary" size="sm" disabled={saving}>
              {saving ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Plus className="size-4" aria-hidden="true" />
              )}
              Add gate
            </Button>
          </div>
          {formError && (
            <p role="alert" className="mt-2 text-xs leading-relaxed text-warning">
              {formError}
            </p>
          )}
        </form>
      </div>
    </Frame>
  );
}
