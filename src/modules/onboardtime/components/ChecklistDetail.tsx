import { ArrowLeft, ListChecks, LoaderCircle, Plus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Frame } from '@/components/ui/Frame';
import { Input } from '@/components/ui/Input';
import { Reveal } from '@/components/ui/Reveal';
import { createItem, deleteItem, updateItem } from '../api';
import { useRunbookDetail } from '../hooks/useRunbookDetail';
import { useWorkspaceOrg } from '../hooks/useWorkspaceOrg';
import { SECTION_LABELS } from '../types';
import type { ChecklistItem } from '../types';
import { AnalyticsBar } from './AnalyticsBar';
import { ItemRow } from './ItemRow';
import { NextMilestone } from './NextMilestone';
import { SectionHeader } from './SectionHeader';

/** Checklist detail — sectioned items, status/order, milestone + analytics. */
export function ChecklistDetail() {
  const { checklistId } = useParams<{ checklistId: string }>();
  const { org, loading: orgLoading, error: orgError, refresh: refreshOrg } = useWorkspaceOrg();
  const {
    runbook,
    items,
    analytics,
    loading,
    error,
    refresh,
    swapLocal,
    applyItemLocally,
    removeItemLocally,
    refreshAnalyticsOnly,
  } = useRunbookDetail(
    org?.orgId,
    checklistId,
  );

  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const doneCount = items.filter((i) => i.status === 'done').length;
  const pct = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  function toggleSection(section: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }

  async function run<T>(fn: () => Promise<T>): Promise<T | null> {
    setMutationError(null);
    try {
      return await fn();
    } catch (e) {
      setMutationError(e instanceof Error ? e.message : String(e));
      return null;
    }
  }

  async function addItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!org || !checklistId || !draft.trim()) return;
    setSaving(true);
    const created = await run(async () => {
      return await createItem(org.orgId, checklistId, { title: draft.trim() });
    });
    if (created) {
      setDraft('');
      applyItemLocally(created);
      void refreshAnalyticsOnly();
    }
    setSaving(false);
  }

  async function cycle(item: ChecklistItem) {
    // Direct complete-toggle: click ticks the box (todo → done, doing → done),
    // second click un-checks (done → todo). Applied OPTIMISTICALLY: the PATCH
    // returns the fresh row, which replaces the entry in React state — no full
    // list reload, so the row never refades / refetches.
    const next: ChecklistItem['status'] = item.status === 'done' ? 'todo' : 'done';
    setBusyId(item.id);
    const updated = await run(async () => {
      return await updateItem(item.id, { status: next });
    });
    if (updated) {
      applyItemLocally(updated);
      void refreshAnalyticsOnly();
    }
    setBusyId(null);
  }

  async function move(item: ChecklistItem, index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const neighbor = items[target];
    setBusyId(item.id);
    await run(async () => {
      await Promise.all([
        updateItem(item.id, { sort_order: neighbor.sort_order }),
        updateItem(neighbor.id, { sort_order: item.sort_order }),
      ]);
      // Swap in place so ordering updates without a full list reload.
      swapLocal(index, target);
    });
    setBusyId(null);
  }

  async function remove(item: ChecklistItem) {
    setBusyId(item.id);
    const ok = await run(async () => {
      await deleteItem(item.id);
      return true;
    });
    if (ok) {
      removeItemLocally(item.id);
      void refreshAnalyticsOnly();
    }
    setBusyId(null);
  }

  // Group items by section: known onboarding sections first (in order),
  // then any extra sections, each preserving item sort_order.
  const SECTION_ORDER: string[] = [
    'access',
    'dev-setup',
    'codebase',
    'team',
    'contribution',
    'general',
  ];
  const groups = new Map<string, ChecklistItem[]>();
  for (const item of items) {
    const key = item.section ?? 'general';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  const groupedSections = Array.from(groups.keys()).sort((a, b) => {
    const ia = SECTION_ORDER.indexOf(a);
    const ib = SECTION_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

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
    <div className="mx-auto w-full max-w-3xl">
      <Reveal>
        <Link
          to="/app/modules/onboardtime"
          className="inline-flex items-center gap-1.5 text-xs text-faint transition-colors duration-200 ease-out hover:text-ink"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" /> all runbooks
        </Link>

        <header className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {runbook?.title ?? 'Runbook'}
              </h1>
              <Badge tone="accent" dot>live</Badge>
            </div>
            <p className="mt-1 text-sm text-faint">
              {org.orgName} · <span className="text-muted">module_onboardtime</span>
            </p>
            {runbook?.description && (
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
                {runbook.description}
              </p>
            )}
          </div>
          <div className="w-full max-w-[180px]">
            <div className="flex items-center justify-between text-[11px] text-faint">
              <span>{doneCount} / {items.length}</span>
              <span>{pct}%</span>
            </div>
            <div aria-hidden="true" className="mt-1 h-1 w-full bg-raised">
              <div
                className="h-full bg-accent transition-[width] duration-200 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </header>
      </Reveal>

      <Reveal delay={80} className="mt-8">
        <Frame className="w-full">
          <form onSubmit={addItem} className="flex flex-col gap-3 p-5 sm:flex-row sm:p-6">
            <Input
              aria-label="New checklist item"
              placeholder="e.g. Enable 2FA, add to GitHub org, clone repos…"
              required
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={saving || !draft.trim()}
              className="shrink-0"
            >
              {saving ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Plus className="size-4" aria-hidden="true" />
              )}
              Add item
            </Button>
          </form>
          {mutationError && (
            <p role="alert" className="px-5 pb-4 text-xs leading-relaxed text-warning sm:px-6">
              {mutationError}
            </p>
          )}
        </Frame>
      </Reveal>

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
      ) : items.length === 0 ? (
        <Reveal className="mt-8">
          <Frame className="w-full">
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <ListChecks className="size-8 text-faint" aria-hidden="true" />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
                Nothing here yet. Add the first item above — every change is written
                through the <span className="text-ink">onboardtime-items</span> edge
                function.
              </p>
            </div>
          </Frame>
        </Reveal>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          {runbook?.next_milestone && (
            <NextMilestone title={runbook.next_milestone} dueOn={runbook.next_milestone_due} />
          )}

          <AnalyticsBar data={analytics} />

          {groupedSections.map((section) => {
            const sectionItems = groups.get(section)!;
            const sectionDone = sectionItems.filter((i) => i.status === 'done').length;
            const isOpen = !collapsed.has(section);
            return (
              <section key={section} className="flex flex-col gap-2">
                {groupedSections.length > 1 && (
                  <SectionHeader
                    title={SECTION_LABELS[section as keyof typeof SECTION_LABELS] ?? section}
                    count={sectionItems.length}
                    done={sectionDone}
                    open={isOpen}
                    onToggle={() => toggleSection(section)}
                  />
                )}
                {isOpen && (
                  <div className="flex flex-col gap-2">
                    {sectionItems.map((item, index) => (
                      <Reveal key={item.id} delay={Math.min(index, 4) * 40}>
                        <ItemRow
                          item={item}
                          index={index}
                          total={sectionItems.length}
                          busy={busyId === item.id}
                          onCycle={() => cycle(item)}
                          onMove={(dir) => move(item, index, dir)}
                          onDelete={() => remove(item)}
                        />
                      </Reveal>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}