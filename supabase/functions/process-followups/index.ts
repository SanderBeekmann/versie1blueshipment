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

const SCHEDULE_HORIZON_DAYS = 7;

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

function alreadyQueued(queueEntries: { intake_id: string; type: string; status: string }[], intakeId: string, type: string) {
  return queueEntries.some(q => q.intake_id === intakeId && q.type === type && q.status !== "cancelled");
}

function buildFollowupLeadHtml(intake: { naam?: string; email?: string }, intro: string): string {
  return `
    <div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
      <h2 style="color:#0f172a;">Hoi ${intake.naam || ""},</h2>
      <p style="color:#475569;line-height:1.6;">${intro}</p>
      <p style="color:#475569;line-height:1.6;">Heb je nog vragen of wil je een gesprek inplannen? We staan voor je klaar.</p>
      <a href="https://wa.me/31617818246" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px;">Stuur een WhatsApp bericht</a>
      <p style="color:#94a3b8;font-size:12px;margin-top:32px;">BlueShipment · blueshipment.nl</p>
    </div>`;
}

function buildFollowupInternHtml(intake: { naam?: string; email?: string; bedrijf?: string; id: string }, hours: number): string {
  const adminUrl = `${ADMIN_BASE_URL}/admin/intakes/${intake.id}`;
  return `
    <div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
      <h2 style="color:#0f172a;">Interne herinnering</h2>
      <p style="color:#475569;">Intake van <strong>${intake.naam || intake.email}</strong>${intake.bedrijf ? ` (${intake.bedrijf})` : ""} staat al meer dan ${hours} uur op status <strong>Nieuw</strong> zonder opvolging.</p>
      <a href="${adminUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px;">Bekijk intake in admin</a>
    </div>`;
}

function buildOfferteFollowupHtml(intake: { naam?: string }): string {
  return `
    <div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
      <h2 style="color:#0f172a;">Hoi ${intake.naam || ""},</h2>
      <p style="color:#475569;line-height:1.6;">We hebben je een tijdje geleden een offerte gestuurd en wilden even checken of je nog vragen hebt of of we ergens bij kunnen helpen.</p>
      <p style="color:#475569;line-height:1.6;">Laat het ons weten, we denken graag met je mee!</p>
      <a href="https://wa.me/31617818246" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px;">Stuur een WhatsApp bericht</a>
      <p style="color:#94a3b8;font-size:12px;margin-top:32px;">BlueShipment · blueshipment.nl</p>
    </div>`;
}

async function scheduleFollowups(now: Date): Promise<number> {
  const { data: timingRows } = await supabase
    .from("email_timing_settings")
    .select("key, hours, enabled");

  const timing: Record<string, { hours: number; enabled: boolean }> = {};
  (timingRows || []).forEach((r: { key: string; hours: number; enabled: boolean }) => {
    timing[r.key] = { hours: r.hours, enabled: r.enabled };
  });

  const hoursLeadNieuw = timing["followup_lead_nieuw"]?.hours ?? 48;
  const enabledLeadNieuw = timing["followup_lead_nieuw"]?.enabled ?? true;
  const hoursInternNieuw = timing["followup_intern_nieuw"]?.hours ?? 72;
  const enabledInternNieuw = timing["followup_intern_nieuw"]?.enabled ?? true;
  const hoursLeadOfferte = timing["followup_lead_offerte"]?.hours ?? 120;
  const enabledLeadOfferte = timing["followup_lead_offerte"]?.enabled ?? true;

  const horizonMs = SCHEDULE_HORIZON_DAYS * 24 * 60 * 60 * 1000;
  const horizon = new Date(now.getTime() + horizonMs);

  const createdAfterLeadNieuw = new Date(horizon.getTime() - hoursLeadNieuw * 60 * 60 * 1000);
  const createdAfterInternNieuw = new Date(horizon.getTime() - hoursInternNieuw * 60 * 60 * 1000);
  const createdAfterLeadOfferte = new Date(horizon.getTime() - hoursLeadOfferte * 60 * 60 * 1000);

  const { data: intakes } = await supabase
    .from("intakes")
    .select("id, naam, email, status, created_at, bedrijf")
    .in("status", ["nieuw", "in_behandeling", "offerte"]);

  if (!intakes || intakes.length === 0) return 0;

  const intakeIds = intakes.map((i: { id: string }) => i.id);

  const { data: logs } = await supabase
    .from("email_logs")
    .select("intake_id, type")
    .in("intake_id", intakeIds)
    .in("type", ["followup_lead", "followup_intern", "herinnering"]);

  const { data: existingQueue } = await supabase
    .from("email_queue")
    .select("intake_id, type, status")
    .in("intake_id", intakeIds);

  const { data: templates } = await supabase
    .from("email_templates")
    .select("type, subject, intro, enabled")
    .in("type", ["followup_lead", "followup_intern"]);

  const tmpl: Record<string, { subject: string; intro: string; enabled: boolean }> = {};
  (templates || []).forEach((t: { type: string; subject: string; intro: string; enabled: boolean }) => {
    tmpl[t.type] = t;
  });

  const logsByIntake: Record<string, { type: string }[]> = {};
  (logs || []).forEach((l: { intake_id: string; type: string }) => {
    if (!logsByIntake[l.intake_id]) logsByIntake[l.intake_id] = [];
    logsByIntake[l.intake_id].push(l);
  });

  const queueEntries = (existingQueue || []) as { intake_id: string; type: string; status: string }[];

  let queued = 0;

  for (const intake of intakes as { id: string; naam: string; email: string; status: string; created_at: string; bedrijf: string }[]) {
    const created = new Date(intake.created_at);
    const intakeLogs = logsByIntake[intake.id] || [];

    if (
      enabledLeadNieuw &&
      intake.status === "nieuw" &&
      created >= createdAfterLeadNieuw &&
      !alreadySent(intakeLogs, "followup_lead") &&
      !alreadyQueued(queueEntries, intake.id, "followup_lead")
    ) {
      const template = tmpl.followup_lead;
      if (template?.enabled === false) continue;

      const scheduledAt = new Date(created.getTime() + hoursLeadNieuw * 60 * 60 * 1000);
      const subject = template?.subject ?? "Heb je nog vragen? — BlueShipment";
      const intro = template?.intro ?? "Je hebt onlangs een aanvraag ingediend bij BlueShipment.";
      const body_html = buildFollowupLeadHtml(intake, intro);

      await supabase.from("email_queue").insert({
        intake_id: intake.id,
        type: "followup_lead",
        recipient: intake.email,
        subject,
        body_html,
        scheduled_at: scheduledAt.toISOString(),
        status: "pending",
      });
      queued++;
    }

    if (
      enabledInternNieuw &&
      intake.status === "nieuw" &&
      created >= createdAfterInternNieuw &&
      !alreadySent(intakeLogs, "followup_intern") &&
      !alreadyQueued(queueEntries, intake.id, "followup_intern")
    ) {
      const template = tmpl.followup_intern;
      if (template?.enabled === false) continue;

      const scheduledAt = new Date(created.getTime() + hoursInternNieuw * 60 * 60 * 1000);
      const subject = `Interne herinnering: intake ${intake.naam || intake.email} staat al ${hoursInternNieuw}u op nieuw`;
      const body_html = buildFollowupInternHtml(intake, hoursInternNieuw);

      await supabase.from("email_queue").insert({
        intake_id: intake.id,
        type: "followup_intern",
        recipient: INTERN_EMAIL,
        subject,
        body_html,
        scheduled_at: scheduledAt.toISOString(),
        status: "pending",
      });
      queued++;
    }

    if (
      enabledLeadOfferte &&
      intake.status === "offerte" &&
      created >= createdAfterLeadOfferte &&
      !alreadySent(intakeLogs, "followup_lead") &&
      !alreadyQueued(queueEntries, intake.id, "followup_lead")
    ) {
      const template = tmpl.followup_lead;
      if (template?.enabled === false) continue;

      const scheduledAt = new Date(created.getTime() + hoursLeadOfferte * 60 * 60 * 1000);
      const subject = "Kort bericht over onze offerte — BlueShipment";
      const body_html = buildOfferteFollowupHtml(intake);

      await supabase.from("email_queue").insert({
        intake_id: intake.id,
        type: "followup_lead",
        recipient: intake.email,
        subject,
        body_html,
        scheduled_at: scheduledAt.toISOString(),
        status: "pending",
      });
      queued++;
    }
  }

  return queued;
}

async function sendDueEmails(now: Date): Promise<number> {
  const { data: pendingEmails } = await supabase
    .from("email_queue")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_at", now.toISOString());

  let sent = 0;

  for (const qItem of (pendingEmails || []) as { id: string; intake_id: string; type: string; recipient: string; subject: string; body_html: string }[]) {
    const r = await sendEmail(qItem.recipient, qItem.subject, qItem.body_html);
    if (r.error) {
      await supabase.from("email_queue").update({ status: "failed" }).eq("id", qItem.id);
      await logEmail(qItem.intake_id, qItem.type, qItem.recipient, qItem.subject, "failed", r.error, "");
    } else {
      await supabase.from("email_queue").update({ status: "sent", sent_at: now.toISOString() }).eq("id", qItem.id);
      await logEmail(qItem.intake_id, qItem.type, qItem.recipient, qItem.subject, "sent", "", r.id || "");
      sent++;
    }
  }

  return sent;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const now = new Date();

    let url: URL;
    try {
      url = new URL(req.url);
    } catch {
      url = new URL("https://placeholder/");
    }
    const mode = url.searchParams.get("mode") ?? "both";

    let queued = 0;
    let sent = 0;

    if (mode === "schedule" || mode === "both") {
      queued = await scheduleFollowups(now);
    }

    if (mode === "send" || mode === "both") {
      sent = await sendDueEmails(now);
    }

    return new Response(JSON.stringify({ success: true, queued, sent, mode }), {
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
