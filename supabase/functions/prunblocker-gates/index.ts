import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { corsHeaders, isCors, json } from "../_shared/cors.ts";

/*
 * prunblocker-gates
 *
 * CRUD for module_prunblocker.merge_gates.
 *
 *   GET    /gates?org_id=...          → all gates for the org (ordered oldest first)
 *   POST   /gates {org_id, repo, source_branch?, target_branch?, required_checks[]?,
 *                  require_review?, block_on_conflicts?, enabled?}
 *   PATCH  /gates {id, ...}           → update any editable field (incl. enable/disable)
 *   DELETE /gates?id=...
 *
 * The caller's Authorization header is passed through to PostgREST, so RLS
 * (module_prunblocker.is_org_member) enforces every row it can touch.
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

  const gates = () => client.schema("module_prunblocker").from("merge_gates");
  const url = new URL(req.url);

  try {
    if (req.method === "GET") {
      const org_id = url.searchParams.get("org_id");
      if (!org_id) return json({ error: "org_id query parameter is required" }, { status: 400 });

      const { data, error } = await gates()
        .select("*")
        .eq("org_id", org_id)
        .order("created_at", { ascending: true });
      if (error) return json({ error: error.message }, { status: 400 });
      return json(data ?? []);
    }

    if (req.method === "POST") {
      const body = await req.json();
      const org_id = String(body.org_id ?? "");
      const repo = String(body.repo ?? "").trim();
      if (!org_id || !repo) {
        return json({ error: "org_id and repo are required" }, { status: 400 });
      }

      const required_checks = Array.isArray(body.required_checks)
        ? body.required_checks.map((c: unknown) => String(c).trim()).filter(Boolean)
        : [];

      const { data, error } = await gates()
        .insert({
          org_id,
          repo,
          source_branch: body.source_branch ? String(body.source_branch) : ".*",
          target_branch: body.target_branch ? String(body.target_branch) : "(main|master)",
          required_checks,
          require_review: body.require_review === undefined ? true : Boolean(body.require_review),
          block_on_conflicts: body.block_on_conflicts === undefined ? true : Boolean(body.block_on_conflicts),
          enabled: body.enabled === undefined ? true : Boolean(body.enabled),
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
      if (body.repo !== undefined) patch.repo = String(body.repo).trim();
      if (body.source_branch !== undefined) {
        patch.source_branch = body.source_branch === "" ? ".*" : String(body.source_branch);
      }
      if (body.target_branch !== undefined) {
        patch.target_branch = body.target_branch === "" ? "(main|master)" : String(body.target_branch);
      }
      if (body.required_checks !== undefined) {
        patch.required_checks = Array.isArray(body.required_checks)
          ? body.required_checks.map((c: unknown) => String(c).trim()).filter(Boolean)
          : [];
      }
      if (body.require_review !== undefined) patch.require_review = Boolean(body.require_review);
      if (body.block_on_conflicts !== undefined) patch.block_on_conflicts = Boolean(body.block_on_conflicts);
      if (body.enabled !== undefined) patch.enabled = Boolean(body.enabled);

      const { data, error } = await gates()
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
      const { error } = await gates().delete().eq("id", id);
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