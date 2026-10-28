import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { submitQualifiedContactLead } = vi.hoisted(() => ({
  submitQualifiedContactLead: vi.fn(async () => null)
}));
vi.mock("../../app/actions", () => ({ submitQualifiedContactLead }));

import { CONTACT_CONSENT_VERSION, CONTACT_FORM_SLUG } from "../../content/contact";
import { ContactLeadForm } from "./contact-lead-form";
import { validateContactForm } from "./validate-contact-form";

beforeEach(() => {
  submitQualifiedContactLead.mockClear();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: false, json: async () => null }))
  );
});

const hidden = (container: HTMLElement, name: string) =>
  container.querySelector<HTMLInputElement>(`input[name="${name}"][type="hidden"]`)?.value;

describe("ContactLeadForm", () => {
  it("captura el lead como contacto con el consentimiento vigente", () => {
    const { container } = render(<ContactLeadForm />);
    expect(hidden(container, "form_slug")).toBe(CONTACT_FORM_SLUG);
    expect(hidden(container, "origin_type")).toBe("contacto");
    expect(hidden(container, "source_path")).toBe("/contacto");
    expect(hidden(container, "consent_version")).toBe(CONTACT_CONSENT_VERSION);
    expect(container.querySelector('input[name="empresa_web"]')).not.toBeNull();
  });

  it("pide los datos de calificación con controles nativos", () => {
    const { container } = render(<ContactLeadForm />);
    expect((screen.getByLabelText(/^Nombre/) as HTMLInputElement).required).toBe(true);
    expect(screen.getByLabelText(/^Email/).getAttribute("type")).toBe("email");
    expect((screen.getByLabelText(/^Teléfono/) as HTMLInputElement).required).toBe(false);
    expect((screen.getByLabelText(/Empresa \/ Marca/) as HTMLInputElement).required).toBe(true);
    expect(container.querySelectorAll('input[name="areas"][type="checkbox"]')).toHaveLength(4);
    expect(container.querySelectorAll('input[name="needs"][type="checkbox"]')).toHaveLength(8);
    expect(container.querySelectorAll('input[name="budget_range"][type="radio"]')).toHaveLength(6);
    expect(container.querySelectorAll('input[name="timeline"][type="radio"]')).toHaveLength(4);
    expect(container.querySelectorAll('input[name="source_channel"][type="radio"]')).toHaveLength(
      6
    );
    expect(screen.getByRole("group", { name: /Rango de presupuesto \(CLP\)/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: "política de privacidad" }).getAttribute("href")).toBe(
      "/privacidad"
    );
  });

  it("valida en el navegador y no envía si faltan obligatorios", () => {
    const { container } = render(<ContactLeadForm />);
    fireEvent.submit(container.querySelector("form")!);
    expect(submitQualifiedContactLead).not.toHaveBeenCalled();
    expect(screen.getByText("Ingresa tu empresa o marca.")).toBeTruthy();
    expect(screen.getByText("Selecciona al menos un área de interés.")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toBe("Revisa los campos indicados.");
    expect(document.activeElement?.getAttribute("name")).toBe("name");
    expect(
      screen.getByRole("group", { name: /Área de interés/ }).getAttribute("aria-describedby")
    ).toContain("contacto-areas-error");
  });
});

describe("validateContactForm", () => {
  const complete = () => {
    const formData = new FormData();
    formData.set("name", "Ada Lovelace");
    formData.set("email", "ada@example.com");
    formData.set("company", "Marca");
    formData.append("areas", "branding");
    formData.append("needs", "otro");
    formData.set("budget_range", "sin_definir");
    formData.set("timeline", "sin_fecha");
    formData.set("consentimiento", "on");
    return formData;
  };

  it("acepta un formulario completo sin canal ni mensaje", () => {
    expect(validateContactForm(complete())).toEqual({});
  });

  it("usa los mismos mensajes que el servidor", () => {
    const formData = complete();
    formData.set("name", "A");
    formData.set("email", "ada@");
    formData.delete("needs");
    expect(validateContactForm(formData)).toEqual({
      name: "Ingresa tu nombre (mínimo 2 caracteres).",
      email: "Ingresa un email válido, por ejemplo nombre@empresa.cl.",
      needs: "Selecciona al menos una opción."
    });
  });
});
