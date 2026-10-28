import { describe, expect, it } from "vitest";
import type { z } from "zod";

import {
  campaignLeadSubmissionSchema,
  LEAD_AREAS,
  LEAD_BUDGET_RANGES,
  LEAD_NEEDS,
  LEAD_SOURCE_CHANNELS,
  LEAD_TIMELINES,
  leadFormInput,
  leadSubmissionSchema,
  normalizeChileanPhone,
  PROJECT_STAGES,
  qualifiedLeadSubmissionSchema,
  utmSchema
} from "./leads";

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

const validCampaignLead = {
  ...validLead,
  form_slug: "campana-inmobiliarias",
  origin_type: "campana" as const,
  company: "Edificio Mirador",
  project_stage: "en_desarrollo",
  consent_version: "2026-10-v1"
};

const firstError = (result: { success: boolean; error?: z.ZodError }, field: string) =>
  result.error?.flatten().fieldErrors[field as never]?.[0];

describe("mensajes de error en español", () => {
  it("nombre y email vacíos", () => {
    const result = leadSubmissionSchema.safeParse({ ...validLead, name: "", email: "" });
    expect(firstError(result, "name")).toBe("Ingresa tu nombre (mínimo 2 caracteres).");
    expect(firstError(result, "email")).toBe("Ingresa tu email.");
  });

  it("nombre y email ausentes", () => {
    const result = leadSubmissionSchema.safeParse({
      ...validLead,
      name: undefined,
      email: undefined
    });
    expect(firstError(result, "name")).toBe("Ingresa tu nombre.");
    expect(firstError(result, "email")).toBe("Ingresa tu email.");
  });

  it("email con formato inválido", () => {
    const result = leadSubmissionSchema.safeParse({ ...validLead, email: "invalido" });
    expect(firstError(result, "email")).toMatch(/^Ingresa un email válido/);
  });

  it("mensaje demasiado largo", () => {
    const result = leadSubmissionSchema.safeParse({ ...validLead, message: "x".repeat(2_001) });
    expect(firstError(result, "message")).toBe("El mensaje no puede superar 2.000 caracteres.");
  });
});

describe("atribución de clics", () => {
  it("conserva gclid, fbclid, cookies de Meta y URL de aterrizaje válidos", () => {
    const result = leadSubmissionSchema.parse({
      ...validLead,
      gclid: "Cj0KCQjw-abc_123",
      fbclid: "IwAR0abc-DEF_123",
      fbp: "fb.1.1729400000000.1234567890",
      fbc: "fb.1.1729400000000.IwAR0abc-DEF_123",
      landing_url: "https://studionomade.cl/campanas/inmobiliarias?utm_source=meta"
    });
    expect(result).toMatchObject({
      gclid: "Cj0KCQjw-abc_123",
      fbclid: "IwAR0abc-DEF_123",
      fbp: "fb.1.1729400000000.1234567890",
      fbc: "fb.1.1729400000000.IwAR0abc-DEF_123",
      landing_url: "https://studionomade.cl/campanas/inmobiliarias?utm_source=meta"
    });
  });

  it("descarta valores malformados sin bloquear el lead", () => {
    const result = leadSubmissionSchema.safeParse({
      ...validLead,
      gclid: "<script>",
      fbclid: "x".repeat(600),
      fbp: "no-es-fbp",
      fbc: "fb.1.123.abc",
      landing_url: "javascript:alert(1)"
    });
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      gclid: undefined,
      fbclid: undefined,
      fbp: undefined,
      fbc: undefined,
      landing_url: undefined
    });
  });

  it("trata vacíos como ausentes", () => {
    const result = leadSubmissionSchema.parse({ ...validLead, gclid: "", fbclid: " " });
    expect(result.gclid).toBeUndefined();
    expect(result.fbclid).toBeUndefined();
  });
});

describe("campaignLeadSubmissionSchema", () => {
  it("acepta un lead de campaña completo", () => {
    const result = campaignLeadSubmissionSchema.parse({
      ...validCampaignLead,
      phone: "+56 9 1234 5678"
    });
    expect(result.project_stage).toBe("en_desarrollo");
    expect(result.phone).toBe("+56912345678");
  });

  it("exige proyecto y etapa con mensajes en español", () => {
    const result = campaignLeadSubmissionSchema.safeParse({
      ...validCampaignLead,
      company: "",
      project_stage: ""
    });
    expect(firstError(result, "company")).toBe("Ingresa el nombre del proyecto.");
    expect(firstError(result, "project_stage")).toBe("Selecciona la etapa del proyecto.");
  });

  it("rechaza etapas fuera del enum", () => {
    const result = campaignLeadSubmissionSchema.safeParse({
      ...validCampaignLead,
      project_stage: "Etapa: inventada"
    });
    expect(firstError(result, "project_stage")).toBe("Selecciona la etapa del proyecto.");
  });

  it("el teléfono es opcional pero, si viene, debe ser chileno", () => {
    expect(campaignLeadSubmissionSchema.parse({ ...validCampaignLead, phone: "" }).phone).toBe(
      undefined
    );
    const result = campaignLeadSubmissionSchema.safeParse({
      ...validCampaignLead,
      phone: "+34 600 123 456"
    });
    expect(firstError(result, "phone")).toMatch(/^Ingresa un teléfono chileno válido/);
  });

  it("el schema general sigue aceptando leads sin etapa ni proyecto", () => {
    expect(leadSubmissionSchema.safeParse(validLead).success).toBe(true);
  });
});

describe("normalizeChileanPhone", () => {
  it.each([
    ["+56 9 1234 5678", "+56912345678"],
    ["912345678", "+56912345678"],
    ["56 9 1234-5678", "+56912345678"],
    ["(2) 2345 6789", "+56223456789"],
    ["+56.2.2345.6789", "+56223456789"]
  ])("normaliza %s", (input, expected) => expect(normalizeChileanPhone(input)).toBe(expected));

  it.each(["12345678", "+56 1 2345 6789", "+1 415 555 0100", "teléfono", "+56 9 1234 56789"])(
    "rechaza %s",
    (input) => expect(normalizeChileanPhone(input)).toBeNull()
  );
});

describe("PROJECT_STAGES", () => {
  it("coincide con el check de la base de datos", () =>
    expect(PROJECT_STAGES).toEqual(["idea", "en_desarrollo", "en_venta"]));
});

const validQualifiedLead = {
  ...validLead,
  company: "Marca Ejemplo",
  areas: ["branding", "web-design"],
  needs: ["imagen_marca", "diseno_web"],
  budget_range: "3m_8m",
  timeline: "1_3_meses"
};

describe("qualifiedLeadSubmissionSchema", () => {
  it("acepta un lead calificado completo", () => {
    const result = qualifiedLeadSubmissionSchema.parse({
      ...validQualifiedLead,
      source_channel: "instagram"
    });
    expect(result).toMatchObject({
      company: "Marca Ejemplo",
      areas: ["branding", "web-design"],
      needs: ["imagen_marca", "diseno_web"],
      budget_range: "3m_8m",
      timeline: "1_3_meses",
      source_channel: "instagram"
    });
  });

  it("exige empresa, áreas, necesidades, presupuesto y plazo con mensajes en español", () => {
    const result = qualifiedLeadSubmissionSchema.safeParse({
      ...validLead,
      company: "",
      budget_range: "",
      timeline: ""
    });
    expect(firstError(result, "company")).toBe("Ingresa tu empresa o marca.");
    expect(firstError(result, "areas")).toBe("Selecciona al menos un área de interés.");
    expect(firstError(result, "needs")).toBe("Selecciona al menos una opción.");
    expect(firstError(result, "budget_range")).toBe("Selecciona un rango de presupuesto.");
    expect(firstError(result, "timeline")).toBe("Selecciona un plazo.");
  });

  it("rechaza valores fuera de las listas", () => {
    const result = qualifiedLeadSubmissionSchema.safeParse({
      ...validQualifiedLead,
      areas: ["branding", "inventada"],
      budget_range: "un-millon",
      source_channel: "tiktok"
    });
    expect(firstError(result, "areas")).toBe("Selecciona al menos un área de interés.");
    expect(firstError(result, "budget_range")).toBe("Selecciona un rango de presupuesto.");
    expect(firstError(result, "source_channel")).toBe("Selecciona una opción válida.");
  });

  it("acepta un valor suelto como lista de uno y descarta duplicados", () => {
    const result = qualifiedLeadSubmissionSchema.parse({
      ...validQualifiedLead,
      areas: "audiovisual",
      needs: ["otro", "otro"]
    });
    expect(result.areas).toEqual(["audiovisual"]);
    expect(result.needs).toEqual(["otro"]);
  });

  it("el schema general sigue aceptando leads sin calificación", () => {
    const result = leadSubmissionSchema.parse({ ...validLead, areas: "", source_channel: "" });
    expect(result.areas).toBeUndefined();
    expect(result.source_channel).toBeUndefined();
  });
});

describe("leadFormInput", () => {
  it("conserva todas las marcas de los campos múltiples", () => {
    const formData = new FormData();
    formData.append("name", "Ada");
    formData.append("areas", "branding");
    formData.append("areas", "audiovisual");
    formData.append("needs", "otro");
    expect(leadFormInput(formData)).toEqual({
      name: "Ada",
      areas: ["branding", "audiovisual"],
      needs: ["otro"]
    });
  });
});

describe("listas de calificación", () => {
  it("coinciden con los checks de 202610210001_lead_qualification.sql", () => {
    expect(LEAD_AREAS).toEqual(["branding", "architecture", "audiovisual", "web-design"]);
    expect(LEAD_NEEDS).toHaveLength(8);
    expect(LEAD_BUDGET_RANGES).toEqual([
      "menos_1m",
      "1m_3m",
      "3m_8m",
      "8m_20m",
      "mas_20m",
      "sin_definir"
    ]);
    expect(LEAD_TIMELINES).toEqual(["lo_antes_posible", "1_3_meses", "3_6_meses", "sin_fecha"]);
    expect(LEAD_SOURCE_CHANNELS).toEqual([
      "recomendacion",
      "instagram",
      "linkedin",
      "behance",
      "google",
      "otro"
    ]);
  });
});
