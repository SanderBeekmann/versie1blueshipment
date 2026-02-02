import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend@4";

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

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("FROM_EMAIL");
    const salesToEmail = Deno.env.get("SALES_TO_EMAIL") || "blueshipsales@gmail.com";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!resendApiKey || !fromEmail) {
      return new Response(
        JSON.stringify({ ok: false, error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userEmail = body.email.trim();
    const firstName = body.firstName || body.answers.name || "Er";
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
    }

    const userConfirmationHTML = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bevestiging aanvraag</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">BlueShipment</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Bedankt voor je aanvraag!</h2>
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">Hallo ${firstName},</p>
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Bedankt voor het invullen van de intake en het contact opnemen met ons. We hebben je gegevens ontvangen en willen je graag een overzicht geven van wat je hebt ingevuld:
              </p>
              <div style="background-color: #f9fafb; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 4px;">
                ${answers.verkoopkanaal ? `<p style="margin: 0 0 12px; color: #1f2937; font-size: 15px; line-height: 1.6;"><strong>Verkoopkanaal:</strong> ${answers.verkoopkanaal}</p>` : ''}
                ${answers.diensten && Array.isArray(answers.diensten) && answers.diensten.length > 0 ? `<p style="margin: 0 0 12px; color: #1f2937; font-size: 15px; line-height: 1.6;"><strong>Diensten waar je hulp bij wilt:</strong> ${answers.diensten.join(', ')}</p>` : ''}
                ${answers.shipmentVolume ? `<p style="margin: 0 0 12px; color: #1f2937; font-size: 15px; line-height: 1.6;"><strong>Shipment volume per maand:</strong> ${answers.shipmentVolume}</p>` : ''}
                ${answers.company ? `<p style="margin: 0 0 12px; color: #1f2937; font-size: 15px; line-height: 1.6;"><strong>Bedrijf:</strong> ${answers.company}</p>` : ''}
                ${answers.grootsteUitdaging ? `<p style="margin: 0; color: #1f2937; font-size: 15px; line-height: 1.6;"><strong>Grootste uitdaging:</strong> ${answers.grootsteUitdaging}</p>` : ''}
              </div>
              <p style="margin: 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">We kijken er naar uit om je beter te leren kennen.</p>
              <p style="margin: 30px 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Met vriendelijke groet,<br><strong>Team BlueShipment</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; text-align: center;">
                <strong>BlueShipment</strong><br>Nederland
              </p>
              <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                Deze email is automatisch verzonden. Je hoeft hier niet op te reageren.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

    const salesLeadHTML = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nieuwe funnel aanvraag</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 30px 40px; background-color: #2563eb; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">🎯 Nieuwe Funnel Aanvraag</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 30px; color: #1f2937; font-size: 20px; font-weight: 600;">Contactgegevens</h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><strong style="color: #374151; font-size: 14px;">Naam:</strong></td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;"><span style="color: #1f2937; font-size: 14px;">${answers.name || firstName || 'Niet ingevuld'}</span></td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><strong style="color: #374151; font-size: 14px;">Email:</strong></td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;"><a href="mailto:${userEmail}" style="color: #2563eb; font-size: 14px; text-decoration: none;">${userEmail}</a></td>
                </tr>
                ${answers.phone ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><strong style="color: #374151; font-size: 14px;">Telefoon:</strong></td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;"><a href="tel:${answers.phone}" style="color: #1f2937; font-size: 14px; text-decoration: none;">${answers.phone}</a></td></tr>` : ''}
                ${answers.company ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><strong style="color: #374151; font-size: 14px;">Bedrijf:</strong></td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;"><span style="color: #1f2937; font-size: 14px;">${answers.company}</span></td></tr>` : ''}
                ${answers.website ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><strong style="color: #374151; font-size: 14px;">Website:</strong></td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;"><a href="${answers.website}" target="_blank" style="color: #2563eb; font-size: 14px; text-decoration: none;">${answers.website}</a></td></tr>` : ''}
              </table>
              <h2 style="margin: 30px 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">Funnel Antwoorden</h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                ${answers.verkoopkanaal ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><strong style="color: #374151; font-size: 14px;">Verkoopkanaal:</strong></td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;"><span style="color: #1f2937; font-size: 14px;">${answers.verkoopkanaal}</span></td></tr>` : ''}
                ${answers.diensten && Array.isArray(answers.diensten) && answers.diensten.length > 0 ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><strong style="color: #374151; font-size: 14px;">Diensten:</strong></td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;"><span style="color: #1f2937; font-size: 14px;">${answers.diensten.join(', ')}</span></td></tr>` : ''}
                ${answers.shipmentVolume ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><strong style="color: #374151; font-size: 14px;">Shipment Volume:</strong></td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;"><span style="color: #1f2937; font-size: 14px;">${answers.shipmentVolume}</span></td></tr>` : ''}
                ${answers.grootsteUitdaging ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; vertical-align: top;"><strong style="color: #374151; font-size: 14px;">Grootste Uitdaging:</strong></td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;"><span style="color: #1f2937; font-size: 14px; white-space: pre-wrap;">${answers.grootsteUitdaging}</span></td></tr>` : ''}
              </table>
              <h2 style="margin: 30px 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">Raw Data (JSON)</h2>
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
                <pre style="margin: 0; color: #374151; font-size: 12px; font-family: 'Monaco', 'Courier New', monospace; white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(answers, null, 2)}</pre>
              </div>
              <p style="margin: 20px 0 0; color: #6b7280; font-size: 12px; line-height: 1.6;">
                Verzonden op: ${new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}<br>
                Lead ID: ${lead?.id || 'N/A'}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">BlueShipment Funnel System</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

    const resend = new Resend(resendApiKey);

    const [userEmailResult, salesEmailResult] = await Promise.allSettled([
      resend.emails.send({
        from: fromEmail,
        to: userEmail,
        subject: "Bevestiging: we hebben je aanvraag ontvangen",
        html: userConfirmationHTML,
      }),
      resend.emails.send({
        from: fromEmail,
        to: salesToEmail,
        replyTo: userEmail,
        subject: `Nieuwe funnel aanvraag: ${answers.name || firstName || userEmail}`,
        html: salesLeadHTML,
      }),
    ]);

    if (userEmailResult.status === "rejected") {
      console.error("Failed to send user email:", userEmailResult.reason);
    }

    if (salesEmailResult.status === "rejected") {
      console.error("Failed to send sales email:", salesEmailResult.reason);
    }

    if (lead && (userEmailResult.status === "fulfilled" || salesEmailResult.status === "fulfilled")) {
      await supabase
        .from("leads")
        .update({ email_sent: true })
        .eq("id", lead.id);
    }

    if (userEmailResult.status === "rejected" && salesEmailResult.status === "rejected") {
      return new Response(
        JSON.stringify({ ok: false, error: "Failed to send emails" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, leadId: lead?.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
