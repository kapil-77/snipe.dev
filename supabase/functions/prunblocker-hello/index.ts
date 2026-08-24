import { corsHeaders, isCors, json } from "../_shared/cors.ts";

/**
 * prunblocker-hello
 * Health probe for the PR Unblocker module (module_prunblocker schema only).
 */
Deno.serve(async (req: Request) => {
  if (isCors(req)) return new Response("ok", { headers: corsHeaders });

  return json(
    {
      status: "live",
      service: "prunblocker",
      schema: "module_prunblocker",
      tables: ["merge_gates", "pr_evaluations", "github_installations"],
      message:
        "Merge gates, enforcement audit trail and the GitHub seam are live — declare a gate and run an evaluation.",
    },
    { status: 200 },
  );
});