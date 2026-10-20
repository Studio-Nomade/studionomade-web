import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../app/actions", () => ({ submitContactLead: vi.fn(async () => null) }));

import { LEAD_CONSENTS } from "../../content/legal/consentimientos";
import { AREA_CONSENT_VERSION, AREA_FORM_SLUG, AreaContactForm } from "./area-contact-form";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: false, json: async () => null }))
  );
});

const hidden = (container: HTMLElement, name: string) =>
  container.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.value;

describe("AreaContactForm", () => {
  it("captura el lead con el origen del área y el consentimiento vigente", () => {
    const { container } = render(<AreaContactForm slug="architecture" />);
    expect(hidden(container, "form_slug")).toBe(AREA_FORM_SLUG);
    expect(hidden(container, "origin_type")).toBe("area");
    expect(hidden(container, "origin_slug")).toBe("architecture");
    expect(hidden(container, "source_path")).toBe("/areas/architecture");
    expect(hidden(container, "consent_version")).toBe(AREA_CONSENT_VERSION);
    expect(Object.hasOwn(LEAD_CONSENTS, AREA_CONSENT_VERSION)).toBe(true);
  });

  it("etiqueta los campos de Figma y enlaza la política de privacidad", () => {
    render(<AreaContactForm slug="branding" />);
    expect((screen.getByLabelText(/Tu Nombre/) as HTMLInputElement).required).toBe(true);
    expect(screen.getByLabelText(/Tu E-mail/)?.getAttribute("type")).toBe("email");
    expect(screen.getByLabelText("Mensaje").tagName).toBe("TEXTAREA");
    expect((screen.getByRole("checkbox") as HTMLInputElement).required).toBe(true);
    expect(screen.getByRole("link", { name: "política de privacidad" })?.getAttribute("href")).toBe(
      "/privacidad"
    );
    expect(screen.getByRole("button", { name: /Enviar mensaje/ })?.getAttribute("type")).toBe(
      "submit"
    );
  });
});
