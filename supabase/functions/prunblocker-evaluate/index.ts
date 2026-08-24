import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { corsHeaders, isCors, json } from "../_shared/cors.ts";

/*
 * prunblocker-evaluate
 *
 * The in-shell ENFORCEMENT step: given a PR's live report (what checks
 * passed, how many approvals, whether it conflicts), resolve the matching
 * enabled org gate and return a decision:
 *
 *   POST /evaluate
 *   {
 *     org_id, repo,
 *     source_branch, target_branch,          // used to match a gate
 *     passed_checks: string[],               // checks that actually passed
 *     review_approvals?: number,             // approvals actually received
 *     has_conflicts?: boolean                // GitHub merge-conflict state
 *   }
 *
 * Matching rule: an enabled gate applies when repo is equal (case-insensitive)
 * and BOTH source/target branches match the gate's regex patterns. If no gate
 * applies the function returns a 404 with `applies: false` — nothing is
 * persisted, the PR is simply out of scope.
 *
 * Verdict rule (per gate):
 *   1. conflict lock  — if block_on_conflicts && has_conflicts → BLOCKED
 *   2. required checks — every gate.required_checks must be in passed_checks
 *   3. review requirement — if require_review, at least 1 approval
 *   Any failure ⇒ verdict 'blocked' with human-readable blocked_reasons.
 *   All pass ⇒ verdict 'ready'.
 *
 * Every verdict is PERSISTED to module_prunblocker.pr_evaluations — the
 * org-scoped enforcement audit trail. The caller's Authorization header is
 * passed to PostgREST so RLS gates every row it can read/write.
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

/** Convert a gate branch pattern (e.g. `(main|master)`) into a RegExp. */
function branchPattern(pattern: string): RegExp {
  try {
    return new RegExp(`^${pattern}$`);
  } catch {
    // A broken pattern must never silently open the gate — match nothing.
    return /$^/;
  }
}

Deno.serve(async (req) => {
  if (isCors(req)) return new Response("ok", { headers: corsHeaders });

  const { client, error: authErr } = authedClient(req);
  if (!client) return json({ error: authErr ?? "unauthenticated" }, { status: 401 });

  const gates = () => client.schema("module_prunblocker").from("merge_gates");
  const evaluations = () => client.schema("module_prunblocker").from("pr_evaluations");

  try {
    // GET — audit-trail readback for the same function that WRITES the row.
    if (req.method === "GET") {
      const url = new URL(req.url);
      const org_id = url.searchParams.get("org_id");
      const gate_id = url.searchParams.get("gate_id");
      if (!org_id) return json({ error: "org_id query parameter is required" }, { status: 400 });

      let q = evaluations()
        .select("*")
        .eq("org_id", org_id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (gate_id) q = q.eq("gate_id", gate_id);

      const { data, error } = await q;
      if (error) return json({ error: error.message }, { status: 400 });
      return json(data ?? []);
    }

    if (req.method !== "POST") {
      return json({ error: "method not allowed" }, { status: 405 });
    }

    const body = await req.json();
    const org_id = String(body.org_id ?? "");
    const repo = String(body.repo ?? "").trim();
    const source_branch = String(body.source_branch ?? "").trim();
    const target_branch = String(body.target_branch ?? "").trim();

    if (!org_id || !repo || !source_branch || !target_branch) {
      return json(
        { error: "org_id, repo, source_branch and target_branch are required" },
        { status: 400 },
      );
    }

    const passed_checks = Array.isArray(body.passed_checks)
      ? body.passed_checks.map((c: unknown) => String(c).trim()).filter(Boolean)
      : [];
    const review_approvals = Number(body.review_approvals ?? 0);
    const has_conflicts = Boolean(body.has_conflicts);

    // Resolve the FIRST enabled gate that applies to this repo + branches.
    const { data: gatesList, error: gatesErr } = await gates()
      .select("*")
      .eq("org_id", org_id)
      .eq("enabled", true);
    if (gatesErr) return json({ error: gatesErr.message }, { status: 400 });

    const gate = (gatesList ?? []).find((g: Record<string, unknown>) => {
      if (String(g.repo).toLowerCase() !== repo.toLowerCase()) return false;
      const sourceOk = branchPattern(String(g.source_branch ?? ".*")).test(source_branch);
      const targetOk = branchPattern(String(g.target_branch ?? "(main|master)")).test(target_branch);
      return sourceOk && targetOk;
    });

    if (!gate) {
      return json(
        {
          applies: false,
          reason: `No enabled merge gate covers ${repo} (${source_branch} → ${target_branch}).`,
        },
        { status: 404 },
      );
    }

    const gateChecks = Array.isArray(gate.required_checks) ? gate.required_checks : [];
    const isEnabledReview = Boolean(gate.require_review);
    const isEnabledConflict = Boolean(gate.block_on_conflicts);

    // -- compute blocked reasons -------------------------------------
    const blocked_reasons: string[] = [];

    if (isEnabledConflict && has_conflicts) {
      blocked_reasons.push("Merge conflicts detected — resolve them before merging.");
    }

    const missingChecks = gateChecks.filter((c: unknown) => {
      const label = String(c);
      return !passed_checks.some((p) => p.toLowerCase() === label.toLowerCase());
    });
    if (missingChecks.length > 0) {
      blocked_reasons.push(
        `Missing required check${missingChecks.length === 1 ? "" : "s"}: ${missingChecks.join(", ")}.`,
      );
    }

    if (isEnabledReview && review_approvals < 1) {
      blocked_reasons.push("At least 1 review approval is required.");
    }

    const verdict = blocked_reasons.length === 0 ? "ready" : "blocked";

    // -- persist the enforcement audit record -------------------------
    const { data: evaluation, error: insertErr } = await evaluations()
      .insert({
        org_id,
        gate_id: gate.id,
        repo,
        source_branch,
        target_branch,
        required_checks: gateChecks,
        passed_checks,
        required_reviews: isEnabledReview ? 1 : 0,
        review_approvals,
        has_conflicts,
        verdict,
        blocked_reasons,
      })
      .select("*")
      .single();
    if (insertErr) {
      // Enforcement never silently no-ops: surface the DB error loudly.
      return json({ error: `could not persist evaluation: ${insertErr.message}` }, { status: 500 });
    }

    return json({
      applies: true,
      gate,
      verdict,
      blocked_reasons,
      evaluation,
      summary:
        verdict === "ready"
          ? "Every declared requirement is met — READY TO MERGE."
          : "The merge gate is not satisfied — MERGE BLOCKED.",
    }, { status: 201 });
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
});