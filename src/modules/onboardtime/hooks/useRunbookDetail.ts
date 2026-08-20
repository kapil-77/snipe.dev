import { useCallback, useEffect, useState } from 'react';

import { listItems, listRunbooks } from '../api';
import type { ChecklistItem, Runbook } from '../types';

/** Loads one runbook + its ordered items via the module edge functions. */
export function useRunbookDetail(orgId?: string, checklistId?: string) {
  const [runbook, setRunbook] = useState<Runbook | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!orgId || !checklistId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [runbooks, rows] = await Promise.all([
        listRunbooks(orgId),
        listItems(orgId, checklistId),
      ]);
      setRunbook(runbooks.find((r) => r.id === checklistId) ?? null);
      setItems(rows);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [orgId, checklistId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { runbook, items, loading, error, refresh };
}