// Supabase Edge Functions resolve this remote ESM import at runtime.
// @ts-expect-error Remote Deno module is not resolved by the local TypeScript server.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { corsHeaders, isCors, json } from "../_shared/cors.ts";

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

/*
 * onboardtime-bootstrap
 *
 * Provisions (idempotently) the caller's personal org + owner membership.
 *
 * WHY service role instead of an RPC:
 * The original design called a `security definer` RPC (ensure_personal_org).
 * On some hosted projects PostgREST's function catalog gets stuck and won't
 * see a newly-created function ("...function ... not in the schema cache"),
 * which is outside the repo's control to fix from code.
 *
 * Instead this function provisions the org with plain table inserts using
 * the SERVICE ROLE key (server-side secret only, never shipped to the
 * browser). Service role bypasses RLS and doesn't depend on the function
 * catalog, so this path always works once the env secret is set.
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY");
const SERVICE_ROLE = Deno.env.get("SERVICE_ROLE_KEY");

function serviceClient() {
  if (!SUPABASE_URL || !SERVICE_ROLE) return null;
  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

Deno.serve(async (req) => {
  if (isCors(req)) return new Response("ok", { headers: corsHeaders });

  if (!SUPABASE_URL || !SUPABASE_ANON) {
    return json({ error: "Supabase env vars not configured" }, { status: 500 });
  }

  const auth = req.headers.get("Authorization");
  if (!auth) {
    return json({ error: "missing authorization header" }, { status: 401 });
  }

  // Validate the caller's JWT so we know who we're provisioning for.
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes.user) {
      return json({ error: userErr?.message ?? "unauthenticated" }, { status: 401 });
    }
    const userId = userRes.user.id;

    const admin = serviceClient();
    if (!admin) {
      return json(
        { error: "SERVICE_ROLE_KEY not configured on this function" },
        { status: 500 },
      );
    }

    const slug = `personal-${userId}`;

    // Find existing personal org, else create it (idempotent via unique slug).
    const { data: existing } = await admin
      .from("orgs")
      .select("id, name")
      .eq("slug", slug)
      .maybeSingle();

    let orgId: string | undefined = existing?.id;

    if (!orgId) {
      const { data: createdOrg, error: createOrgErr } = await admin
        .from("orgs")
        .insert({ name: "Personal workspace", slug, created_by: userId })
        .select("id")
        .single();
      if (createOrgErr || !createdOrg) {
        return json({ error: createOrgErr?.message ?? "failed to create org" }, { status: 500 });
      }
      orgId = createdOrg.id;
    }

    // Ensure an owner membership exists (idempotent via unique org_id+user_id).
    const { error: memberErr } = await admin.from("org_members").upsert(
      { org_id: orgId, user_id: userId, role: "owner" },
      { onConflict: "org_id,user_id", ignoreDuplicates: true },
    );
    if (memberErr) {
      return json({ error: memberErr.message }, { status: 500 });
    }

    return json({
      orgId,
      orgName: existing?.name ?? "Personal workspace",
      user: { id: userId, email: userRes.user.email ?? "" },
    });
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
});