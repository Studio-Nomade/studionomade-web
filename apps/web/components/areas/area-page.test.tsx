import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/areas/branding" }));
vi.mock("../../app/actions", () => ({ submitContactLead: vi.fn(async () => null) }));

import { areas } from "../../content/areas";
import { AreaPage } from "./area-page";

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: false, json: async () => null }))
  );
});

describe("AreaPage", () => {
  it("Branding: secciones en orden, carrusel de mockups y equipo de 5", () => {
    const { container } = render(<AreaPage area={areas.branding} />);
    expect(screen.getByRole("heading", { level: 1, name: "BRANDING" })).toBeTruthy();
    const h2 = [...container.querySelectorAll("main h2")].map((node) => node.textContent);
    expect(h2).toEqual([
      "¿Qué hacemos?",
      "Metodología",
      "¿Qué entregamos?",
      "Conoce al equipo",
      "¿Tienes algún proyecto en mente?",
      "Contáctanos"
    ]);
    const rail = screen.getByRole("region", { name: "Mockups de marcas" });
    expect(within(rail).getAllByRole("group")).toHaveLength(3);
    expect(screen.getAllByRole("heading", { level: 3 }).map((node) => node.textContent)).toContain(
      "Fa Casol"
    );
    expect(container.querySelectorAll("main [data-placeholder]")).toHaveLength(5);
    expect(screen.getByRole("link", { name: /Contáctanos/ })?.getAttribute("href")).toBe(
      "#contacto"
    );
    expect(container.querySelector("#contacto form")).toBeTruthy();
  });

  it("Architecture: imagen sobre banda, pills, +50 y equipo de 6", () => {
    const { container } = render(<AreaPage area={areas.architecture} />);
    expect(screen.queryByRole("region", { name: "Mockups de marcas" })).toBeNull();
    expect(container.querySelector("[data-media='banded']")).toBeTruthy();
    expect(screen.getByText("Montaje en terreno")).toBeTruthy();
    expect(container.querySelector("[data-motion='counter']")?.getAttribute("data-to")).toBe("50");
    expect(container.querySelectorAll("main [data-placeholder]")).toHaveLength(6);
    expect(screen.queryByText("Fa Casol")).toBeNull();
  });
});
