import {
  CheckCircle2,
  CircleAlert,
  GitPullRequest,
  LoaderCircle,
  Radio,
  ShieldCheck,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Frame } from '@/components/ui/Frame';
import { Input } from '@/components/ui/Input';

import type { EvaluationResult, MergeGate, PrReport } from '../types';
import { parseChecks } from '../parseChecks';
import { VERDICT_LABELS } from '../types';

/*
 * Enforcement runner form — collects a real PR report and hands it to the
 * parent via `onSubmitRun`, which calls `prunblocker-evaluate`. The parent
 * owns the `useEvaluate` hook + audit feed so a fresh record can be prepended.
 * A non-applying result renders as an out-of-scope notice, not an error.
 */

interface EvaluatePanelProps {
  /** Preset fields from the gate being inspected (detail page). */
  gate?: MergeGate;
  busy: boolean;
  result: EvaluationResult | null;
  error: string | null;
  onSubmitRun: (report: PrReport) => void;
}

export function EvaluatePanel(props: EvaluatePanelProps) {
  const { gate, busy, result, error, onSubmitRun } = props;

  const [repo, setRepo] = useState(gate?.repo ?? '');
  const [sourceBranch, setSourceBranch] = useState('feature/new-renderer');
  const [targetBranch, setTargetBranch] = useState('main');
  const [checksText, setChecksText] = useState(gate?.required_checks.join(', ') ?? 'lint, build');
  const [approvals, setApprovals] = useState('1');
  const [conflict, setConflict] = useState(false);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmitRun({
      repo: repo.trim(),
      sourceBranch: sourceBranch.trim(),
      targetBranch: targetBranch.trim(),
      passedChecks: parseChecks(checksText),
      reviewApprovals: Number(approvals),
      hasConflicts: conflict,
    });
  }
return (
    <Frame className="w-full">
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          <ShieldCheck className="size-3.5 text-accent" aria-hidden="true" />
          {gate ? 'Evaluate a PR against this gate' : 'Run a merge-gate evaluation'}
        </div>

        <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-2">
          <Input
            label="Repo"
            placeholder="owner/repo"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="From branch"
              placeholder="feature/…"
              value={sourceBranch}
              onChange={(e) => setSourceBranch(e.target.value)}
              required
            />
            <Input
              label="Into branch"
              placeholder="main"
              value={targetBranch}
              onChange={(e) => setTargetBranch(e.target.value)}
              required
            />
          </div>
          <Input
            label="Passed checks (comma separated)"
            placeholder="lint, build, test"
            value={checksText}
            onChange={(e) => setChecksText(e.target.value)}
          />
          <div className="flex flex-wrap items-end gap-2">
            <Input
              label="Approvals"
              type="number"
              min={0}
              className="w-28"
              value={approvals}
              onChange={(e) => setApprovals(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setConflict((v) => !v)}
              aria-pressed={conflict}
              className={`h-10 select-none border px-3 text-sm transition-colors duration-200 ease-out ${
                conflict
                  ? 'border-warning/60 bg-warning/10 text-warning'
                  : 'border-edge bg-abyss text-muted hover:border-line'
              }`}
            >
              {conflict ? 'conflicts' : 'no conflicts'}
            </button>
          </div>

          <div className="md:col-span-2">
            <Button type="submit" variant="primary" size="md" disabled={busy}>
              {busy ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Radio className="size-4" aria-hidden="true" />
              )}
              Evaluate PR
            </Button>
          </div>
        </form>
{error && (
          <p role="alert" className="mt-3 text-xs leading-relaxed text-warning">
            {error}
          </p>
        )}

        {!error && result && (
          <div
            className={`mt-4 border px-4 py-3 ${
              result.applies === false
                ? 'border-line bg-raised'
                : result.verdict === 'ready'
                  ? 'border-accent/40 bg-accent-soft'
                  : 'border-warning/40 bg-warning/10'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                {result.applies === false ? (
                  <CircleAlert className="size-4 shrink-0 text-faint" aria-hidden="true" />
                ) : result.verdict === 'ready' ? (
                  <CheckCircle2 className="size-4 shrink-0 text-accent-bright" aria-hidden="true" />
                ) : (
                  <CircleAlert className="size-4 shrink-0 text-warning" aria-hidden="true" />
                )}
                <span className="min-w-0 truncate text-sm font-semibold text-ink">
                  {result.applies === false ? 'Out of gate scope' : result.summary}
                </span>
              </div>
              {result.verdict && (
                <Badge tone={result.verdict === 'ready' ? 'accent' : 'warning'} dot>
                  {VERDICT_LABELS[result.verdict]}
                </Badge>
              )}
            </div>

            {result.applies === false && result.reason && (
              <p className="mt-2 text-xs leading-relaxed text-faint">{result.reason}</p>
            )}

            {result.blockedReasons && result.blockedReasons.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1">
                {result.blockedReasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-1.5 text-xs text-warning">
                    <GitPullRequest className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                    {reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Frame>
  );
}