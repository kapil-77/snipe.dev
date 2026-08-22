import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { corsHeaders, isCors, json } from "../_shared/cors.ts";

/*
 * onboardtime-runbooks
 *
 * CRUD for module_onboardtime.checklists + lightweight analytics.
 *
 *   GET    /runbooks?org_id=...                 → list + item progress counts
 *   GET    /runbooks?org_id=...&analytics=true → { activeOnboardings, avgCompletion,
 *                                                  blockedTasks, commonBlockers[] } (org-wide)
 *   POST   /runbooks {org_id,title,description?,is_template?,role?,owner_id?,next_milestone?}
 *          /runbooks {org_id, template_id}       → clone a template runbook + its items
 *   PATCH  /runbooks {id,title?,description?,role?,owner_id?,next_milestone?,next_milestone_due?}
 *   DELETE /runbooks?id=...
 *
 * The caller's Authorization header is passed through to PostgREST, so RLS
 * (module_onboardtime.is_org_member) enforces every row it can touch.
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY");

function authedClient(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth) return { client: null, error: "missing authorization header" };
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    return { client: null, error: "Supabase env vars not configured" };
  }
  const client = createClient(SUPABASE_URL, SUPABASE_ANON, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { client, error: null };
}

/* Clone a template runbook into an active runbook with its items copied. */
async function cloneTemplate(
  client: ReturnType<typeof createClient>,
  orgId: string,
  templateId: string,
): Promise<{ ok: boolean; id?: string; error?: string; status?: number }> {
  const tpl = () => client.schema("module_onboardtime").from("checklists");
  const items = () => client.schema("module_onboardtime").from("checklist_items");

  const { data: templateList, error: tplErr } = await tpl()
    .select("*")
    .eq("id", templateId)
    .eq("is_template", true)
    .maybeSingle();
  if (tplErr || !templateList) {
    return { ok: false, error: tplErr?.message ?? "template not found", status: 404 };
  }

  const { data: tmplItems, error: tmplItemsErr } = await items()
    .select("*")
    .eq("checklist_id", templateId)
    .order("sort_order", { ascending: true });
  if (tmplItemsErr) return { ok: false, error: tmplItemsErr.message, status: 400 };

  const { data: created, error: createErr } = await tpl()
    .insert({
      org_id: orgId,
      title: templateList.title,
      description: templateList.description,
      is_template: false,
      role: templateList.role,
    })
    .select("id")
    .single();
  if (createErr || !created) {
    return { ok: false, error: createErr?.message ?? "failed to create runbook", status: 500 };
  }

  const rows = (tmplItems ?? []).map((it, i) => ({
    org_id: orgId,
    checklist_id: created.id,
    title: it.title,
    status: "todo" as const,
    section: it.section ?? "general",
    category: it.category ?? null,
    priority: it.priority ?? "medium",
    due_on: it.due_on ?? null,
    sort_order: i,
  }));
  if (rows.length > 0) {
    const { error: insErr } = await items().insert(rows);
    if (insErr) return { ok: false, error: insErr.message, status: 500 };
  }

  return { ok: true, id: created.id };
}

Deno.serve(async (req) => {
  if (isCors(req)) return new Response("ok", { headers: corsHeaders });

  const { client, error: authErr } = authedClient(req);
  if (!client) return json({ error: authErr ?? "unauthenticated" }, { status: 401 });

  const runbooks = () => client.schema("module_onboardtime").from("checklists");
  const items = () => client.schema("module_onboardtime").from("checklist_items");
  const url = new URL(req.url);

  try {
    if (req.method === "GET") {
      const org_id = url.searchParams.get("org_id");
      if (!org_id) return json({ error: "org_id query parameter is required" }, { status: 400 });

      // Analytics branch — org-wide stats, not per-runbook.
      if (url.searchParams.get("analytics") === "true") {
        const { data: runbookRows, error: rbErr } = await runbooks()
          .select("id, title, completed_at")
          .eq("org_id", org_id)
          .eq("is_template", false);
        if (rbErr) return json({ error: rbErr.message }, { status: 400 });

        const ids = (runbookRows ?? []).map((r) => r.id as string);
        const activeOnboardings = ids.length;

        let avgCompletion = 0;
        let blockedTasks = 0;
        const blockerCounts: Record<string, number> = {};

        if (ids.length > 0) {
          const { data: itemRows } = await items()
            .select("status, section, blocked")
            .eq("org_id", org_id)
            .in("checklist_id", ids);

          const byChecklist: Record<string, { total: number; done: number }> = {};
          for (const row of itemRows ?? []) {
            const key = String(row.checklist_id);
            byChecklist[key] ??= { total: 0, done: 0 };
            if (row.status === "done" && !row.blocked) byChecklist[key].done += 1;
            byChecklist[key].total += 1;
          }
          const pcts = Object.values(byChecklist).map(
            (c) => (c.total > 0 ? Math.round((c.done / c.total) * 100) : 0),
          );
          avgCompletion = pcts.length
            ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length)
            : 0;

          for (const row of itemRows ?? []) {
            if (row.blocked && row.status !== "done") {
              blockedTasks += 1;
              const label = row.section ?? "general";
              blockerCounts[label] = (blockerCounts[label] ?? 0) + 1;
            }
          }
        }

        const commonBlockers = Object.entries(blockerCounts)
          .map(([section, count]) => ({ section, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        return json({ activeOnboardings, avgCompletion, blockedTasks, commonBlockers });
      }

      const { data: list, error } = await runbooks()
        .select("*")
        .eq("org_id", org_id)
        .order("is_template", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) return json({ error: error.message }, { status: 400 });

      const ids = (list ?? []).map((r) => r.id as string);
      const counts: Record<string, { total: number; done: number }> = {};
      if (ids.length > 0) {
        const { data: itemRows } = await items()
          .select("checklist_id, status, blocked")
          .eq("org_id", org_id)
          .in("checklist_id", ids);
        for (const row of itemRows ?? []) {
          const key = String(row.checklist_id);
          counts[key] ??= { total: 0, done: 0 };
          counts[key].total += 1;
          if (row.status === "done" && !row.blocked) counts[key].done += 1;
        }
      }

      const nonTemplates = (list ?? []).filter((r) => !r.is_template);
      const allDone = nonTemplates.length > 0 &&
        nonTemplates.every((r) => (counts[r.id]?.done ?? 0) === (counts[r.id]?.total ?? 0));

      return json(
        (list ?? []).map((r) => ({
          ...r,
          itemCount: counts[r.id]?.total ?? 0,
          itemDone: counts[r.id]?.done ?? 0,
          pct: counts[r.id]?.total
            ? Math.round(((counts[r.id]?.done ?? 0) / counts[r.id].total) * 100)
            : 0,
          blocked: (counts[r.id]?.total ?? 0) > 0 && (counts[r.id]?.done ?? 0) < (counts[r.id]?.total ?? 0),
          allDone,
        })),
      );
    }

    if (req.method === "POST") {
      const body = await req.json();
      const org_id = String(body.org_id ?? "");
      const title = String(body.title ?? "").trim();
      if (!org_id || !title) {
        return json({ error: "org_id and title are required" }, { status: 400 });
      }

      // Template clone path: POST /runbooks {org_id, template_id}
      if (body.template_id) {
        const template_id = String(body.template_id);
        const clone = await cloneTemplate(client, org_id, template_id);
        if (!clone.ok) {
          return json({ error: clone.error ?? "clone failed" }, { status: clone.status ?? 500 });
        }
        return json({ ok: true, id: clone.id }, { status: 201 });
      }

      const { data, error } = await runbooks()
        .insert({
          org_id,
          title,
          description: body.description ? String(body.description) : null,
          is_template: Boolean(body.is_template),
          role: body.role ? String(body.role) : "core",
          owner_id: body.owner_id ? String(body.owner_id) : null,
          next_milestone: body.next_milestone ? String(body.next_milestone) : null,
          next_milestone_due: body.next_milestone_due ? String(body.next_milestone_due) : null,
        })
        .select("*")
        .single();
      if (error) return json({ error: error.message }, { status: 400 });

      return json({ ...data, itemCount: 0, itemDone: 0, pct: 0, blocked: false, allDone: false }, { status: 201 });
    }

    if (req.method === "PATCH") {
      const body = await req.json();
      const id = String(body.id ?? "");
      if (!id) return json({ error: "id is required" }, { status: 400 });

      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (body.title !== undefined) patch.title = String(body.title);
      if (body.description !== undefined) {
        patch.description = body.description == null ? null : String(body.description);
      }
      if (body.role !== undefined) patch.role = String(body.role);
      if (body.owner_id !== undefined) {
        patch.owner_id = body.owner_id === null || body.owner_id === "" ? null : String(body.owner_id);
      }
      if (body.next_milestone !== undefined) {
        patch.next_milestone = body.next_milestone == null ? null : String(body.next_milestone);
      }
      if (body.next_milestone_due !== undefined) {
        patch.next_milestone_due = body.next_milestone_due == null ? null : String(body.next_milestone_due);
      }
      if (body.completed_at !== undefined) {
        patch.completed_at = body.completed_at == null ? null : String(body.completed_at);
      }

      const { data, error } = await runbooks()
        .update(patch)
        .eq("id", id)
        .select("*")
        .single();
      if (error) return json({ error: error.message }, { status: 400 });
      return json(data);
    }

    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return json({ error: "id query parameter is required" }, { status: 400 });
      const { error } = await runbooks().delete().eq("id", id);
      if (error) return json({ error: error.message }, { status: 400 });
      return json({ ok: true });
    }
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }

  return json({ error: "method not allowed" }, { status: 405 });
});