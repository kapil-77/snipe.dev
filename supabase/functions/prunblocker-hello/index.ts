import { corsHeaders, isCors, json } from "../_shared/cors.ts";

/**
 * prunblocker-hello
 * Health probe for the PR Unblocker module (module_prunblocker schema only).
 */
Deno.serve(async (req: Request) => {
  if (isCors(req)) return new Response("ok", { headers: corsHeaders });

  return json(
    {
      status: "coming_soon",
      service: "prunblocker",
      schema: "module_prunblocker",
      tables: ["merge_gates"],
      message: "Merge-gate schema + RLS scaffolded; enforcement ships on activation.",
    },
    { status: 501 },
  );
});