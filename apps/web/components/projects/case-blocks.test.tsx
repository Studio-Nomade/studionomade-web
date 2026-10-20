import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPublicProject, type CaseBlock, type PublicProject } from "../../content/projects";
import { CaseBlockView } from "./case-blocks";
import { CaseNext } from "./blocks/case-next";
import { CasePage } from "./case-page";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />
}));

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {}
  }));
  Element.prototype.scrollTo = vi.fn();
});

const kumelen = getPublicProject("kumelen")!;
const block = <T extends CaseBlock["type"]>(project: PublicProject, type: T) =>
  project.blocks.find((item) => item.type === type) as Extract<CaseBlock, { type: T }>;

describe("bloques de caso", () => {
  it("hero: título, año, código de área y servicios; sin Behance si falta la URL", () => {
    render(<CaseBlockView block={block(kumelen, "hero")} project={kumelen} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Kumelen");
    expect(screen.getByText("2025")).toBeInTheDocument();
    expect(screen.getByText("B&D")).toBeInTheDocument();
    expect(screen.getByText("Branding & Design")).toBeInTheDocument();
    const tags = screen.getByRole("list", { name: "Servicios" });
    expect(
      within(tags)
        .getAllByRole("listitem")
        .map((item) => item.textContent)
    ).toEqual(["Research", "Branding", "Diseño Web"]);
    expect(screen.queryByRole("link", { name: /Behance/ })).toBeNull();
  });

  it("hero: muestra Ver en Behance cuando el caso tiene URL", () => {
    const withUrl = { ...kumelen, behanceUrl: "https://www.behance.net/gallery/1/kumelen" };
    render(<CaseBlockView block={block(withUrl, "hero")} project={withUrl} />);
    const link = screen.getByRole("link", { name: /Ver Kumelen en Behance/ });
    expect(link).toHaveAttribute("href", withUrl.behanceUrl);
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("objetivos: lista ordenada 01–04 con círculo de trazo", () => {
    const { container } = render(
      <CaseBlockView block={block(kumelen, "objectives")} project={kumelen} />
    );
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent(/^01/);
    expect(container.querySelectorAll("[data-motion='stroke'] circle")).toHaveLength(4);
  });

  it("zonas: una sola lista ordenada repartida en dos columnas", () => {
    const reebok = getPublicProject("reebok-x-lollapalooza")!;
    const { container } = render(<CaseBlockView block={block(reebok, "zones")} project={reebok} />);
    const list = container.querySelector("ol")!;
    expect(within(list).getAllByRole("listitem")).toHaveLength(9);
    expect(list.style.getPropertyValue("--sn-step-count")).toBe("5");
  });

  it("slider: carrusel con etiquetas y barra de acento", () => {
    const nexa = getPublicProject("nexa")!;
    render(<CaseBlockView block={block(nexa, "slider")} project={nexa} />);
    const region = screen.getByRole("region", { name: "Mockups de NEXA" });
    expect(region).toHaveAttribute("data-layout", "sides");
    expect(region).toHaveAttribute("data-accent-progress");
    expect(screen.getByRole("button", { name: "Mockup 01" })).toHaveAttribute("aria-current");
  });

  it("créditos: pares rol / nombre normalizados", () => {
    const cinnalove = getPublicProject("cinnalove")!;
    render(<CaseBlockView block={block(cinnalove, "credits")} project={cinnalove} />);
    expect(screen.getByText("Cliente")).toBeInTheDocument();
    expect(screen.getByText("Anna Sanhueza")).toBeInTheDocument();
  });

  it("siguiente proyecto: un enlace grande al caso siguiente", () => {
    render(<CaseNext project={kumelen} />);
    const nav = screen.getByRole("navigation", { name: "Siguiente proyecto" });
    const link = within(nav).getByRole("link");
    expect(link).toHaveAttribute("href", "/proyectos/kumelen");
    expect(link).toHaveTextContent("Kumelen");
  });

  it("página: activa el acento del caso y termina en el siguiente del ciclo", () => {
    const equifax = getPublicProject("equifax")!;
    const { container } = render(
      <CasePage project={equifax} next={getPublicProject("reebok-x-lollapalooza")!} />
    );
    expect(container.querySelector("article")).toHaveAttribute("data-accent", "equifax");
    expect(screen.getByRole("navigation", { name: "Siguiente proyecto" })).toHaveTextContent(
      "Reebok x Lollapalooza"
    );
  });
});
