import { ListChecks, LoaderCircle, Plus, Route as RouteIcon } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Frame } from '@/components/ui/Frame';
import { Input } from '@/components/ui/Input';
import { Reveal } from '@/components/ui/Reveal';
import type { TemplateRole } from '@/lib/database.types';
import { createRunbook, createRunbookFromTemplate, deleteRunbook } from '../api';
import { useRunbooks } from '../hooks/useRunbooks';
import { useTemplates } from '../hooks/useTemplates';
import { useWorkspaceOrg } from '../hooks/useWorkspaceOrg';
import { RunbookCard } from './RunbookCard';
import { RunbookTemplates } from './RunbookTemplates';

/** Onboardtime home — runbook grid + template picker + create form. */
export function OnboardtimeHome() {
  const { org, loading: orgLoading, error: orgError, refresh: refreshOrg } = useWorkspaceOrg();
  const { runbooks, loading, error, refresh } = useRunbooks(org?.orgId);
  const templates = useTemplates();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!org || !title.trim()) return;
    setSaving(true);
    setFormError(null);
    try {
      await createRunbook(org.orgId, {
        title: title.trim(),
        description: description.trim() || null,
      });
      setTitle('');
      setDescription('');
      await refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function createFromTemplate(role: TemplateRole) {
    if (!org) return;
    const created = await createRunbookFromTemplate(org.orgId, role);
    navigate(`/app/modules/onboardtime/${created.id}`);
  }

  async function remove(id: string) {
    try {
      await deleteRunbook(id);
      await refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
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
              <RouteIcon className="size-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Onboardtime
                </h1>
                <Badge tone="accent" dot>live</Badge>
              </div>
              <p className="mt-1 text-sm text-faint">
                {org.orgName} · <span className="text-muted">module_onboardtime</span>
                {org.userEmail ? ` · ${org.userEmail}` : ''}
              </p>
            </div>
          </div>
        </header>
      </Reveal>

      <Reveal delay={80} className="mt-8">
        <Frame className="w-full">
          <form onSubmit={submit} className="flex flex-col gap-3 p-5 sm:p-6">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <Input
                label="Runbook title"
                placeholder="New hire runbook"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                label="Description (optional)"
                placeholder="Day-1 checklist for new engineers"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex items-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving || !title.trim()}
                  className="w-full md:w-auto"
                >
                  {saving ? (
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Plus className="size-4" aria-hidden="true" />
                  )}
                  New runbook
                </Button>
              </div>
            </div>
            {formError && (
              <p role="alert" className="text-xs leading-relaxed text-warning">
                {formError}
              </p>
            )}
          </form>
        </Frame>
      </Reveal>

      {templates.length > 0 && (
        <Reveal className="mt-8">
          <RunbookTemplates templates={templates} onCreate={createFromTemplate} />
        </Reveal>
      )}

      {loading ? (
        <div className="flex min-h-[24vh] items-center justify-center">
          <LoaderCircle className="size-6 animate-spin text-muted" aria-hidden="true" />
        </div>
      ) : error ? (
        <Frame className="mt-8 w-full">
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <p className="text-sm leading-relaxed text-warning">{error}</p>
            <Button variant="outline" size="sm" className="mt-5" onClick={refresh}>
              Retry
            </Button>
          </div>
        </Frame>
      ) : runbooks.length === 0 ? (
        <Reveal className="mt-8">
          <Frame className="w-full">
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <ListChecks className="size-8 text-faint" aria-hidden="true" />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
                No runbooks yet. Create your first onboarding checklist above — it will
                live in <span className="text-ink">module_onboardtime</span>, scoped to
                your org.
              </p>
            </div>
          </Frame>
        </Reveal>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {runbooks.map((runbook, index) => (
            <Reveal key={runbook.id} delay={(index % 3) * 70} className="h-full">
              <RunbookCard runbook={runbook} onDelete={remove} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}