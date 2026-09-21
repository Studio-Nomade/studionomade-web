import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Eyebrow } from "./eyebrow";
it("acepta etiqueta semántica e inversión", () => {
  render(
    <Eyebrow as="h2" invert>
      Contexto
    </Eyebrow>
  );
  expect(screen.getByRole("heading")).toHaveAttribute("data-invert", "true");
});
