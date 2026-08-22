import { LoaderCircle, Layers, Terminal } from 'lucide-react';
import { useState } from 'react';

import { Frame } from '@/components/ui/Frame';
import type { TemplateRole } from '@/lib/database.types';

import type { TemplateMeta } from '../hooks/useTemplates';

/*
 * Template picker — "start a new onboarding from a role". Pure TS presets
 * (templates.ts), cloned server-side through createRunbookFromTemplate.
 */
interface RunbookTemplatesProps {
  templates: TemplateMeta[];
  onCreate: (role: TemplateRole) => Promise<void>;
}

export function RunbookTemplates({ templates, onCreate }: RunbookTemplatesProps) {
  const [busy, setBusy] = useState<TemplateRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(role: TemplateRole) {
    setBusy(role);
    setError(null);
    try {
      await onCreate(role);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  if (templates.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
        <Layers className="size-3.5" aria-hidden="true" />
        Start from a role template
      </div>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {templates.map((t) => (
          <Frame key={t.role} className="h-full">
            <button
              type="button"
              onClick={() => start(t.role)}
              disabled={busy !== null}
              className="flex h-full w-full flex-col items-start gap-2 px-4 py-4 text-left transition-colors duration-200 ease-out hover:bg-hover disabled:pointer-events-none disabled:opacity-50"
            >
              <div className="grid size-8 shrink-0 place-items-center border border-line bg-raised text-accent">
                {busy === t.role ? (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Terminal className="size-4" aria-hidden="true" />
                )}
              </div>
              <span className="text-sm font-semibold text-ink">{t.label}</span>
              <span className="text-[11px] text-faint">
                {t.taskCount} tasks · {t.sectionCount} stages
              </span>
            </button>
          </Frame>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs leading-relaxed text-warning">
          {error}
        </p>
      )}
    </div>
  );
}