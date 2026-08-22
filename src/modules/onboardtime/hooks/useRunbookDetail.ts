import { useCallback, useEffect, useState } from 'react';

import { getTeamAnalytics, listItems, listRunbooks } from '../api';
import type { ChecklistItem, Runbook, RunbookAnalytics } from '../types';

/** Loads one runbook + its ordered items + org-wide analytics in parallel. */
export function useRunbookDetail(orgId?: string, checklistId?: string) {
  const [runbook, setRunbook] = useState<Runbook | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [analytics, setAnalytics] = useState<RunbookAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!orgId || !checklistId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [runbooks, rows, analyticsRows] = await Promise.all([
        listRunbooks(orgId),
        listItems(orgId, checklistId),
        getTeamAnalytics(orgId),
      ]);
      setRunbook(runbooks.find((r) => r.id === checklistId) ?? null);
      setItems(rows);
      setAnalytics(analyticsRows);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [orgId, checklistId]);

  /** Swap two item rows locally (used for reorder — no full reload → no flicker). */
  const swapLocal = useCallback((i: number, j: number) => {
    setItems((prev) => {
      if (i < 0 || j < 0 || i >= prev.length || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }, []);

  /** Replace (or append) one item locally after a server PATCH/POST. */
  const applyItemLocally = useCallback((updated: ChecklistItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === updated.id);
      if (idx === -1) return [...prev, updated];
      const next = [...prev];
      next[idx] = updated;
      return next;
    });
  }, []);

  /** Remove one item locally (after DELETE). */
  const removeItemLocally = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  /** Silent analytics-only refresh — never touches `items`, so the list never reloads. */
  const refreshAnalyticsOnly = useCallback(async () => {
    if (!orgId) return;
    try {
      setAnalytics(await getTeamAnalytics(orgId));
    } catch {
      /* analytics is best-effort — never break the list over it */
    }
  }, [orgId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
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
  };
}