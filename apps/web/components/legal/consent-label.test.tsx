import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  CAMPAIGN_LEAD_CONSENT_VERSION,
  LEAD_CONSENTS,
  type LeadConsentVersion
} from "../../content/legal/consentimientos";
import { ConsentLabel } from "./consent-label";

describe("ConsentLabel", () => {
  it("muestra exactamente el texto registrado y enlaza a la política de privacidad", () => {
    const { container } = render(<ConsentLabel version={CAMPAIGN_LEAD_CONSENT_VERSION} />);
    expect(container.textContent).toBe(LEAD_CONSENTS[CAMPAIGN_LEAD_CONSENT_VERSION].text);
    expect(screen.getByRole("link", { name: "política de privacidad" }).getAttribute("href")).toBe(
      "/privacidad"
    );
  });

  it("todas las versiones con enlace contienen la etiqueta del enlace una sola vez", () => {
    for (const version of Object.keys(LEAD_CONSENTS) as LeadConsentVersion[]) {
      const consent = LEAD_CONSENTS[version];
      if (!("link" in consent)) continue;
      expect(consent.text.split(consent.link.label)).toHaveLength(2);
      const { container, unmount } = render(<ConsentLabel version={version} />);
      expect(container.textContent).toBe(consent.text);
      unmount();
    }
  });
});
