import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { StepFlow } from "./step-flow";
it("enumera pasos y pie", () => {
  render(<StepFlow steps={["Uno", "Dos"]} footline={["Inicio", "Fin"]} />);
  expect(screen.getByText("01")).toBeInTheDocument();
  expect(screen.getByText("Fin")).toBeInTheDocument();
});
