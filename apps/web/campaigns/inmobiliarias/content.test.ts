import { describe, expect, it } from "vitest";
import { PROJECT_STAGES } from "@studionomade/validation";

import { CAMPAIGN_LEAD_CONSENT_VERSION, LEAD_CONSENTS } from "../../content/legal/consentimientos";
import { inmobiliariasContent } from "./content";

describe("contenido de la campaña inmobiliarias", () => {
  it("las etapas del formulario pertenecen al enum validado en servidor y en la base", () => {
    expect(inmobiliariasContent.form.stages.map(({ value }) => value)).toEqual([...PROJECT_STAGES]);
  });

  it("el consentimiento vigente de campaña enlaza a la política de privacidad", () => {
    const consent = LEAD_CONSENTS[CAMPAIGN_LEAD_CONSENT_VERSION];
    expect(consent.link.href).toBe("/privacidad");
    expect(consent.text).toContain(consent.link.label);
  });
});
