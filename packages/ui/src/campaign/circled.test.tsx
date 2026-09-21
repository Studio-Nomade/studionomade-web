import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Circled } from "./circled";
it("mantiene el contenido inline", () => {
  render(<Circled>Idea</Circled>);
  expect(screen.getByText("Idea").tagName).toBe("SPAN");
});
