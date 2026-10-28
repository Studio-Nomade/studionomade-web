import { render } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { SmoothScroll } from "./smooth-scroll";

const loadMotion = vi.fn(() => new Promise(() => {}));
vi.mock("./runtime", async (original) => ({
  ...(await original<typeof import("./runtime")>()),
  loadMotion: () => loadMotion()
}));

function media(fine: boolean, reduce = false) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("reduce") ? reduce : fine
  }));
}

it("no renderiza nada", () => {
  media(false);
  const { container } = render(<SmoothScroll />);
  expect(container).toBeEmptyDOMElement();
});

it("se desactiva en táctil y con movimiento reducido", () => {
  media(false);
  render(<SmoothScroll />);
  media(true, true);
  render(<SmoothScroll />);
  expect(loadMotion).not.toHaveBeenCalled();
});

it("con puntero fino carga el motor para sincronizar con ScrollTrigger", () => {
  media(true);
  render(<SmoothScroll />);
  expect(loadMotion).toHaveBeenCalled();
});
