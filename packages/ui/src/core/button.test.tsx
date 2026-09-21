import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Button } from "./button";
it("expone semántica de botón y enlace", () => {
  render(
    <>
      <Button>Acción</Button>
      <Button href="/x" disabled>
        Enlace
      </Button>
    </>
  );
  expect(screen.getByRole("button")).toBeEnabled();
  expect(screen.getByRole("link")).not.toHaveAttribute("disabled");
});
