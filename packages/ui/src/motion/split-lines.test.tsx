import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SplitLines } from "./split-lines";

const LINES = ["Una idea clara.", "Una marca que la sostiene."];

describe("SplitLines", () => {
  it("renderiza una caja por línea", () => {
    const { container } = render(<SplitLines lines={LINES} />);
    expect(container.querySelectorAll("[style*='--sn-reveal-step']")).toHaveLength(LINES.length);
  });

  it("escalona cada línea de forma incremental", () => {
    const { container } = render(<SplitLines lines={LINES} />);
    const inners = [...container.querySelectorAll<HTMLElement>("[style*='--sn-reveal-step']")];
    expect(inners.map((el) => el.style.getPropertyValue("--sn-reveal-step"))).toEqual(["0", "1"]);
  });

  it("desplaza el inicio del escalonado con step", () => {
    const { container } = render(<SplitLines lines={LINES} step={4} />);
    const inners = [...container.querySelectorAll<HTMLElement>("[style*='--sn-reveal-step']")];
    expect(inners.map((el) => el.style.getPropertyValue("--sn-reveal-step"))).toEqual(["4", "5"]);
  });

  it("se marca para el observador como una sola unidad", () => {
    const { container } = render(<SplitLines lines={LINES} />);
    expect(container.querySelectorAll("[data-reveal]")).toHaveLength(1);
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
