import { render } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Cursor } from "./cursor";

vi.mock("./runtime", async (original) => ({
  ...(await original<typeof import("./runtime")>()),
  loadMotion: () => new Promise(() => {})
}));

function media(fine: boolean, reduce = false) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("reduce") ? reduce : fine
  }));
}

it("no se monta en táctil", () => {
  media(false);
  const { container } = render(<Cursor />);
  expect(container).toBeEmptyDOMElement();
});

it("no se monta con movimiento reducido", () => {
  media(true, true);
  const { container } = render(<Cursor />);
  expect(container).toBeEmptyDOMElement();
});

it("con puntero fino es una capa decorativa", () => {
  media(true);
  const { container } = render(<Cursor />);
  expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  expect(container.firstElementChild).toHaveAttribute("data-state", "idle");
});
