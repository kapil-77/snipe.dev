import { corsHeaders, isCors, json } from "../_shared/cors.ts";

/*
 * prunblocker-webhook
 *
 * THE GITHUB ENFORCEMENT SEAM (stub).
 *
 * This function exists so going live in-shell today does NOT paint the
 * module into a corner: when real GitHub enforcement ships, a GitHub App
 * will deliver pull_request / check_run / check_suite events here, and this
 * function will:
 *
 *   1. resolve the org from module_prunblocker.github_installations
 *      (github_app_id + installation_id → org_id),
 *   2. fetch the live PR state (checks, approvals, mergeable state),
 *   3. call the shared evaluate logic (like prunblocker-evaluate) and
 *   4. report back to GitHub as a commit status / check-run conclusion.
 *
 * Today it returns a JSON 501 "not_configured" so no route integration is
 * silently missing — the schema + this entrypoint are the reserved surface.
 */

Deno.serve(async (req: Request) => {
  if (isCors(req)) return new Response("ok", { headers: corsHeaders });

  return json(
    {
      status: "not_configured",
      service: "prunblocker",
      message:
        "GitHub webhook delivery is not connected yet. The github_installations table + this endpoint are the reserved seam — declare gates from the UI and evaluate them via prunblocker-evaluate in the meantime.",
      table: "module_prunblocker.github_installations",
    },
    { status: 501 },
  );
});