import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Reveal } from "./reveal";

describe("Reveal", () => {
  it("marca el elemento para el observador", () => {
    render(<Reveal>contenido</Reveal>);
    const element = screen.getByText("contenido");
    expect(element).toHaveAttribute("data-reveal");
    expect(element).toHaveAttribute("data-variant", "rise");
  });

  it("acepta las tres variantes", () => {
    for (const variant of ["rise", "fade", "mask"] as const) {
      const { unmount } = render(<Reveal variant={variant}>{variant}</Reveal>);
      expect(screen.getByText(variant)).toHaveAttribute("data-variant", variant);
      unmount();
    }
  });

  it("inyecta el escalonado como custom property", () => {
    render(<Reveal step={3}>escalonado</Reveal>);
    expect(screen.getByText("escalonado").style.getPropertyValue("--sn-reveal-step")).toBe("3");
  });

  it("no inyecta estilo cuando no hay escalonado", () => {
    render(<Reveal>simple</Reveal>);
    expect(screen.getByText("simple").getAttribute("style")).toBeNull();
  });

  it("respeta la etiqueta pedida", () => {
    render(<Reveal as="section">seccion</Reveal>);
    expect(screen.getByText("seccion").tagName).toBe("SECTION");
  });

  it("conserva la clase de la composición", () => {
    render(<Reveal className="service-card">con clase</Reveal>);
    expect(screen.getByText("con clase")).toHaveClass("service-card");
  });

  it("nace visible: el ocultado depende del estado en <html> y del observador, no del componente", () => {
    render(<Reveal>visible</Reveal>);
    // Sin data-revealed en el elemento no hay estado armado, y el <html> tampoco
    // trae el marcador de fallo del watchdog (data-reveal-failed).
    expect(screen.getByText("visible")).not.toHaveAttribute("data-revealed");
    expect(document.documentElement).not.toHaveAttribute("data-reveal-failed");
  });
});
