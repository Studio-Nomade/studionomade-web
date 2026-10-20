import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Carousel, scrollProgress } from "./carousel";

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

  it("con controls=progress muestra solo la barra y el bloque lead", () => {
    const { container } = render(
      <Carousel label="Mockups" variant="peek" controls="progress" lead={<p>Nota</p>}>
        {SLIDES}
      </Carousel>
    );
    expect(screen.queryByRole("button", { name: "Siguiente" })).toBeNull();
    expect(screen.getByText("Nota")).toBeInTheDocument();
    const region = screen.getByRole("region", { name: "Mockups" });
    expect(region).toHaveAttribute("data-controls", "progress");
    expect(region).toHaveAttribute("data-lead");
    const bar = container.querySelector("[data-mode='scroll']") as HTMLElement;
    expect(bar.style.getPropertyValue("--sn-carousel-thumb")).toBe(String(1 / 3));
    expect(bar.style.getPropertyValue("--sn-carousel-scroll")).toBe("0");
  });

  it("calcula el progreso del scroll entre 0 y 1", () => {
    expect(scrollProgress({ scrollLeft: 0, scrollWidth: 1000, clientWidth: 500 })).toBe(0);
    expect(scrollProgress({ scrollLeft: 250, scrollWidth: 1000, clientWidth: 500 })).toBe(0.5);
    expect(scrollProgress({ scrollLeft: 600, scrollWidth: 1000, clientWidth: 500 })).toBe(1);
    expect(scrollProgress({ scrollLeft: 0, scrollWidth: 500, clientWidth: 500 })).toBe(0);
  });

  it("se arrastra con el ratón y el arrastre no cuenta como clic", () => {
    const onClick = vi.fn();
    const { container } = render(
      <Carousel label="Mockups" variant="peek" controls="progress">
        <button type="button" onClick={onClick}>
          Uno
        </button>
        <p>Dos</p>
      </Carousel>
    );
    const track = container.querySelector("[tabindex='0']") as HTMLElement;
    track.scrollLeft = 100;
    // jsdom no implementa PointerEvent: se emite un evento con sus campos.
    const pointer = (type: string, clientX: number) => {
      const event = new MouseEvent(type, { bubbles: true, button: 0, clientX });
      Object.assign(event, { pointerType: "mouse", pointerId: 1 });
      fireEvent(track, event);
    };
    pointer("pointerdown", 300);
    pointer("pointermove", 240);
    expect(screen.getByRole("region")).toHaveAttribute("data-dragging");
    expect(track.scrollLeft).toBe(160);
    pointer("pointerup", 240);
    expect(screen.getByRole("region")).not.toHaveAttribute("data-dragging");
    fireEvent.click(screen.getByRole("button", { name: "Uno" }));
    expect(onClick).not.toHaveBeenCalled();
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

  it("combina layout sides con lead, y las etiquetas sirven también en la barra", () => {
    const { container, unmount } = render(
      <Carousel label="Casos" layout="sides" lead={<p>Intro</p>} labels={["A", "B", "C"]}>
        {SLIDES}
      </Carousel>
    );
    const region = screen.getByRole("region", { name: "Casos" });
    expect(region).toHaveAttribute("data-layout", "sides");
    expect(region).toHaveAttribute("data-lead");
    expect(screen.getByText("Intro")).toBeInTheDocument();
    const track = container.querySelector("[tabindex='0']") as HTMLElement;
    expect(track).toHaveAttribute("data-lenis-prevent-horizontal");
    unmount();

    render(
      <Carousel label="Galería" labels={["A", "B", "C"]}>
        {SLIDES}
      </Carousel>
    );
    expect(screen.getByRole("region", { name: "Galería" })).toHaveAttribute("data-layout", "bar");
    act(() => screen.getByRole("button", { name: "C" }).click());
    expect(screen.getAllByRole("group")[2]).toHaveAttribute("data-active");
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
  });

  it("con controls=progress ignora layout sides y no muestra flechas", () => {
    render(
      <Carousel label="Riel" layout="sides" controls="progress">
        {SLIDES}
      </Carousel>
    );
    const region = screen.getByRole("region", { name: "Riel" });
    expect(region).toHaveAttribute("data-layout", "bar");
    expect(region).toHaveAttribute("data-controls", "progress");
    expect(screen.queryByRole("button", { name: "Anterior" })).toBeNull();
  });
});
