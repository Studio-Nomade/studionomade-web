import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { MenuToggle } from "./menu-toggle";
it("es un botón accesible", () => {
  render(<MenuToggle />);
  expect(screen.getByRole("button", { name: "Menú" })).toHaveAttribute("type", "button");
});
