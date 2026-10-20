import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { MenuToggle } from "./menu-toggle";
it("es un botón accesible", () => {
  render(<MenuToggle />);
  expect(screen.getByRole("button", { name: "Menú" })).toHaveAttribute("type", "button");
});
it("expone el estado del menú que controla", () => {
  render(<MenuToggle expanded aria-controls="menu" />);
  const button = screen.getByRole("button", { name: "Menú" });
  expect(button).toHaveAttribute("aria-expanded", "true");
  expect(button).toHaveAttribute("data-expanded");
});
it("no declara aria-expanded si no controla nada", () => {
  render(<MenuToggle />);
  expect(screen.getByRole("button")).not.toHaveAttribute("aria-expanded");
});
