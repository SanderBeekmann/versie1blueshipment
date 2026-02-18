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
    console.warn("RESEND_API_KEY not set — skipping");
    return { id: "skipped" };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });
  const data = await res.json();
  return res.ok ? { id: data.id } : { error: data.message };
}

async function logEmail(intakeId: string, type: string, recipient: string, subject: string, status: string, errorMsg: string, resendId: string) {
  await supabase.from("email_logs").insert({ intake_id: intakeId, type, recipient, subject, status, error_message: errorMsg, resend_id: resendId });
}

function alreadySent(logs: { type: string }[], type: string) {
  return logs.some(l => l.type === type);
}

async function processFollowups() {
  const now = new Date();
  const h48 = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const h72 = new Date(now.getTime() - 72 * 60 * 60 * 1000);
  const d5 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  const { data: intakes } = await supabase
    .from("intakes")
    .select("id, naam, email, status, created_at, bedrijf")
    .in("status", ["nieuw", "in_behandeling", "offerte"]);

  if (!intakes || intakes.length === 0) return { processed: 0 };

  const intakeIds = intakes.map((i: { id: string }) => i.id);
  const { data: logs } = await supabase
    .from("email_logs")
    .select("intake_id, type")
    .in("intake_id", intakeIds)
    .in("type", ["followup_lead", "followup_intern", "herinnering"]);

  const logsByIntake: Record<string, { type: string }[]> = {};
  (logs || []).forEach((l: { intake_id: string; type: string }) => {
    if (!logsByIntake[l.intake_id]) logsByIntake[l.intake_id] = [];
    logsByIntake[l.intake_id].push(l);
  });

  const { data: templates } = await supabase
    .from("email_templates")
    .select("type, subject, intro")
    .in("type", ["followup_lead", "followup_intern"]);

  const tmpl: Record<string, { subject: string; intro: string }> = {};
  (templates || []).forEach((t: { type: string; subject: string; intro: string }) => { tmpl[t.type] = t; });

  let processed = 0;

  for (const intake of intakes as { id: string; naam: string; email: string; status: string; created_at: string; bedrijf: string }[]) {
    const created = new Date(intake.created_at);
    const intakeLogs = logsByIntake[intake.id] || [];
    const adminUrl = `${ADMIN_BASE_URL}/admin/intakes/${intake.id}`;

    if (intake.status === "nieuw" && created <= h48 && !alreadySent(intakeLogs, "followup_lead")) {
      const subject = tmpl.followup_lead?.subject ?? "Heb je nog vragen? — BlueShipment";
      const intro = tmpl.followup_lead?.intro ?? "Je hebt onlangs een aanvraag ingediend bij BlueShipment.";
      const html = `
        <div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
          <h2 style="color:#0f172a;">Hoi ${intake.naam || ""},</h2>
          <p style="color:#475569;line-height:1.6;">${intro}</p>
          <p style="color:#475569;line-height:1.6;">Heb je nog vragen of wil je een gesprek inplannen? We staan voor je klaar.</p>
          <a href="https://wa.me/31000000000" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px;">Stuur een WhatsApp bericht</a>
          <p style="color:#94a3b8;font-size:12px;margin-top:32px;">BlueShipment · blueshipment.nl</p>
        </div>`;
      const r = await sendEmail(intake.email, subject, html);
      await logEmail(intake.id, "followup_lead", intake.email, subject, r.error ? "failed" : "sent", r.error || "", r.id || "");
      processed++;
    }

    if (intake.status === "nieuw" && created <= h72 && !alreadySent(intakeLogs, "followup_intern")) {
      const subject = `Interne herinnering: intake ${intake.naam || intake.email} staat al 72u op nieuw`;
      const html = `
        <div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
          <h2 style="color:#0f172a;">Interne herinnering</h2>
          <p style="color:#475569;">Intake van <strong>${intake.naam || intake.email}</strong>${intake.bedrijf ? ` (${intake.bedrijf})` : ""} staat al meer dan 72 uur op status <strong>Nieuw</strong> zonder opvolging.</p>
          <a href="${adminUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px;">Bekijk intake in admin</a>
        </div>`;
      const r = await sendEmail(INTERN_EMAIL, subject, html);
      await logEmail(intake.id, "followup_intern", INTERN_EMAIL, subject, r.error ? "failed" : "sent", r.error || "", r.id || "");
      processed++;
    }

    if (intake.status === "offerte" && created <= d5 && !alreadySent(intakeLogs, "followup_lead")) {
      const subject = "Kort bericht over onze offerte — BlueShipment";
      const html = `
        <div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
          <h2 style="color:#0f172a;">Hoi ${intake.naam || ""},</h2>
          <p style="color:#475569;line-height:1.6;">We hebben je een tijdje geleden een offerte gestuurd en wilden even checken of je nog vragen hebt of of we ergens bij kunnen helpen.</p>
          <p style="color:#475569;line-height:1.6;">Laat het ons weten, we denken graag met je mee!</p>
          <a href="https://wa.me/31000000000" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px;">Stuur een WhatsApp bericht</a>
          <p style="color:#94a3b8;font-size:12px;margin-top:32px;">BlueShipment · blueshipment.nl</p>
        </div>`;
      const r = await sendEmail(intake.email, subject, html);
      await logEmail(intake.id, "followup_lead", intake.email, subject, r.error ? "failed" : "sent", r.error || "", r.id || "");
      processed++;
    }
  }

  return { processed };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const result = await processFollowups();
    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("process-followups error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
