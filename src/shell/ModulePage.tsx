import { ArrowLeft, LoaderCircle, Lock, Radio } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Frame } from '@/components/ui/Frame';
import { Reveal } from '@/components/ui/Reveal';
import { WaitlistForm } from '@/components/ui/WaitlistForm';
import { probeEdgeFunction, type ProbeResult } from '@/lib/api';
import { getModule } from '@/lib/module-registry';

/** Scaffolded table inventory per module (mirrors supabase/migrations/*.sql). */
export const MODULE_TABLES: Record<string, string[]> = {
  onboardtime: ['checklists', 'checklist_items'],
  prunblocker: ['merge_gates'],
  envsync: ['environment_vars'],
};

/** Stub edge functions scaffolded per module. */
export const MODULE_FUNCTIONS: Record<string, string[]> = {
  onboardtime: [
    'onboardtime-hello',
    'onboardtime-bootstrap',
    'onboardtime-runbooks',
    'onboardtime-items',
  ],
  prunblocker: ['prunblocker-hello'],
  envsync: ['envsync-hello'],
};

/**
 * Module screen — shows the blueprint of one sealed module: its schema,
 * tables, edge functions and RLS posture, plus a live "probe" against its
 * own edge function. Coming-soon state ships stand-ins, not dead links.
 */
export function ModulePage() {
  const { slug } = useParams<{ slug: string }>();
  const module = getModule(slug);
  const [probe, setProbe] = useState<ProbeResult | null>(null);
  const [probing, setProbing] = useState(false);

  if (!module) return <Navigate to="/app/modules" replace />;

  const comingSoon = module.status === 'coming-soon';
  const Icon = module.icon;
  const tables = MODULE_TABLES[module.slug] ?? [];
  const functions = MODULE_FUNCTIONS[module.slug] ?? [];

  async function runProbe() {
    if (!module) return;
    setProbing(true);
    const result = await probeEdgeFunction(`${module.edgePrefix}hello`);
    setProbe(result);
    setProbing(false);
  }

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
              <Icon className="size-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {module.name}
                </h1>
                <Badge tone={comingSoon ? 'muted' : 'accent'} dot>
                  {comingSoon ? 'coming soon' : 'live'}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-faint">
                {module.handle} · <span className="text-muted">{module.tagline}</span>
              </p>
            </div>
          </div>
          <Badge tone="line">{module.schema}</Badge>
        </header>

        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-muted">
          {module.description}
        </p>
      </Reveal>

      <Reveal delay={80} className="mt-8">
        <Frame className="w-full">
          <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
<dl className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">
                  schema
                </dt>
                <dd className="mt-1 text-ink">{module.schema}</dd>
                <dd className="text-xs text-faint">owned by this module only</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">
                  tables
                </dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {tables.length > 0 ? (
                    tables.map((table) => (
                      <code key={table} className="border border-line px-1.5 py-0.5 text-xs text-muted">
                        {table}
                      </code>
                    ))
                  ) : (
                    <span className="text-faint">—</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">
                  edge functions
                </dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {functions.map((name) => (
                    <code key={name} className="border border-line px-1.5 py-0.5 text-xs text-muted">
                      {name}
                    </code>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">
                  rls
                </dt>
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
                  Demo mode — configure <code className="text-muted">.env</code> to hit the real
                  function.
                </p>
              )}
            </div>
          </div>
        </Frame>
      </Reveal>

      {comingSoon && (
        <Reveal delay={160} className="mt-8">
          <Frame className="w-full">
            <div className="flex flex-col gap-4 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-md">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Early access for {module.name}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  The schema and edge functions are already scaffolded — this module only
                  needs a go signal. Leave your email and we’ll ping you when it ships.
                </p>
              </div>
              <div className="w-full md:w-80">
                <WaitlistForm moduleId={module.slug} source="module-page" size="md" />
              </div>
            </div>
          </Frame>
        </Reveal>
      )}
    </div>
  );
}