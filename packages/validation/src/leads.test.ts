import { describe, expect, it } from "vitest";

import { leadSubmissionSchema, utmSchema } from "./leads";

const validLead = {
  form_slug: "contacto-general",
  name: "Ada Lovelace",
  email: "ada@example.com",
  source_path: "/contacto",
  origin_type: "contacto" as const,
  t: "123",
  t_signature: "firma",
  consentimiento: "on",
  consent_version: "2026-09"
};

describe("leadSubmissionSchema", () => {
  it("exige consentimiento explícito", () => {
    expect(
      leadSubmissionSchema.safeParse({ ...validLead, consentimiento: undefined }).success
    ).toBe(false);
  });

  it("rechaza correos inválidos", () => {
    expect(leadSubmissionSchema.safeParse({ ...validLead, email: "invalido" }).success).toBe(false);
  });

  it("acepta campos opcionales vacíos", () => {
    const result = leadSubmissionSchema.parse({ ...validLead, phone: "", company: "" });
    expect(result.phone).toBeUndefined();
    expect(result.company).toBeUndefined();
  });

  it("acota todos los UTM a 255 caracteres", () => {
    for (const key of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content"
    ] as const) {
      expect(utmSchema.safeParse({ [key]: "x".repeat(256) }).success).toBe(false);
    }
  });
});
