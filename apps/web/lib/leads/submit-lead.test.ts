import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@studionomade/database", () => ({ createServiceDatabaseClient: vi.fn() }));

import { qualifiedLeadSubmissionSchema } from "@studionomade/validation";

import { submitLead } from "./submit-lead";

const request = { ipAddress: "127.0.0.1" };

function contactForm(overrides: Record<string, string | string[]> = {}) {
  const fields: Record<string, string | string[]> = {
    form_slug: "contacto-general",
    source_path: "/contacto",
    origin_type: "contacto",
    consent_version: "2026-10-v1",
    consentimiento: "on",
    t: "",
    t_signature: "",
    name: "Ada Lovelace",
    email: "ada@example.com",
    company: "Marca",
    areas: ["branding", "audiovisual"],
    needs: ["otro"],
    budget_range: "sin_definir",
    timeline: "sin_fecha",
    ...overrides
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    for (const item of Array.isArray(value) ? value : [value]) formData.append(key, item);
  }
  return formData;
}

describe("submitLead", () => {
  it("si solo falla la firma anti-spam pide recargar en vez de marcar campos", async () => {
    const result = await submitLead(contactForm(), request, {
      schema: qualifiedLeadSubmissionSchema
    });
    expect(result).toMatchObject({
      success: false,
      message: "No fue posible validar el envío. Recarga la página e intenta nuevamente.",
      fieldErrors: undefined
    });
  });

  it("devuelve los errores visibles y conserva las selecciones múltiples", async () => {
    const result = await submitLead(contactForm({ company: "", needs: [] }), request, {
      schema: qualifiedLeadSubmissionSchema
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.message).toBe("Revisa los campos indicados.");
    expect(result.fieldErrors?.company).toEqual(["Ingresa tu empresa o marca."]);
    expect(result.fieldErrors?.needs).toEqual(["Selecciona al menos una opción."]);
    expect(result.values?.areas).toBe("branding,audiovisual");
  });
});
