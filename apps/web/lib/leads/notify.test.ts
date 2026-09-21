import { afterEach, describe, expect, it, vi } from "vitest";

import { type createServiceDatabaseClient } from "@studionomade/database";
import type { LeadSubmission, ServerEnvironment } from "@studionomade/validation";

import { notifyLeadAndRecordFailures } from "./notify";

const lead = {
  form_slug: "contacto-general",
  name: "Ada Lovelace",
  email: "ada@example.com",
  source_path: "/contacto",
  origin_type: "contacto",
  t: "123",
  t_signature: "firma",
  consentimiento: "on",
  consent_version: "2026-09"
} satisfies LeadSubmission;

const environment = {
  SUPABASE_URL: "http://localhost:54321",
  SUPABASE_SERVICE_ROLE_KEY: "local-service-key",
  LEAD_IP_SALT: "local-ip-salt-with-enough-length",
  LEAD_FORM_SECRET: "local-form-secret-with-enough-length",
  SLACK_LEADS_WEBHOOK_URL: "https://hooks.slack.test/leads",
  GOOGLE_SMTP_USER: "",
  GOOGLE_SMTP_APP_PASSWORD: "",
  LEADS_NOTIFY_TO: ""
} satisfies ServerEnvironment;

afterEach(() => vi.unstubAllGlobals());

describe("notifyLead", () => {
  it("reporta Slack caído sin lanzar ni exponer datos en logs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const insert = vi.fn().mockResolvedValue({ error: null });
    const database = {
      from: vi.fn().mockReturnValue({ insert })
    } as unknown as ReturnType<typeof createServiceDatabaseClient>;

    await expect(
      notifyLeadAndRecordFailures(
        database,
        "00000000-0000-0000-0000-000000000001",
        lead,
        environment
      )
    ).resolves.toEqual([{ channel: "slack", reason: "delivery_failed" }]);
    expect(insert).toHaveBeenCalledWith({
      lead_id: "00000000-0000-0000-0000-000000000001",
      event_type: "notificacion_fallida",
      metadata: { channel: "slack", reason: "delivery_failed" }
    });
  });
});
