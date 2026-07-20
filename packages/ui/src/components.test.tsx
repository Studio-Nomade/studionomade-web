import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, Container, Link } from "./index";

describe("componentes UI base", () => {
  it("renderiza controles con semántica accesible", () => {
    render(
      <Container aria-label="contenido">
        <Button>Continuar</Button>
        <Link href="/destino">Destino</Link>
      </Container>
    );

    expect(screen.getByRole("button", { name: "Continuar" })).toHaveAttribute("type", "button");
    expect(screen.getByRole("link", { name: "Destino" })).toHaveAttribute("href", "/destino");
    expect(screen.getByLabelText("contenido")).toHaveClass("sn-container");
  });
});
