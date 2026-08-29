import {
  ArrowLeft,
  Check,
  GitPullRequest,
  LoaderCircle,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Frame } from '@/components/ui/Frame';
import { Input } from '@/components/ui/Input';
import { Reveal } from '@/components/ui/Reveal';

import { deleteGate, updateGate } from '../api';
import { useEvaluate } from '../hooks/useEvaluate';
import { useEvaluations } from '../hooks/useEvaluations';
import { useGates } from '../hooks/useGates';
import { useWorkspaceOrg } from '../hooks/useWorkspaceOrg';
import { parseChecks } from '../parseChecks';
import { GATE_POLICY_OPTIONS } from '../types';
import { EvaluatePanel } from './EvaluatePanel';
import { EvaluationFeed } from './EvaluationFeed';

/** Gate detail — edit policy/checks, toggle enforcement, evaluate + audit. */
export function GateDetail() {
  const { gateId } = useParams<{ gateId: string }>();
  const navigate = useNavigate();
  const { org, loading: orgLoading, error: orgError, refresh: refreshOrg } = useWorkspaceOrg();
  const { gates, loading, error, refresh, applyGateLocally } = useGates(org?.orgId);
  const { evaluations, loading: evalLoading, error: evalError, refresh: refreshEval, prependLocally } =
    useEvaluations(org?.orgId, gateId);
  const { result, busy, error: evalRunError, run } = useEvaluate(org?.orgId);

  const [checksText, setChecksText] = useState('');
  const [mutationError, setMutationError] = useState<string | null>(null);

  async function mutate(patch: Record<string, unknown>) {
    if (!gateId) return;
    setMutationError(null);
    try {
      const updated = await updateGate(gateId, patch);
      if (updated) applyGateLocally(updated);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : String(err));
    }
  }

  async function remove() {
    if (!gateId) return;
    try {
      await deleteGate(gateId);
      navigate('/app/modules/prunblocker');
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : String(err));
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
          <p className="text-sm leading-relaxed text-warning">{orgError}</p>
          <Button variant="outline" size="sm" className="mt-5" onClick={refreshOrg}>
            Retry
          </Button>
        </div>
      </Frame>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <LoaderCircle className="size-6 animate-spin text-muted" aria-hidden="true" />
      </div>
    );
  }

  if (error || !gateId) {
    return (
      <Frame className="mx-auto mt-8 w-full max-w-xl">
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <p className="text-sm leading-relaxed text-warning">{error ?? 'Gate not found.'}</p>
          <Button variant="outline" size="sm" className="mt-5" onClick={refresh}>
            Retry
          </Button>
        </div>
      </Frame>
    );
  }

  const gate = gates.find((g) => g.id === gateId);

  if (!gate) {
    return (
      <Frame className="mx-auto mt-8 w-full max-w-xl">
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <p className="text-sm leading-relaxed text-warning">Gate not found — it may have been deleted.</p>
          <Link
            to="/app/modules/prunblocker"
            className="mt-5 inline-flex items-center gap-1.5 text-xs text-muted transition-colors duration-200 ease-out hover:text-ink"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" /> back to gates
          </Link>
        </div>
      </Frame>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Reveal>
        <Link
          to="/app/modules/prunblocker"
          className="inline-flex items-center gap-1.5 text-xs text-faint transition-colors duration-200 ease-out hover:text-ink"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" /> all gates
        </Link>

        <header className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-white">{gate.repo}</h1>
              <Badge tone={gate.enabled ? 'accent' : 'muted'} dot>
                {gate.enabled ? 'enforcing' : 'paused'}
              </Badge>
            </div>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-faint">
              <GitPullRequest className="size-3.5" aria-hidden="true" />
              <code className="text-muted">{gate.source_branch}</code>
              <span aria-hidden="true">→</span>
              <code className="text-muted">{gate.target_branch}</code>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutate({ enabled: !gate.enabled })}
            >
              <Check className="size-4" aria-hidden="true" />
              {gate.enabled ? 'Pause gate' : 'Resume gate'}
            </Button>
            <Button variant="danger" size="sm" onClick={remove}>
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </Button>
          </div>
        </header>
      </Reveal>
<Reveal delay={80} className="mt-8">
        <Frame className="w-full">
          <div className="flex flex-col gap-3 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
              <ShieldAlert className="size-3.5 text-accent" aria-hidden="true" />
              Merge policy
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {GATE_POLICY_OPTIONS.map((option) => (
                <button
                  key={option.field}
                  type="button"
                  onClick={() => mutate({ [option.field]: !gate[option.field] })}
                  aria-pressed={gate[option.field]}
                  title={option.description}
                  className={`h-10 select-none border px-3 text-xs transition-colors duration-200 ease-out ${
                    gate[option.field]
                      ? 'border-accent/50 bg-accent-soft text-accent-bright'
                      : 'border-edge bg-abyss text-muted hover:border-line'
                  }`}
                >
                  {option.title}
                </button>
              ))}
            </div>

            {mutationError && (
              <p role="alert" className="mt-2 text-xs leading-relaxed text-warning">
                {mutationError}
              </p>
            )}
          </div>
        </Frame>
      </Reveal>

      <Reveal delay={140} className="mt-8">
        <Frame className="w-full">
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
              <Check className="size-3.5 text-accent" aria-hidden="true" />
              Required checks
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {gate.required_checks.map((check) => (
                <code key={check} className="border border-edge px-2 py-0.5 text-xs text-muted">
                  {check}
                </code>
              ))}
            </div>
            <form
              className="mt-4 flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const parsed = parseChecks(checksText);
                if (parsed.length === 0) return;
                void mutate({ requiredChecks: parsed }).then(() => setChecksText(''));
              }}
            >
              <Input
                label="Replace checks (comma separated)"
                placeholder="lint, build, test"
                value={checksText}
                onChange={(e) => setChecksText(e.target.value)}
              />
              <Button type="submit" variant="outline" size="md">
                Apply
              </Button>
            </form>
          </div>
        </Frame>
      </Reveal>

      <Reveal delay={200} className="mt-8">
        <EvaluatePanel
          gate={gate}
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

      <Reveal delay={260} className="mt-8">
        <EvaluationFeed
          evaluations={evaluations}
          loading={evalLoading}
          error={evalError}
          onRetry={refreshEval}
          empty="No evaluations have run against this gate yet."
        />
      </Reveal>
    </div>
  );
}