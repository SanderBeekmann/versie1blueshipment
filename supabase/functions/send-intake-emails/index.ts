import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const INTERN_EMAIL = Deno.env.get("INTERN_EMAIL") ?? "info@blueshipment.nl";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "noreply@blueshipment.nl";
const ADMIN_BASE_URL = Deno.env.get("ADMIN_BASE_URL") ?? "https://blueshipment.nl";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

async function sendEmail(to: string, subject: string, html: string): Promise<{ id?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email send");
    return { id: "skipped" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return { error: data.message || "Resend error" };
  }
  return { id: data.id };
}

function buildKlantEmail(intake: Record<string, unknown>, template: { subject: string; intro: string }): { subject: string; html: string } {
  const diensten = Array.isArray(intake.diensten) ? (intake.diensten as string[]).join(", ") : "";

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${template.subject}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
      <tr>
        <td style="background:#0f172a;padding:28px 40px;">
          <span style="font-size:18px;font-weight:700;color:#f8fafc;letter-spacing:-0.3px;">BlueShipment</span>
        </td>
      </tr>
      <tr>
        <td style="padding:36px 40px 28px;">
          <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 8px;letter-spacing:-0.4px;">Bedankt, ${intake.naam}!</h1>
          <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 28px;">${template.intro}</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;padding:20px;margin-bottom:28px;">
            <tr><td style="padding-bottom:14px;">
              <p style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">Jouw aanvraag samenvatting</p>
            </td></tr>
            <tr><td style="padding-bottom:10px;">
              <p style="font-size:12px;font-weight:500;color:#64748b;margin:0 0 2px;">Verkoopkanaal</p>
              <p style="font-size:14px;color:#0f172a;margin:0;">${intake.verkoopkanaal || "—"}</p>
            </td></tr>
            <tr><td style="border-top:1px solid #e2e8f0;padding:10px 0;">
              <p style="font-size:12px;font-weight:500;color:#64748b;margin:0 0 2px;">Gewenste diensten</p>
              <p style="font-size:14px;color:#0f172a;margin:0;">${diensten || "—"}</p>
            </td></tr>
            <tr><td style="border-top:1px solid #e2e8f0;padding:10px 0;">
              <p style="font-size:12px;font-weight:500;color:#64748b;margin:0 0 2px;">Shipments per maand</p>
              <p style="font-size:14px;color:#0f172a;margin:0;">${intake.shipment_volume ?? "—"}</p>
            </td></tr>
            ${intake.grootste_uitdaging ? `
            <tr><td style="border-top:1px solid #e2e8f0;padding:10px 0 0;">
              <p style="font-size:12px;font-weight:500;color:#64748b;margin:0 0 2px;">Grootste uitdaging</p>
              <p style="font-size:14px;color:#0f172a;margin:0;">${intake.grootste_uitdaging}</p>
            </td></tr>` : ""}
          </table>

          <p style="font-size:14px;color:#475569;line-height:1.6;margin:0 0 28px;">We nemen zo snel mogelijk contact met je op. Heb je in de tussentijd vragen? Stuur ons een berichtje via WhatsApp.</p>

          <a href="https://wa.me/31617818246" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">Stuur een WhatsApp bericht</a>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 40px;border-top:1px solid #f1f5f9;">
          <p style="font-size:12px;color:#94a3b8;margin:0;">BlueShipment &bull; blueshipment.nl</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  return { subject: template.subject, html };
}

function buildInternEmail(intake: Record<string, unknown>, template: { subject: string; intro: string }): { subject: string; html: string } {
  const diensten = Array.isArray(intake.diensten) ? (intake.diensten as string[]).join(", ") : "";
  const adminUrl = `${ADMIN_BASE_URL}/admin/intakes/${intake.id}`;

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${template.subject}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
      <tr>
        <td style="background:#0f172a;padding:28px 40px;display:flex;align-items:center;gap:8px;">
          <span style="font-size:18px;font-weight:700;color:#f8fafc;">BlueShipment</span>
          <span style="font-size:11px;font-weight:600;color:#93c5fd;background:rgba(147,197,253,0.12);border:1px solid rgba(147,197,253,0.2);border-radius:4px;padding:2px 6px;text-transform:uppercase;letter-spacing:0.5px;margin-left:8px;">Nieuw Lead</span>
        </td>
      </tr>
      <tr>
        <td style="padding:36px 40px 28px;">
          <h1 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 6px;letter-spacing:-0.4px;">Nieuwe intake aanvraag</h1>
          <p style="font-size:14px;color:#475569;margin:0 0 24px;">${template.intro}</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr style="background:#f8fafc;">
              <td style="padding:12px 16px;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;width:40%;">Veld</td>
              <td style="padding:12px 16px;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Waarde</td>
            </tr>
            <tr style="border-top:1px solid #e2e8f0;">
              <td style="padding:10px 16px;font-size:13px;color:#64748b;">Naam</td>
              <td style="padding:10px 16px;font-size:13px;color:#0f172a;font-weight:500;">${intake.naam || "—"}</td>
            </tr>
            <tr style="border-top:1px solid #e2e8f0;background:#f8fafc;">
              <td style="padding:10px 16px;font-size:13px;color:#64748b;">E-mail</td>
              <td style="padding:10px 16px;font-size:13px;color:#2563eb;">${intake.email || "—"}</td>
            </tr>
            <tr style="border-top:1px solid #e2e8f0;">
              <td style="padding:10px 16px;font-size:13px;color:#64748b;">Telefoon</td>
              <td style="padding:10px 16px;font-size:13px;color:#0f172a;">${intake.telefoon || "—"}</td>
            </tr>
            <tr style="border-top:1px solid #e2e8f0;background:#f8fafc;">
              <td style="padding:10px 16px;font-size:13px;color:#64748b;">Bedrijf</td>
              <td style="padding:10px 16px;font-size:13px;color:#0f172a;">${intake.bedrijf || "—"}</td>
            </tr>
            <tr style="border-top:1px solid #e2e8f0;">
              <td style="padding:10px 16px;font-size:13px;color:#64748b;">Website</td>
              <td style="padding:10px 16px;font-size:13px;color:#2563eb;">${intake.website || "—"}</td>
            </tr>
            <tr style="border-top:1px solid #e2e8f0;background:#f8fafc;">
              <td style="padding:10px 16px;font-size:13px;color:#64748b;">Verkoopkanaal</td>
              <td style="padding:10px 16px;font-size:13px;color:#0f172a;">${intake.verkoopkanaal || "—"}</td>
            </tr>
            <tr style="border-top:1px solid #e2e8f0;">
              <td style="padding:10px 16px;font-size:13px;color:#64748b;">Diensten</td>
              <td style="padding:10px 16px;font-size:13px;color:#0f172a;">${diensten || "—"}</td>
            </tr>
            <tr style="border-top:1px solid #e2e8f0;background:#f8fafc;">
              <td style="padding:10px 16px;font-size:13px;color:#64748b;">Shipments/maand</td>
              <td style="padding:10px 16px;font-size:13px;color:#0f172a;font-weight:600;">${intake.shipment_volume ?? "—"}</td>
            </tr>
            ${intake.grootste_uitdaging ? `
            <tr style="border-top:1px solid #e2e8f0;">
              <td style="padding:10px 16px;font-size:13px;color:#64748b;">Uitdaging</td>
              <td style="padding:10px 16px;font-size:13px;color:#0f172a;">${intake.grootste_uitdaging}</td>
            </tr>` : ""}
            <tr style="border-top:1px solid #e2e8f0;background:#f8fafc;">
              <td style="padding:10px 16px;font-size:13px;color:#64748b;">Consent</td>
              <td style="padding:10px 16px;font-size:13px;color:#0f172a;">${intake.consent ? "Ja" : "Nee"}</td>
            </tr>
            <tr style="border-top:1px solid #e2e8f0;">
              <td style="padding:10px 16px;font-size:13px;color:#64748b;">Intake ID</td>
              <td style="padding:10px 16px;font-size:11px;color:#94a3b8;font-family:monospace;">${intake.id}</td>
            </tr>
          </table>

          <a href="${adminUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">Bekijk in admin dashboard</a>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 40px;border-top:1px solid #f1f5f9;">
          <p style="font-size:12px;color:#94a3b8;margin:0;">BlueShipment Admin &bull; Automatisch verstuurd</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  return { subject: `${template.subject} — ${intake.naam || intake.email}`, html };
}

async function logEmail(intakeId: string, type: string, recipient: string, subject: string, status: string, errorMsg: string, resendId: string) {
  await supabase.from("email_logs").insert({
    intake_id: intakeId,
    type,
    recipient,
    subject,
    status,
    error_message: errorMsg,
    resend_id: resendId,
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { intakeId } = await req.json();

    if (!intakeId) {
      return new Response(JSON.stringify({ error: "intakeId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: intake, error: fetchError } = await supabase
      .from("intakes")
      .select("*")
      .eq("id", intakeId)
      .maybeSingle();

    if (fetchError || !intake) {
      return new Response(JSON.stringify({ error: "Intake not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: templates } = await supabase
      .from("email_templates")
      .select("type, subject, intro")
      .in("type", ["klant_bevestiging", "intern_signaal"]);

    const templateMap: Record<string, { subject: string; intro: string }> = {};
    (templates || []).forEach((t: { type: string; subject: string; intro: string }) => {
      templateMap[t.type] = { subject: t.subject, intro: t.intro };
    });

    const klantTemplate = templateMap["klant_bevestiging"] ?? {
      subject: "Bedankt voor je aanvraag bij BlueShipment",
      intro: "Bedankt voor het invullen van onze intake. We hebben je gegevens ontvangen en nemen binnenkort contact met je op.",
    };

    const internTemplate = templateMap["intern_signaal"] ?? {
      subject: "Nieuwe intake aanvraag",
      intro: "Er is een nieuwe intake binnengekomen via de website.",
    };

    const klantMail = buildKlantEmail(intake, klantTemplate);
    const klantResult = await sendEmail(intake.email, klantMail.subject, klantMail.html);
    await logEmail(
      intakeId,
      "klant_bevestiging",
      intake.email,
      klantMail.subject,
      klantResult.error ? "failed" : "sent",
      klantResult.error || "",
      klantResult.id || ""
    );

    const internMail = buildInternEmail(intake, internTemplate);
    const internResult = await sendEmail(INTERN_EMAIL, internMail.subject, internMail.html);
    await logEmail(
      intakeId,
      "intern_signaal",
      INTERN_EMAIL,
      internMail.subject,
      internResult.error ? "failed" : "sent",
      internResult.error || "",
      internResult.id || ""
    );

    return new Response(
      JSON.stringify({
        success: true,
        klant: klantResult.error ? "failed" : "sent",
        intern: internResult.error ? "failed" : "sent",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-intake-emails error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
