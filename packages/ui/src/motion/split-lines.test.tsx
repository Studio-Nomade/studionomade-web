import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SplitLines } from "./split-lines";

const LINES = ["Una idea clara.", "Una marca que la sostiene."];

describe("SplitLines", () => {
  it("renderiza una máscara por línea", () => {
    const { container } = render(<SplitLines lines={LINES} />);
    expect(container.querySelectorAll("[data-split-inner]")).toHaveLength(LINES.length);
  });

  it("se marca para el runtime como una sola unidad de líneas", () => {
    const { container } = render(<SplitLines lines={LINES} />);
    expect(container.querySelectorAll("[data-reveal]")).toHaveLength(1);
    expect(container.firstElementChild).toHaveAttribute("data-motion", "lines");
  });

  it("traduce step a retardo para encadenar con otro bloque", () => {
    const { container } = render(<SplitLines lines={LINES} step={4} />);
    expect(container.firstElementChild).toHaveAttribute("data-motion-delay", "0.36");
  });

  /**
   * Cubre el riesgo real: `web.smoke.spec.ts` busca los titulares por su nombre
   * accesible. Partirlos no debe cambiarlo.
   */
  it("conserva el nombre accesible del titular completo", () => {
    render(<SplitLines as="h1" lines={["BRANDING"]} />);
    expect(screen.getByRole("heading", { name: "BRANDING" })).toBeInTheDocument();
  });

  it("une las líneas con separación en el nombre accesible", () => {
    render(<SplitLines as="h2" lines={LINES} />);
    expect(screen.getByRole("heading", { name: LINES.join(" ") })).toBeInTheDocument();
  });
});
