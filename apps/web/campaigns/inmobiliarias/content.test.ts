import { describe, expect, it } from "vitest";
import { PROJECT_STAGES } from "@studionomade/validation";

import { CAMPAIGN_LEAD_CONSENT_VERSION, LEAD_CONSENTS } from "../../content/legal/consentimientos";
import { classifyClick } from "../../lib/analytics/clicks";
import { inmobiliariasContent, inmobiliariasLanding } from "./content";
import { whatsappHref } from "./whatsapp";

describe("contenido de la campaña inmobiliarias", () => {
  it("las etapas del formulario pertenecen al enum validado en servidor y en la base", () => {
    expect(inmobiliariasContent.form.stages.map(({ value }) => value)).toEqual([...PROJECT_STAGES]);
  });

  it("el consentimiento vigente de campaña enlaza a la política de privacidad", () => {
    const consent = LEAD_CONSENTS[CAMPAIGN_LEAD_CONSENT_VERSION];
    expect(consent.link.href).toBe("/privacidad");
    expect(consent.text).toContain(consent.link.label);
  });

  it("la landing mantiene la estructura de conversión acordada", () => {
    expect(inmobiliariasLanding.services.length).toBeGreaterThanOrEqual(4);
    expect(inmobiliariasLanding.services.length).toBeLessThanOrEqual(6);
    expect(inmobiliariasLanding.faq.length).toBeGreaterThanOrEqual(4);
    expect(inmobiliariasLanding.faq.length).toBeLessThanOrEqual(6);
    // Un paso de proceso por cada etiqueta de la línea de tiempo.
    expect(inmobiliariasLanding.process).toHaveLength(inmobiliariasContent.steps.length);
    expect(inmobiliariasContent.footline).toHaveLength(inmobiliariasContent.steps.length);
  });
});

describe("enlace de WhatsApp", () => {
  const href = whatsappHref(
    inmobiliariasLanding.whatsapp.phone,
    inmobiliariasLanding.whatsapp.message
  );

  it("usa el número del estudio en formato wa.me con texto prellenado", () => {
    expect(href.startsWith("https://wa.me/56934045111?text=")).toBe(true);
    expect(decodeURIComponent(href.split("text=")[1])).toBe(inmobiliariasLanding.whatsapp.message);
  });

  it("se mide como Contact (canal whatsapp) cuando no está dentro de un data-cta", () => {
    const link = document.createElement("a");
    link.href = href;
    expect(classifyClick(link, "/campanas/inmobiliarias")).toEqual({
      event: "contact_click",
      properties: { channel: "whatsapp", path: "/campanas/inmobiliarias" }
    });
  });

  it("descarta todo lo que no sea dígito y exige un número", () => {
    expect(whatsappHref("+569 3404-5111")).toBe("https://wa.me/56934045111");
    expect(() => whatsappHref("+")).toThrow();
  });
});
