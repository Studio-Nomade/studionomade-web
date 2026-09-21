import nodemailer from "nodemailer";

import { type createServiceDatabaseClient } from "@studionomade/database";
import type { LeadSubmission, ServerEnvironment } from "@studionomade/validation";

export interface NotificationFailure {
  channel: "slack" | "email";
  reason: string;
}

export async function notifyLead(
  lead: LeadSubmission,
  environment: ServerEnvironment
): Promise<NotificationFailure[]> {
  const failures: NotificationFailure[] = [];
  const details = [
    `Nombre: ${lead.name}`,
    `Empresa: ${lead.company ?? "-"}`,
    `Email: ${lead.email}`,
    `Origen: ${lead.origin_slug ?? lead.origin_type}`,
    `UTM source: ${lead.utm_source ?? "-"}`,
    `UTM medium: ${lead.utm_medium ?? "-"}`,
    `UTM campaign: ${lead.utm_campaign ?? "-"}`,
    `UTM term: ${lead.utm_term ?? "-"}`,
    `UTM content: ${lead.utm_content ?? "-"}`
  ].join("\n");

  if (environment.SLACK_LEADS_WEBHOOK_URL) {
    try {
      const response = await fetch(environment.SLACK_LEADS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `Nuevo lead de Studio Nomade\n${details}` })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch {
      failures.push({ channel: "slack", reason: "delivery_failed" });
    }
  }

  if (
    environment.GOOGLE_SMTP_USER &&
    environment.GOOGLE_SMTP_APP_PASSWORD &&
    environment.LEADS_NOTIFY_TO
  ) {
    try {
      const transport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: environment.GOOGLE_SMTP_USER,
          pass: environment.GOOGLE_SMTP_APP_PASSWORD
        }
      });
      await transport.sendMail({
        from: environment.GOOGLE_SMTP_USER,
        to: environment.LEADS_NOTIFY_TO,
        subject: `Nuevo lead: ${lead.name}`,
        text: details
      });
    } catch {
      failures.push({ channel: "email", reason: "delivery_failed" });
    }
  }

  return failures;
}

export async function notifyLeadAndRecordFailures(
  database: ReturnType<typeof createServiceDatabaseClient>,
  leadId: string,
  lead: LeadSubmission,
  environment: ServerEnvironment
) {
  const failures = await notifyLead(lead, environment);

  for (const failure of failures) {
    try {
      await database.from("lead_events").insert({
        lead_id: leadId,
        event_type: "notificacion_fallida",
        metadata: { channel: failure.channel, reason: failure.reason }
      });
    } catch {
      // El lead ya existe. Un fallo al registrar telemetría no debe convertirlo en error de usuario.
    }
  }

  return failures;
}
