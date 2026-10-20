import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Reveal } from "./reveal";

describe("Reveal", () => {
  it("marca el elemento para el runtime con el preset jump por defecto", () => {
    render(<Reveal>contenido</Reveal>);
    const element = screen.getByText("contenido");
    expect(element).toHaveAttribute("data-reveal");
    expect(element).toHaveAttribute("data-motion", "jump");
  });

  it("acepta todos los presets", () => {
    for (const preset of ["jump", "fade", "headline", "stroke"] as const) {
      const { unmount } = render(<Reveal preset={preset}>{preset}</Reveal>);
      expect(screen.getByText(preset)).toHaveAttribute("data-motion", preset);
      unmount();
    }
  });

  it("mask envuelve el medio y añade dos capas decorativas", () => {
    const { container } = render(
      <Reveal preset="mask" direction="left">
        <img alt="caso" src="/x.webp" />
      </Reveal>
    );
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("data-direction", "left");
    expect(root.querySelector("[data-mask-media] img")).toBeInTheDocument();
    const layers = root.querySelectorAll("[data-mask-layer]");
    expect(layers).toHaveLength(2);
    for (const layer of layers) expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("img", { name: "caso" })).toBeInTheDocument();
  });

  it("mapea las variantes heredadas", () => {
    render(<Reveal variant="rise">rise</Reveal>);
    expect(screen.getByText("rise")).toHaveAttribute("data-motion", "jump");
  });

  it("traduce step y delay a un retardo en segundos", () => {
    render(
      <Reveal step={3} delay={0.1}>
        escalonado
      </Reveal>
    );
    expect(screen.getByText("escalonado")).toHaveAttribute("data-motion-delay", "0.37");
  });

  it("sin JS se ve: no trae estilos en línea ni estado revelado", () => {
    render(<Reveal>visible</Reveal>);
    const element = screen.getByText("visible");
    expect(element.getAttribute("style")).toBeNull();
    expect(element).not.toHaveAttribute("data-revealed");
  });

  it("respeta la etiqueta y la clase de la composición", () => {
    render(
      <Reveal as="section" className="service-card">
        seccion
      </Reveal>
    );
    expect(screen.getByText("seccion").tagName).toBe("SECTION");
    expect(screen.getByText("seccion")).toHaveClass("service-card");
  });
});
