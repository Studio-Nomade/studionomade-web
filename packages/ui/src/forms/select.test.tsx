import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Select } from "./select";
it("incluye placeholder deshabilitado", () => {
  render(<Select label="Etapa" name="stage" options={["Idea"]} />);
  expect(screen.getByRole("option", { name: "Selecciona una opción" })).toBeDisabled();
});
