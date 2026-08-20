import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { corsHeaders, isCors, json } from "../_shared/cors.ts";

/*
 * onboardtime-runbooks
 *
 * CRUD for module_onboardtime.checklists.
 *
 *   GET    /runbooks?org_id=...   → list + item progress counts
 *   POST   /runbooks {org_id,title,description?,is_template?}
 *   PATCH  /runbooks {id,title?,description?}
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
          .select("checklist_id, status")
          .eq("org_id", org_id)
          .in("checklist_id", ids);
        for (const row of itemRows ?? []) {
          const key = String(row.checklist_id);
          counts[key] ??= { total: 0, done: 0 };
          counts[key].total += 1;
          if (row.status === "done") counts[key].done += 1;
        }
      }

      return json(
        (list ?? []).map((r) => ({
          ...r,
          itemCount: counts[r.id]?.total ?? 0,
          itemDone: counts[r.id]?.done ?? 0,
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

      const { data, error } = await runbooks()
        .insert({
          org_id,
          title,
          description: body.description ? String(body.description) : null,
          is_template: Boolean(body.is_template),
        })
        .select("*")
        .single();
      if (error) return json({ error: error.message }, { status: 400 });

      return json({ ...data, itemCount: 0, itemDone: 0 }, { status: 201 });
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