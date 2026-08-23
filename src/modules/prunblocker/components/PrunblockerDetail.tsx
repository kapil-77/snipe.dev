import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleAlert,
  GitPullRequest,
  LoaderCircle,
  Lock,
  Radio,
  Terminal,
} from 'lucide-react';
import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Frame } from '@/components/ui/Frame';
import { Reveal } from '@/components/ui/Reveal';
import { WaitlistForm } from '@/components/ui/WaitlistForm';
import { probeEdgeFunction, type ProbeResult } from '@/lib/api';
import { MODULE_FUNCTIONS, MODULE_TABLES, getModule } from '@/lib/module-registry';

/*
 * PR Unblocker Ã¢â‚¬â€ dedicated coming-soon detail page.
 * The INTERACTIVE PREVIEW is a local, simulated depiction of the merge-gate
 * workflow. It calls NO backend / edge function Ã¢â‚¬â€ it only steps through a
 * hardcoded scenario with subtle timed transitions. Clearly labelled preview.
 */

const PRE = {
  title: 'feat: parallel runbook evaluation',
  branches: 'feature/runbook-parallel Ã¢â€ â€™ main',
  author: 'kapil-77',
  checks: [
    { id: 'lint', label: 'lint Ã‚Â· CI', state: 'pass' as const },
    { id: 'build', label: 'build Ã‚Â· CI', state: 'pass' as const },
    { id: 'review', label: '1 / 1 approved', state: 'pass' as const },
    { id: 'conflicts', label: 'no merge conflicts', state: 'pass' as const },
  ],
};

type CheckState = 'pending' | 'pass';

interface PreviewState {
  running: boolean;
  checks: CheckState[];
  conflict: boolean;
  progress: number;
  evaluated: boolean;
}

const INITIAL: PreviewState = {
  running: false,
  checks: ['pass', 'pending', 'pending', 'pending'],
  conflict: true,
  progress: 0,
  evaluated: false,
};

export function PrunblockerDetail() {
  const module = getModule('prunblocker')!;
  const tables = MODULE_TABLES[module.slug] ?? [];
  const functions = MODULE_FUNCTIONS[module.slug] ?? [];

  const [probe, setProbe] = useState<ProbeResult | null>(null);
  const [probing, setProbing] = useState(false);
  const [state, setState] = useState<PreviewState>(INITIAL);

  async function runProbe() {
    setProbing(true);
    const result = await probeEdgeFunction(`${module.edgePrefix}hello`);
    setProbe(result);
    setProbing(false);
  }

  /** Simulated evaluation: step checks to passing, clear conflicts, flip decision. */
  function runEvaluation() {
    if (state.running) return;
    setState((s) => ({ ...s, running: true, evaluated: false, progress: 0 }));

    const timings = [450, 950, 1450, 1950];
    timings.forEach((ms, i) => {
      window.setTimeout(() => {
        setState((s) => {
          if (i < s.checks.length) {
            const checks = [...s.checks];
            checks[i] = 'pass';
            return { ...s, checks, progress: Math.round(((i + 1) / s.checks.length) * 100) };
          }
          return s;
        });
      }, ms);
    });

    window.setTimeout(() => {
      setState((s) => ({ ...s, running: false, conflict: false, progress: 100, evaluated: true }));
    }, 2300);
  }

  const decision =
    state.evaluated && !state.conflict
      ? { label: 'READY TO MERGE', tone: 'accent' as const }
      : { label: 'MERGE BLOCKED', tone: 'warning' as const };

  return (
    <div className="max-w-4xl">
      <Reveal>
        <Link
          to="/app/modules"
          className="inline-flex items-center gap-1.5 text-xs text-faint transition-colors duration-200 ease-out hover:text-ink"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" /> all modules
        </Link>

        <header className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="grid size-14 place-items-center border border-line bg-raised text-ink">
              <GitPullRequest className="size-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{module.name}</h1>
                <Badge tone="muted" dot>coming soon</Badge>
              </div>
              <p className="mt-1 text-sm text-faint">
                {module.handle} Ã‚Â· <span className="text-muted">{module.tagline}</span>
              </p>
            </div>
          </div>
          <Badge tone="line">{module.schema}</Badge>
        </header>

        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-muted">{module.description}</p>
      </Reveal>

      {/* ================= interactive preview ================= */}
      <Reveal delay={80} className="mt-8">
        <Frame className="w-full">
          <div className="flex flex-col gap-5 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Terminal className="size-4 text-accent" aria-hidden="true" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink">
                  Interactive preview
                </h2>
              </div>
              <Badge tone="line">simulated Ã‚Â· not live</Badge>
            </div>

            <div className="flex flex-col gap-3">
              {/* PR header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border border-line bg-raised px-4 py-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-sm font-semibold text-ink">{PRE.title}</span>
                  <span className="text-[11px] text-faint">
                    {PRE.branches} Ã‚Â· opened by {PRE.author}
                  </span>
                </div>
                <Badge tone="accent" dot>open</Badge>
              </div>{/* checks */}
              <div className="grid gap-2 sm:grid-cols-2">
                {PRE.checks.map((c, i) => {
                  const isPass = state.checks[i] === 'pass';
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-2 border border-line bg-abyss px-3 py-2 text-xs"
                    >
                      <span className="flex items-center gap-2 text-muted">
                        {isPass ? (
                          <CheckCircle2 className="size-3.5 shrink-0 text-accent" aria-hidden="true" />
                        ) : state.running ? (
                          <LoaderCircle className="size-3.5 shrink-0 animate-spin text-faint" aria-hidden="true" />
                        ) : (
                          <CircleAlert className="size-3.5 shrink-0 text-warning" aria-hidden="true" />
                        )}
                        {c.label}
                      </span>
                      <span className={isPass ? 'text-accent-bright' : 'text-faint'}>
                        {isPass ? 'passed' : 'required'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* conflict detection */}
              <div className="flex items-center justify-between gap-2 border border-line bg-abyss px-3 py-2 text-xs">
                <span className="flex items-center gap-2 text-muted">
                  {state.conflict ? (
                    <CircleAlert className="size-3.5 shrink-0 text-warning" aria-hidden="true" />
                  ) : (
                    <Check className="size-3.5 shrink-0 text-accent" aria-hidden="true" />
                  )}
                  merge conflicts
                </span>
                <span className={state.conflict ? 'text-warning' : 'text-accent-bright'}>
                  {state.conflict ? 'detected' : 'resolved'}
                </span>
              </div>

              {/* required-checks progress */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] text-faint">
                  <span>required checks</span>
                  <span>{state.progress}%</span>
                </div>
                <div aria-hidden="true" className="h-1 w-full bg-raised">
                  <div className="h-full bg-accent transition-[width] duration-300 ease-out" style={{ width: `${state.progress}%` }} />
                </div>
              </div>

              {/* merge decision */}
              <div
                className={
                  decision.tone === 'accent'
                    ? 'flex items-center justify-between gap-2 border border-accent/40 bg-accent-soft px-4 py-3'
                    : 'flex items-center justify-between gap-2 border border-warning/40 bg-warning/10 px-4 py-3'
                }
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {decision.tone === 'accent' ? (
                    <CheckCircle2 className="size-4 text-accent" aria-hidden="true" />
                  ) : (
                    <CircleAlert className="size-4 text-warning" aria-hidden="true" />
                  )}
                  <span className={decision.tone === 'accent' ? 'text-accent-bright' : 'text-warning'}>
                    {decision.label}
                  </span>
                </span>
                <span className="text-[11px] text-faint">final decision</span>
              </div>
            </div>

            <Button variant="outline" size="md" onClick={runEvaluation} disabled={state.running}>
              {state.running ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Radio className="size-4" aria-hidden="true" />
              )}
              {state.evaluated ? 'Re-run preview' : 'Run evaluation'}
            </Button>
            <p className="text-xs leading-relaxed text-faint">
              Preview only Ã¢â‚¬â€ this scenario is hard-coded, not wired to a merge engine or your repo.
            </p>
          </div>
        </Frame>
      </Reveal>
      {/* ================= module architecture ================= */}
      <Reveal delay={140} className="mt-8">
        <div className="flex items-center gap-2">
          <Lock className="size-4 text-accent" aria-hidden="true" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink">Module architecture</h2>
        </div>

        {/* visual flow: PR Ã¢â€ â€™ edge fn Ã¢â€ â€™ merge gates Ã¢â€ â€™ decision */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {['Pull request', 'prunblocker-* edge fn', 'merge_gates rows', 'Decision'].map((step, i, arr) => (
            <Fragment key={step}>
              <span className="border border-line bg-raised px-2.5 py-1.5 text-muted">{step}</span>
              {i < arr.length - 1 && <ArrowRight className="size-3.5 text-faint" aria-hidden="true" />}
            </Fragment>
          ))}
        </div>

        <Frame className="mt-4 w-full">
          <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">schema</dt>
                <dd className="mt-1 text-ink">{module.schema}</dd>
                <dd className="text-xs text-faint">owned by this module only</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">tables</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {tables.map((table) => (
                    <code key={table} className="border border-line px-1.5 py-0.5 text-xs text-muted">{table}</code>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">edge functions</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {functions.map((name) => (
                    <code key={name} className="border border-line px-1.5 py-0.5 text-xs text-muted">{name}</code>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">rls</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-xs text-accent-bright">
                  <Lock className="size-3.5" aria-hidden="true" /> enabled from day one
                </dd>
                <dd className="text-xs text-faint">scoped to org_id / user_id</dd>
              </div>
            </dl>

            <div className="flex flex-col gap-3 sm:w-64">
              <Button variant="outline" size="md" onClick={runProbe} disabled={probing}>
                {probing ? (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Radio className="size-4" aria-hidden="true" />
                )}
                Probe edge function
              </Button>
              {probe && (
                <pre className="max-h-48 overflow-auto border border-line bg-abyss p-3 text-[11px] leading-relaxed text-muted">
                  {JSON.stringify(probe, null, 2)}
                </pre>
              )}
              {probe?.demo && (
                <p className="text-xs leading-relaxed text-faint">
                  Demo mode Ã¢â‚¬â€ configure <code className="text-muted">.env</code> to hit the real function.
                </p>
              )}
            </div>
          </div>
        </Frame>
      </Reveal>cd c:\Users\bhatt\Documents\react_projects\snipe.dev; $p='src\modules\prunblocker\components\PrunblockerDetail.tsx'; $cstr = @'

      {/* ================= waitlist CTA ================= */}
      <Reveal delay={200} className="mt-8">
        <Frame className="w-full">
          <div className="flex flex-col gap-4 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-md">
              <h2 className="text-lg font-bold tracking-tight text-white">Be first to unblock</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Merge policies, conflict locks and required checks Ã¢â‚¬â€ enforced the moment a PR leaves draft.
                Leave your email and weÃ¢â‚¬â„¢ll ping you the day it ships.
              </p>
            </div>
            <div className="w-full md:w-80">
              <WaitlistForm moduleId={module.slug} source="module-page" size="md" buttonLabel="Be first to unblock" />
            </div>
          </div>
        </Frame>
      </Reveal>
    </div>
  );
}
