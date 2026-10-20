import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "./site-header";

const LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Proyectos", href: "/proyectos" },
  { label: "Contacto", href: "/contacto" }
];

describe("SiteHeader", () => {
  it("muestra la marca y el botón Menú", () => {
    render(<SiteHeader links={LINKS} />);
    expect(screen.getAllByRole("link", { name: "STUDIO NOMADE" })[0]).toHaveAttribute("href", "/");
    expect(screen.getByRole("button", { name: "Menú" })).toHaveAttribute("aria-expanded", "false");
  });

  it("sin abrir, el menú queda fuera del árbol accesible tras hidratar", () => {
    render(<SiteHeader links={LINKS} />);
    const dialog = document.querySelector("[role='dialog']");
    expect(dialog).toHaveAttribute("inert");
  });

  it("abre como diálogo modal, enfoca el primer enlace y cierra con Escape", () => {
    render(<SiteHeader links={LINKS} />);
    const toggle = screen.getByRole("button", { name: "Menú" });
    act(() => toggle.click());

    const dialog = screen.getByRole("dialog", { name: "Navegación principal" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).not.toHaveAttribute("inert");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(document.activeElement).toHaveTextContent("Inicio");
    expect(document.documentElement).toHaveAttribute("data-scroll-locked");

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(toggle);
    expect(document.documentElement).not.toHaveAttribute("data-scroll-locked");
  });

  it("marca la ruta actual", () => {
    render(<SiteHeader links={LINKS} currentPath="/proyectos/kumelen" />);
    expect(screen.getByRole("link", { name: /Proyectos/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /Inicio/ })).not.toHaveAttribute("aria-current");
  });

  it("usa el componente de enlace del framework", () => {
    const Custom = (props: { href: string; children?: React.ReactNode }) => (
      <a data-custom="" {...props} />
    );
    render(<SiteHeader links={LINKS} linkComponent={Custom} />);
    expect(screen.getByRole("link", { name: /Contacto/ })).toHaveAttribute("data-custom");
  });
});
