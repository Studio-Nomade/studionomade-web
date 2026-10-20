import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../app/actions", () => ({ submitContactLead: vi.fn() }));

import { HOME_FEATURED } from "../../content/home";
import { formErrorMessage, HomeContactForm } from "./home-contact-form";
import { HomeLanding } from "./home-landing";
import { ReelPlayer } from "./reel-player";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, json: async () => ({ t: "1", signature: "firma" }) }))
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("HomeLanding", () => {
  it("mantiene el h1 y los titulares de sección", () => {
    render(<HomeLanding />);
    expect(screen.getByRole("heading", { level: 1, name: "Studio Nomade" })).toBeInTheDocument();
    for (const name of [
      "Creative MOVEMENT",
      "SERVICIOS",
      "Agendemos una reunión",
      "REEL",
      "INSTAGRAM",
      "Últimas publicaciones",
      "CONTACTO"
    ]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
  });

  it("cada diapositiva del hero enlaza a su caso con el cursor «Ver»", () => {
    render(<HomeLanding />);
    for (const project of HOME_FEATURED) {
      const link = screen.getByRole("link", { name: `Ver proyecto ${project.title}` });
      expect(link).toHaveAttribute("href", `/proyectos/${project.slug}`);
      expect(link).toHaveAttribute("data-cursor-label", "Ver");
    }
  });

  it("solo la primera imagen del hero es prioritaria (LCP)", () => {
    const { container } = render(<HomeLanding />);
    const carousel = container.querySelector('[aria-roledescription="carrusel"]')!;
    const images = [...carousel.querySelectorAll("img")];
    expect(images).toHaveLength(HOME_FEATURED.length);
    expect(images[0]).not.toHaveAttribute("loading", "lazy");
    for (const image of images.slice(1)) expect(image).toHaveAttribute("loading", "lazy");
  });

  it("los servicios llevan a sus áreas o al contacto", () => {
    render(<HomeLanding />);
    expect(screen.getByRole("link", { name: "Ver área Branding" })).toHaveAttribute(
      "href",
      "/areas/branding"
    );
    expect(screen.getByRole("link", { name: "Ver área Architecture" })).toHaveAttribute(
      "href",
      "/areas/architecture"
    );
    expect(screen.getByRole("link", { name: "Consultar por Audiovisual" })).toHaveAttribute(
      "href",
      "#contacto"
    );
  });

  it("el CTA de reunión es magnético y apunta al formulario", () => {
    render(<HomeLanding />);
    const cta = screen.getByRole("link", { name: "Agenda una reunión" });
    expect(cta).toHaveAttribute("href", "#contacto");
    expect(cta.closest("[data-cursor-magnetic]")).not.toBeNull();
  });

  it("sin URL de reel no ofrece reproducir", () => {
    render(<HomeLanding />);
    expect(screen.queryByRole("button", { name: /Reproducir/ })).toBeNull();
  });

  it("las oficinas enlazan a Google Maps en otra pestaña", () => {
    render(<HomeLanding />);
    const links = screen.getAllByRole("link", { name: /Cómo llegar/ });
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link.getAttribute("href")).toMatch(/^https:\/\/www\.google\.com\/maps\//);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});

describe("HomeContactForm", () => {
  it("registra el consentimiento 2026-10-v1 con enlace a la política de privacidad", () => {
    const { container } = render(<HomeContactForm />);
    expect(container.querySelector('input[name="consent_version"]')).toHaveValue("2026-10-v1");
    const consent = screen.getByRole("checkbox", { name: /Autorizo a Studio Nomade SpA/ });
    expect(consent).toBeRequired();
    expect(screen.getByRole("link", { name: "política de privacidad" })).toHaveAttribute(
      "href",
      "/privacidad"
    );
  });

  it("conserva el origen del lead y la atribución", () => {
    const { container } = render(<HomeContactForm />);
    const value = (name: string) =>
      container.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.value;
    expect(value("form_slug")).toBe("contacto-general");
    expect(value("origin_type")).toBe("contacto");
    expect(value("origin_slug")).toBe("home");
    expect(value("source_path")).toBe("/");
    expect(container.querySelector('input[name="utm_source"]')).not.toBeNull();
  });

  it("etiqueta los campos en español", () => {
    render(<HomeContactForm />);
    for (const label of [/^Nombre y apellido/, /^Correo/, /^Teléfono$/, /^Empresa$/, /proyecto$/]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: "Enviar mensaje" })).toBeInTheDocument();
  });
});

describe("formErrorMessage", () => {
  it("si solo fallan campos técnicos, pide recargar en vez de «revisa los campos»", () => {
    expect(formErrorMessage("Revisa los campos indicados.", { t: ["Requerido"] })).toBe(
      "No fue posible validar el envío. Recarga la página e intenta nuevamente."
    );
  });

  it("con errores de la persona, conserva el mensaje del servidor", () => {
    expect(
      formErrorMessage("Revisa los campos indicados.", {
        email: ["Ingresa tu email."],
        t: ["Requerido"]
      })
    ).toBe("Revisa los campos indicados.");
    expect(formErrorMessage("El formulario no está disponible temporalmente.")).toBe(
      "El formulario no está disponible temporalmente."
    );
  });
});

describe("ReelPlayer", () => {
  it("abre el video en un diálogo modal y lo descarga al cerrar", () => {
    HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
    const { container } = render(
      <ReelPlayer embedUrl="https://player.vimeo.com/video/1?autoplay=1" title="Reel" />
    );
    expect(container.querySelector("iframe")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Reproducir Reel" }));
    const dialog = container.querySelector("dialog")!;
    expect(dialog).toHaveAttribute("open");
    expect(within(dialog).getByTitle("Reel")).toHaveAttribute(
      "src",
      "https://player.vimeo.com/video/1?autoplay=1"
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Cerrar" }));
    expect(container.querySelector("iframe")).toBeNull();
  });
});
