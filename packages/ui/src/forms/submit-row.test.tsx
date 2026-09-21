import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { SubmitRow } from "./submit-row";
it("renderiza un submit dentro del formulario", () => {
  render(
    <form>
      <SubmitRow label="Enviar" note="Nota" />
    </form>
  );
  expect(screen.getByRole("button", { name: "Enviar" })).toHaveAttribute("type", "submit");
});
