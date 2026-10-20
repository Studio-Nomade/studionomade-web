import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Carousel } from "./carousel";

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  Element.prototype.scrollTo = vi.fn();
});

const SLIDES = ["Uno", "Dos", "Tres"].map((label) => <p key={label}>{label}</p>);

describe("Carousel", () => {
  it("expone región, diapositivas etiquetadas y controles", () => {
    render(<Carousel label="Proyectos">{SLIDES}</Carousel>);
    expect(screen.getByRole("region", { name: "Proyectos" })).toHaveAttribute(
      "aria-roledescription",
      "carrusel"
    );
    const groups = screen.getAllByRole("group");
    expect(groups).toHaveLength(3);
    expect(groups[1]).toHaveAttribute("aria-label", "2 de 3");
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeEnabled();
  });

  it("avanza con la flecha y con el teclado, y anuncia la diapositiva", () => {
    render(<Carousel label="Proyectos">{SLIDES}</Carousel>);
    act(() => screen.getByRole("button", { name: "Siguiente" }).click());
    expect(screen.getAllByRole("group")[1]).toHaveAttribute("data-active");
    expect(screen.getByText("2 de 3", { selector: "p" })).toHaveAttribute("aria-live", "polite");

    fireEvent.keyDown(screen.getByRole("region"), { key: "End" });
    expect(screen.getAllByRole("group")[2]).toHaveAttribute("data-active");
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
  });

  it("con loop vuelve al inicio", () => {
    render(
      <Carousel label="Proyectos" loop>
        {SLIDES}
      </Carousel>
    );
    fireEvent.keyDown(screen.getByRole("region"), { key: "ArrowLeft" });
    expect(screen.getAllByRole("group")[2]).toHaveAttribute("data-active");
  });

  it("con autoplay ofrece pausa, y con movimiento reducido no corre", () => {
    const { unmount } = render(
      <Carousel label="Hero" autoplay={5000}>
        {SLIDES}
      </Carousel>
    );
    expect(screen.getByRole("button", { name: "Pausar" })).toHaveAttribute("aria-pressed", "false");
    unmount();

    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce") }));
    render(
      <Carousel label="Hero" autoplay={5000}>
        {SLIDES}
      </Carousel>
    );
    expect(screen.queryByRole("button", { name: "Pausar" })).toBeNull();
  });

  it("el carril es enfocable para desplazarlo sin JS", () => {
    const { container } = render(<Carousel label="Proyectos">{SLIDES}</Carousel>);
    expect(container.querySelector("[tabindex='0']")).toBeInTheDocument();
  });

  it("con layout sides muestra etiquetas clicables y barra segmentada", () => {
    const { container } = render(
      <Carousel label="Mockups" layout="sides" labels={["Mockup 01", "Mockup 02"]} accent>
        {[<p key="a">A</p>, <p key="b">B</p>]}
      </Carousel>
    );
    const region = screen.getByRole("region", { name: "Mockups" });
    expect(region).toHaveAttribute("data-layout", "sides");
    expect(region).toHaveAttribute("data-accent-progress");
    expect(screen.getAllByRole("group")[0]).toHaveAttribute("aria-label", "Mockup 01");
    const first = screen.getByRole("button", { name: "Mockup 01" });
    expect(first).toHaveAttribute("aria-current", "true");

    act(() => screen.getByRole("button", { name: "Mockup 02" }).click());
    expect(screen.getAllByRole("group")[1]).toHaveAttribute("data-active");
    expect(screen.getByRole("button", { name: "Mockup 02" })).toHaveAttribute(
      "aria-current",
      "true"
    );
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
    const segment = container.querySelector<HTMLElement>("[style*='--sn-carousel-progress']");
    expect(segment?.style.getPropertyValue("--sn-carousel-progress")).toBe("1");
    expect(screen.getByText("Mockup 02, 2 de 2", { selector: "p" })).toBeInTheDocument();
  });
});
