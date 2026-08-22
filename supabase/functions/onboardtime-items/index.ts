import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { corsHeaders, isCors, json } from "../_shared/cors.ts";

/*
 * onboardtime-items
 *
 * CRUD for module_onboardtime.checklist_items.
 *
 *   GET    /items?org_id=...&checklist_id=...   → items ordered by sort_order
 *   POST   /items {org_id,checklist_id,title,section?,category?,priority?,due_on?} → appends
 *   PATCH  /items {id,title?,status?,sort_order?,section?,category?,priority?,blocked?,due_on?,owner_id?}
 *   DELETE /items?id=...
 *
 * The caller's Authorization header is passed through to PostgREST, so RLS
 * (module_onboardtime.is_org_member) enforces every row it can touch.
 */

const STATUSES = new Set(["todo", "doing", "done"]);
const PRIORITIES = new Set(["low", "medium", "high"]);

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

Deno.serve(async (req) => {
  if (isCors(req)) return new Response("ok", { headers: corsHeaders });

  const { client, error: authErr } = authedClient(req);
  if (!client) return json({ error: authErr ?? "unauthenticated" }, { status: 401 });

  const items = () => client.schema("module_onboardtime").from("checklist_items");
  const url = new URL(req.url);

  try {
    if (req.method === "GET") {
      const org_id = url.searchParams.get("org_id");
      const checklist_id = url.searchParams.get("checklist_id");
      if (!org_id || !checklist_id) {
        return json({ error: "org_id and checklist_id are required" }, { status: 400 });
      }

      const { data, error } = await items()
        .select("*")
        .eq("org_id", org_id)
        .eq("checklist_id", checklist_id)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) return json({ error: error.message }, { status: 400 });
      return json(data ?? []);
    }

    if (req.method === "POST") {
      const body = await req.json();
      const org_id = String(body.org_id ?? "");
      const checklist_id = String(body.checklist_id ?? "");
      const title = String(body.title ?? "").trim();
      if (!org_id || !checklist_id || !title) {
        return json({ error: "org_id, checklist_id and title are required" }, { status: 400 });
      }

      const { data: maxRow } = await items()
        .select("sort_order")
        .eq("org_id", org_id)
        .eq("checklist_id", checklist_id)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      const sort_order = typeof maxRow?.sort_order === "number" ? maxRow.sort_order + 1 : 0;

      const { data, error } = await items()
        .insert({
          org_id,
          checklist_id,
          title,
          status: "todo",
          sort_order,
          section: body.section ? String(body.section) : "general",
          category: body.category ? String(body.category) : null,
          priority: body.priority ? String(body.priority) : "medium",
          blocked: Boolean(body.blocked),
          due_on: body.due_on ? String(body.due_on) : null,
          owner_id: body.owner_id ? String(body.owner_id) : null,
        })
        .select("*")
        .single();
      if (error) return json({ error: error.message }, { status: 400 });
      return json(data, { status: 201 });
    }

    if (req.method === "PATCH") {
      const body = await req.json();
      const id = String(body.id ?? "");
      if (!id) return json({ error: "id is required" }, { status: 400 });

      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (body.title !== undefined) patch.title = String(body.title);
      if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order);
      if (body.status !== undefined) {
        const status = String(body.status);
        if (!STATUSES.has(status)) {
          return json({ error: `status must be one of: ${[...STATUSES].join(", ")}` }, { status: 400 });
        }
        patch.status = status;
      }
      if (body.section !== undefined) patch.section = body.section == null ? "general" : String(body.section);
      if (body.category !== undefined) patch.category = body.category == null ? null : String(body.category);
      if (body.priority !== undefined) {
        const priority = String(body.priority);
        if (!PRIORITIES.has(priority)) {
          return json({ error: `priority must be one of: ${[...PRIORITIES].join(", ")}` }, { status: 400 });
        }
        patch.priority = priority;
      }
      if (body.blocked !== undefined) patch.blocked = Boolean(body.blocked);
      if (body.due_on !== undefined) patch.due_on = body.due_on == null ? null : String(body.due_on);
      if (body.owner_id !== undefined) {
        patch.owner_id = body.owner_id === null || body.owner_id === "" ? null : String(body.owner_id);
      }

      const { data, error } = await items()
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
      const { error } = await items().delete().eq("id", id);
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