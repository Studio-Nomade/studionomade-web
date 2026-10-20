import { render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { Preloader } from "./preloader";

vi.mock("./runtime", async (original) => ({
  ...(await original<typeof import("./runtime")>()),
  loadMotion: () => new Promise(() => {})
}));

afterEach(() => {
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
});

it("arranca en 00% como capa decorativa", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  const { container } = render(<Preloader />);
  expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  expect(container.textContent).toBe("00%");
});

it("no vuelve a cubrir en la misma sesión", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  window.sessionStorage.setItem("sn-preloaded", "1");
  const { container } = render(<Preloader />);
  expect(container).toBeEmptyDOMElement();
});

it("con movimiento reducido no cubre", () => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce") }));
  const { container } = render(<Preloader />);
  expect(container).toBeEmptyDOMElement();
});
