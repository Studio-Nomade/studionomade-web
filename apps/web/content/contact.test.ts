import { describe, expect, it } from "vitest";

import {
  LEAD_AREAS,
  LEAD_BUDGET_RANGES,
  LEAD_NEEDS,
  LEAD_SOURCE_CHANNELS,
  LEAD_TIMELINES
} from "@studionomade/validation";

import { STUDIO_AREAS } from "./area-meta";
import {
  AREA_OPTIONS,
  BOOKING_URL,
  BUDGET_OPTIONS,
  CONTACT_CONSENT_VERSION,
  DIRECT_CONTACTS,
  isEmbeddableBookingUrl,
  NEED_OPTIONS,
  optionLabel,
  SOURCE_OPTIONS,
  TIMELINE_OPTIONS
} from "./contact";
import { LEAD_CONSENTS } from "./legal/consentimientos";

const values = (options: { value: string }[]) => options.map((option) => option.value);

describe("opciones del formulario de contacto", () => {
  it("cubren exactamente los valores que acepta el schema", () => {
    expect(values(AREA_OPTIONS)).toEqual([...LEAD_AREAS]);
    expect(values(NEED_OPTIONS)).toEqual([...LEAD_NEEDS]);
    expect(values(BUDGET_OPTIONS)).toEqual([...LEAD_BUDGET_RANGES]);
    expect(values(TIMELINE_OPTIONS)).toEqual([...LEAD_TIMELINES]);
    expect(values(SOURCE_OPTIONS)).toEqual([...LEAD_SOURCE_CHANNELS]);
  });

  it("nombra las áreas como la marca", () => {
    expect(AREA_OPTIONS.map((option) => option.label)).toEqual(
      STUDIO_AREAS.map((area) => area.name)
    );
  });

  it("usa una versión de consentimiento registrada y con enlace a la política", () => {
    expect(LEAD_CONSENTS[CONTACT_CONSENT_VERSION]).toHaveProperty("link.href", "/privacidad");
  });

  it("traduce valores a etiquetas", () => {
    expect(optionLabel(BUDGET_OPTIONS, "sin_definir")).toBe("Aún no lo sé");
    expect(optionLabel(BUDGET_OPTIONS, undefined)).toBeUndefined();
  });
});

describe("DIRECT_CONTACTS", () => {
  it("expone los canales del estudio con enlaces válidos", () => {
    expect(DIRECT_CONTACTS.map((contact) => [contact.label, contact.value])).toEqual([
      ["General", "contact@studionomade.cl"],
      ["Ventas", "sales@studionomade.cl"],
      ["Branding y marcas", "branding@studionomade.cl"],
      ["Legal", "legal@studionomade.cl"],
      ["WhatsApp comercial", "+56 9 3404 5111"]
    ]);
    for (const contact of DIRECT_CONTACTS) {
      if (contact.kind === "email") expect(contact.href).toBe(`mailto:${contact.value}`);
      else expect(contact.href).toBe("https://wa.me/56934045111");
    }
  });
});

describe("agenda de videollamadas", () => {
  it("la URL actual se puede incrustar", () => {
    expect(isEmbeddableBookingUrl(BOOKING_URL)).toBe(true);
  });

  it("acepta páginas de citas de Google Calendar", () => {
    expect(
      isEmbeddableBookingUrl(
        "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0abc?gv=true"
      )
    ).toBe(true);
  });

  it.each([
    "http://calendly.com/studionomade_/revision-proyecto",
    "https://calendly.com.evil.example/x",
    "https://example.com/agenda",
    "javascript:alert(1)",
    "no-es-url"
  ])("rechaza %s", (url) => expect(isEmbeddableBookingUrl(url)).toBe(false));
});
