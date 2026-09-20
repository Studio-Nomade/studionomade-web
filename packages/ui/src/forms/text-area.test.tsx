import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { TextArea } from "./text-area";
it("incluye name y descripción accesible", () => {
  render(<TextArea label="Mensaje" name="message" hint="Breve" />);
  expect(screen.getByRole("textbox", { name: "Mensaje" })).toHaveAttribute("name", "message");
});
