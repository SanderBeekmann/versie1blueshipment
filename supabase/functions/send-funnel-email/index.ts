import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface FunnelData {
  email: string;
  firstName?: string;
  answers: {
    name?: string;
    company?: string;
    phone?: string;
    website?: string;
    verkoopkanaal?: string;
    diensten?: string[];
    shipmentVolume?: string;
    grootsteUitdaging?: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ ok: false, error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body: FunnelData = await req.json();

    if (!body.email || !body.email.trim()) {
      return new Response(
        JSON.stringify({ ok: false, error: "Email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!body.answers || typeof body.answers !== "object") {
      return new Response(
        JSON.stringify({ ok: false, error: "Answers object is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const userEmail = body.email.trim();
    const answers = body.answers;

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const { data: lead, error: dbError } = await supabase
      .from("leads")
      .insert({
        email: userEmail,
        name: answers.name || null,
        company: answers.company || null,
        phone: answers.phone || null,
        website: answers.website || null,
        verkoopkanaal: answers.verkoopkanaal || null,
        diensten: answers.diensten || [],
        shipment_volume: answers.shipmentVolume || null,
        grootste_uitdaging: answers.grootsteUitdaging || null,
        status: "new",
        source: "website",
        email_sent: false,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ ok: false, error: "Database error", details: dbError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Lead saved successfully:", lead);

    return new Response(
      JSON.stringify({
        ok: true,
        leadId: lead?.id,
        message: "Lead opgeslagen in database (test mode - geen emails verzonden)"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
