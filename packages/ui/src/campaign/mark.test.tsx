import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Mark } from "./mark";
it("mantiene el contenido inline", () => {
  render(<Mark>Marca</Mark>);
  expect(screen.getByText("Marca").tagName).toBe("SPAN");
});
