import { corsHeaders, isCors, json } from "../_shared/cors.ts";

/**
 * envsync-hello
 * Health probe for the Envsync module (module_envsync schema only).
 */
Deno.serve(async (req: Request) => {
  if (isCors(req)) return new Response("ok", { headers: corsHeaders });

  return json(
    {
      status: "coming_soon",
      service: "envsync",
      schema: "module_envsync",
      tables: ["environment_vars"],
      message: "Env-var schema + RLS scaffolded; sync engine ships on activation.",
    },
    { status: 501 },
  );
});