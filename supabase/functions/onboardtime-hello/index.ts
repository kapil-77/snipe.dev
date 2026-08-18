import { corsHeaders, isCors, json } from "../_shared/cors.ts";

/**
 * onboardtime-hello
 * Health/status probe for the Onboardtime module.
 * Touches nothing but its own schema (module_onboardtime) once live.
 */
Deno.serve(async (req: Request) => {
  if (isCors(req)) return new Response("ok", { headers: corsHeaders });

  return json(
    {
      status: "coming_soon",
      service: "onboardtime",
      schema: "module_onboardtime",
      tables: ["checklists", "checklist_items"],
      message: "Schema + RLS scaffolded and live; business logic ships on activation.",
    },
    { status: 501 },
  );
});