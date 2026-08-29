import { GitPullRequest, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Frame } from '@/components/ui/Frame';
import { Reveal } from '@/components/ui/Reveal';

import { deleteGate } from '../api';
import { useEvaluate } from '../hooks/useEvaluate';
import { useEvaluations } from '../hooks/useEvaluations';
import { useGates } from '../hooks/useGates';
import { useWorkspaceOrg } from '../hooks/useWorkspaceOrg';
import { CreateGateForm } from './CreateGateForm';
import { EvaluatePanel } from './EvaluatePanel';
import { EvaluationFeed } from './EvaluationFeed';
import { GateCard } from './GateCard';

/** PR Unblocker home — declare gates, run an evaluation, follow the audit trail. */
export function PrunblockerHome() {
  const { org, loading: orgLoading, error: orgError, refresh: refreshOrg } = useWorkspaceOrg();
  const { gates, error, refresh, applyGateLocally, removeGateLocally } =
    useGates(org?.orgId);
  const { evaluations, loading: evalLoading, error: evalError, refresh: refreshEval, prependLocally } =
    useEvaluations(org?.orgId);
  const { result, busy, error: evalRunError, run } = useEvaluate(org?.orgId);

  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function remove(id: string) {
    try {
      await deleteGate(id);
      removeGateLocally(id);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : String(err));
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
        <CreateGateForm orgId={org.orgId} onCreated={applyGateLocally} />
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
          {deleteError && (
            <p role="alert" className="mt-3 text-xs leading-relaxed text-warning">
              {deleteError}
            </p>
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
