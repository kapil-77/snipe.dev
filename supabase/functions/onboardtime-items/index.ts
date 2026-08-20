import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { corsHeaders, isCors, json } from "../_shared/cors.ts";

/*
 * onboardtime-items
 *
 * CRUD for module_onboardtime.checklist_items.
 *
 *   GET    /items?org_id=...&checklist_id=...   → items ordered by sort_order
 *   POST   /items {org_id,checklist_id,title}   → appends (max sort_order + 1)
 *   PATCH  /items {id,title?,status?,sort_order?}
 *   DELETE /items?id=...
 *
 * The caller's Authorization header is passed through to PostgREST, so RLS
 * (module_onboardtime.is_org_member) enforces every row it can touch.
 */

const STATUSES = new Set(["todo", "doing", "done"]);

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