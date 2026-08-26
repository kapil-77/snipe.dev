import { GitPullRequest, LoaderCircle, Plus, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Frame } from '@/components/ui/Frame';
import { Input } from '@/components/ui/Input';
import { Reveal } from '@/components/ui/Reveal';

import { createGate, deleteGate } from '../api';
import { useEvaluate } from '../hooks/useEvaluate';
import { useEvaluations } from '../hooks/useEvaluations';
import { useGates } from '../hooks/useGates';
import { useWorkspaceOrg } from '../hooks/useWorkspaceOrg';
import { parseChecks } from '../parseChecks';
import { GATE_POLICY_OPTIONS } from '../types';
import { EvaluatePanel } from './EvaluatePanel';
import { EvaluationFeed } from './EvaluationFeed';
import { GateCard } from './GateCard';

/** Map DB field → camelCase GateDraft key used by the create form state. */
const POLICY_TO_DRAFT = {
  require_review: 'requireReview',
  block_on_conflicts: 'blockOnConflicts',
} as const;

/** PR Unblocker home — declare gates, run an evaluation, follow the audit trail. */
export function PrunblockerHome() {
  const { org, loading: orgLoading, error: orgError, refresh: refreshOrg } = useWorkspaceOrg();
  const { gates, error, refresh, applyGateLocally, removeGateLocally } =
    useGates(org?.orgId);
  const { evaluations, loading: evalLoading, error: evalError, refresh: refreshEval, prependLocally } =
    useEvaluations(org?.orgId);
  const { result, busy, error: evalRunError, run } = useEvaluate(org?.orgId);

  const [repo, setRepo] = useState('');
  const [sourceBranch, setSourceBranch] = useState('.*');
  const [targetBranch, setTargetBranch] = useState('(main|master)');
  const [checksText, setChecksText] = useState('');
  const [policy, setPolicy] = useState({ requireReview: true, blockOnConflicts: true });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!org || !repo.trim()) return;
    setSaving(true);
    setFormError(null);
    try {
      const gate = await createGate(org.orgId, {
        repo: repo.trim(),
        sourceBranch,
        targetBranch,
        requiredChecks: parseChecks(checksText),
        ...policy,
      });
      applyGateLocally(gate);
      setRepo('');
      setChecksText('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

if (orgLoading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
        <LoaderCircle className="size-7 animate-spin text-muted" aria-hidden="true" />
        <p className="text-sm text-faint">Provisioning your workspace…</p>
      </div>
    );
  }

  if (orgError || !org) {
    return (
      <Frame className="mx-auto mt-8 w-full max-w-xl">
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <p className="text-sm leading-relaxed text-warning">
            Couldn’t start your workspace: {orgError}
          </p>
          <Button variant="outline" size="sm" className="mt-5" onClick={refreshOrg}>
            Retry
          </Button>
        </div>
      </Frame>
    );
  }

  async function remove(id: string) {
    try {
      await deleteGate(id);
      removeGateLocally(id);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Reveal>
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="grid size-14 shrink-0 place-items-center border border-line bg-raised text-ink">
              <GitPullRequest className="size-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  PR Unblocker
                </h1>
                <Badge tone="accent" dot>live</Badge>
              </div>
              <p className="mt-1 text-sm text-faint">
                {org.orgName} · <span className="text-muted">module_prunblocker</span>
                {org.userEmail ? ` · ${org.userEmail}` : ''}
              </p>
            </div>
          </div>
        </header>
      </Reveal>
<Reveal delay={80} className="mt-8">
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
            </form>
            {formError && (
              <p role="alert" className="mt-2 text-xs leading-relaxed text-warning">
                {formError}
              </p>
            )}
          </div>
        </Frame>
      </Reveal>
<Reveal delay={160} className="mt-8">
        <div className="flex flex-col gap-4">
          {error ? (
            <Frame className="w-full">
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <p className="text-sm leading-relaxed text-warning">{error}</p>
                <Button variant="outline" size="sm" className="mt-5" onClick={refresh}>
                  Retry
                </Button>
              </div>
            </Frame>
          ) : gates.length === 0 ? (
            <Frame className="w-full">
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <ShieldCheck className="size-8 text-faint" aria-hidden="true" />
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
                  No merge gates yet. Declare one above, then run a PR through it — every
                  verdict is written to the
                  <span className="text-ink">module_prunblocker</span> audit trail.
                </p>
              </div>
            </Frame>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gates.map((gate, index) => (
                <Reveal key={gate.id} delay={(index % 3) * 60} className="h-full">
                  <GateCard gate={gate} onDelete={() => remove(gate.id)} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      <Reveal delay={220} className="mt-8">
        <EvaluatePanel
          busy={busy}
          result={result}
          error={evalRunError}
          onSubmitRun={(report) =>
            void run(report).then((res) => {
              if (res?.evaluation) prependLocally(res.evaluation);
            })
          }
        />
      </Reveal>

      <Reveal delay={280} className="mt-8">
        <EvaluationFeed
          evaluations={evaluations}
          loading={evalLoading}
          error={evalError}
          onRetry={refreshEval}
        />
      </Reveal>
    </div>
  );
}