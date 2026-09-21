import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Checkbox } from "./checkbox";
it("incluye name y requisito", () => {
  render(<Checkbox label="Acepto" name="consent" required />);
  expect(screen.getByRole("checkbox", { name: "Acepto" })).toBeRequired();
});
