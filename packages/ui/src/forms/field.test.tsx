import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Field } from "./field";
it("enlaza label, error y ayuda", () => {
  render(<Field label="Email" name="email" error="Error" hint="Ayuda" />);
  expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute(
    "aria-describedby",
    "f-email-error f-email-hint"
  );
});
