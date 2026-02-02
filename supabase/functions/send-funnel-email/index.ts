import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6";

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

/**
 * Create SMTP transporter from environment variables
 */
function createTransporter() {
  const smtpHost = Deno.env.get("SMTP_HOST");
  const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
  const smtpUser = Deno.env.get("SMTP_USER");
  const smtpPass = Deno.env.get("SMTP_PASS");
  const smtpSecure = Deno.env.get("SMTP_SECURE") === "true";

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error("Missing required SMTP configuration");
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

/**
 * Generate HTML email for lead confirmation
 */
function generateLeadEmail(data: FunnelData): string {
  const name = data.answers.name || "daar";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bedankt voor je aanmelding</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">BlueShipment</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">Bedankt voor je aanmelding!</h2>

              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Hoi ${name},
              </p>

              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Bedankt voor je interesse in BlueShipment! We hebben je gegevens ontvangen en kijken ernaar uit om met je in gesprek te gaan.
              </p>

              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                <strong>Volgende stap:</strong> Plan nu je kennismakingsgesprek met Timo via de Calendly link die zojuist is geopend. Zo kunnen we snel inspelen op jouw wensen en uitdagingen.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="border-radius: 6px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);">
                    <a href="https://calendly.com/mouseclick2017/30min" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
                      Plan kennismakingsgesprek
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Heb je vragen in de tussentijd? Je kunt ons altijd bereiken via info@blueshipment.nl of via WhatsApp.
              </p>

              <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Tot snel!<br>
                <strong>Team BlueShipment</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; text-align: center;">
                BlueShipment - Jouw partner in e-commerce fulfillment
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} BlueShipment. Alle rechten voorbehouden.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate HTML email for internal sales notification
 */
function generateSalesEmail(data: FunnelData): string {
  const answers = data.answers;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nieuwe Lead via Intake Funnel</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">🎯 Nieuwe Lead!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Er is een nieuwe lead binnengekomen via de intake funnel op de website.
              </p>

              <!-- Contact Details -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0;">
                <tr>
                  <td colspan="2" style="padding: 12px 16px; background-color: #f9fafb; border-radius: 6px 6px 0 0;">
                    <h3 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">Contactgegevens</h3>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-left: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; width: 30%; color: #6b7280; font-size: 14px; font-weight: 600;">Naam:</td>
                  <td style="padding: 12px 16px; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px;">${answers.name || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-left: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; width: 30%; color: #6b7280; font-size: 14px; font-weight: 600;">E-mail:</td>
                  <td style="padding: 12px 16px; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px;">
                    <a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none;">${data.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-left: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; width: 30%; color: #6b7280; font-size: 14px; font-weight: 600;">Telefoon:</td>
                  <td style="padding: 12px 16px; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px;">
                    <a href="tel:${answers.phone}" style="color: #2563eb; text-decoration: none;">${answers.phone || '-'}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-left: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; width: 30%; color: #6b7280; font-size: 14px; font-weight: 600;">Bedrijf:</td>
                  <td style="padding: 12px 16px; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px;">${answers.company || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-left: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; border-radius: 0 0 0 6px; width: 30%; color: #6b7280; font-size: 14px; font-weight: 600;">Website:</td>
                  <td style="padding: 12px 16px; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; border-radius: 0 0 6px 0; color: #1f2937; font-size: 14px;">
                    ${answers.website ? `<a href="${answers.website}" target="_blank" style="color: #2563eb; text-decoration: none;">${answers.website}</a>` : '-'}
                  </td>
                </tr>
              </table>

              <!-- Lead Details -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0;">
                <tr>
                  <td colspan="2" style="padding: 12px 16px; background-color: #f9fafb; border-radius: 6px 6px 0 0;">
                    <h3 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">Lead Informatie</h3>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-left: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; width: 30%; color: #6b7280; font-size: 14px; font-weight: 600;">Verkoopkanaal:</td>
                  <td style="padding: 12px 16px; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px;">${answers.verkoopkanaal || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-left: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; width: 30%; color: #6b7280; font-size: 14px; font-weight: 600;">Interesse in:</td>
                  <td style="padding: 12px 16px; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px;">
                    ${answers.diensten && answers.diensten.length > 0 ? answers.diensten.join(', ') : '-'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-left: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; border-radius: 0 0 0 6px; width: 30%; color: #6b7280; font-size: 14px; font-weight: 600;">Shipment Volume:</td>
                  <td style="padding: 12px 16px; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; border-radius: 0 0 6px 0; color: #1f2937; font-size: 14px;">${answers.shipmentVolume || '-'} per maand</td>
                </tr>
              </table>

              <!-- Challenge -->
              ${answers.grootsteUitdaging ? `
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0;">
                <tr>
                  <td style="padding: 12px 16px; background-color: #f9fafb; border-radius: 6px 6px 0 0;">
                    <h3 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">Grootste Uitdaging</h3>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 0 0 6px 6px; color: #1f2937; font-size: 14px; line-height: 1.6; background-color: #fffbeb;">
                    ${answers.grootsteUitdaging}
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
                Lead ontvangen op ${new Date().toLocaleString('nl-NL', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send emails to lead and internal team
 */
async function sendEmails(data: FunnelData, leadId: string) {
  const mailFrom = Deno.env.get("MAIL_FROM");
  const internalEmail = Deno.env.get("INTERNAL_NOTIFY_EMAIL");

  if (!mailFrom || !internalEmail) {
    throw new Error("Missing MAIL_FROM or INTERNAL_NOTIFY_EMAIL configuration");
  }

  const transporter = createTransporter();

  let emailsSent = 0;
  const errors: string[] = [];

  // Send email to lead
  try {
    const leadEmailHtml = generateLeadEmail(data);

    await transporter.sendMail({
      from: mailFrom,
      to: data.email,
      subject: "Bedankt voor je aanmelding bij BlueShipment",
      html: leadEmailHtml,
      text: `Hoi ${data.answers.name || 'daar'},\n\nBedankt voor je interesse in BlueShipment! We hebben je gegevens ontvangen en kijken ernaar uit om met je in gesprek te gaan.\n\nVolgende stap: Plan nu je kennismakingsgesprek met Timo via https://calendly.com/mouseclick2017/30min\n\nTot snel!\nTeam BlueShipment`,
    });

    emailsSent++;
    console.log(`✓ Lead confirmation email sent to ${data.email}`);
  } catch (error) {
    const errorMsg = `Failed to send lead email: ${error.message}`;
    console.error(errorMsg);
    errors.push(errorMsg);
  }

  // Send email to internal team
  try {
    const salesEmailHtml = generateSalesEmail(data);

    await transporter.sendMail({
      from: mailFrom,
      to: internalEmail,
      subject: `🎯 Nieuwe Lead: ${data.answers.name || data.email}`,
      html: salesEmailHtml,
      text: `Nieuwe lead via intake funnel:\n\nNaam: ${data.answers.name || '-'}\nE-mail: ${data.email}\nTelefoon: ${data.answers.phone || '-'}\nBedrijf: ${data.answers.company || '-'}\nWebsite: ${data.answers.website || '-'}\n\nVerkoopkanaal: ${data.answers.verkoopkanaal || '-'}\nInteresse: ${data.answers.diensten?.join(', ') || '-'}\nShipment Volume: ${data.answers.shipmentVolume || '-'}\n\nGrootste Uitdaging:\n${data.answers.grootsteUitdaging || '-'}\n\nLead ID: ${leadId}`,
    });

    emailsSent++;
    console.log(`✓ Sales notification email sent to ${internalEmail}`);
  } catch (error) {
    const errorMsg = `Failed to send sales notification: ${error.message}`;
    console.error(errorMsg);
    errors.push(errorMsg);
  }

  return { emailsSent, errors };
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

    // Save lead to database
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

    // Send emails (non-blocking - don't fail the request if emails fail)
    let emailStatus = {
      sent: 0,
      errors: [] as string[],
    };

    try {
      const result = await sendEmails(body, lead.id);
      emailStatus.sent = result.emailsSent;
      emailStatus.errors = result.errors;

      // Update email_sent flag if at least one email was sent
      if (result.emailsSent > 0) {
        await supabase
          .from("leads")
          .update({ email_sent: true })
          .eq("id", lead.id);

        console.log(`Email sent flag updated for lead ${lead.id}`);
      }
    } catch (error) {
      console.error("Email sending error:", error);
      emailStatus.errors.push(error.message);
    }

    // Always return success if database save succeeded
    // Email failures are logged but don't block the user flow
    return new Response(
      JSON.stringify({
        ok: true,
        leadId: lead.id,
        message: "Lead successfully saved",
        emailStatus: {
          sent: emailStatus.sent,
          total: 2,
          hasErrors: emailStatus.errors.length > 0,
        }
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
