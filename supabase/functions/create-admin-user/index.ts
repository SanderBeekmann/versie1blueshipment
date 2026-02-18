import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users?.find((u: any) => u.email === "admin@blueshipment.nl");

    let userId: string;

    if (existingUser) {
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: "Admin2024!",
        email_confirm: true,
      });
      userId = existingUser.id;
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: "admin@blueshipment.nl",
        password: "Admin2024!",
        email_confirm: true,
      });

      if (createError || !newUser.user) {
        return new Response(JSON.stringify({ error: createError?.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = newUser.user.id;
    }

    const { error: upsertError } = await supabaseAdmin
      .from("admin_users")
      .upsert({ id: userId, naam: "Test Admin", email: "admin@blueshipment.nl", rol: "admin", actief: true });

    return new Response(
      JSON.stringify({ success: true, userId, message: "Admin user ready" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
