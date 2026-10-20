import { render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { HorizontalScroll } from "./horizontal-scroll";

const loadMotion = vi.fn();
vi.mock("./runtime", async (original) => ({
  ...(await original<typeof import("./runtime")>()),
  loadMotion: () => loadMotion()
}));

beforeEach(() => {
  loadMotion.mockReset();
  loadMotion.mockReturnValue(new Promise(() => {}));
});

function media(matches: boolean) {
  vi.stubGlobal("matchMedia", () => ({
    matches,
    addEventListener() {},
    removeEventListener() {}
  }));
}

it("sin pin es un carril nativo enfocable con un panel por hijo", () => {
  media(false);
  const { container } = render(
    <HorizontalScroll label="Galería">
      <img alt="a" src="/a.webp" />
      <img alt="b" src="/b.webp" />
    </HorizontalScroll>
  );
  expect(screen.getByRole("region", { name: "Galería" })).not.toHaveAttribute("data-pinned");
  expect(container.querySelectorAll("[data-panel]")).toHaveLength(2);
  expect(container.querySelector("[tabindex='0']")).toBeInTheDocument();
  expect(loadMotion).not.toHaveBeenCalled();
});

it("pinnea solo cuando el ancho y la preferencia de movimiento lo permiten", () => {
  media(true);
  render(
    <HorizontalScroll label="Galería">
      <p>panel</p>
    </HorizontalScroll>
  );
  expect(screen.getByRole("region", { name: "Galería" })).toHaveAttribute("data-pinned");
  expect(loadMotion).toHaveBeenCalled();
});
