import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SplitText } from "./split-text";

describe("SplitText", () => {
  it("parte palabras en el servidor sin perder el texto", () => {
    const { container } = render(
      <SplitText as="h2" by="words">
        Nos movemos en manada
      </SplitText>
    );
    expect(container.querySelectorAll("[data-split-inner]")).toHaveLength(4);
    expect(container.firstElementChild).toHaveAttribute("data-motion", "words");
    expect(screen.getByRole("heading", { name: "Nos movemos en manada" })).toBeInTheDocument();
    expect(container.textContent).toBe("Nos movemos en manada");
  });

  it("parte letras y expone una sola copia legible", () => {
    const { container } = render(
      <SplitText as="h2" by="chars">
        HOLA MUNDO
      </SplitText>
    );
    expect(container.querySelectorAll("[data-split-inner]")).toHaveLength(9);
    expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "HOLA MUNDO" })).toBeInTheDocument();
  });

  it("deja el corte de líneas libres al navegador", () => {
    const { container } = render(<SplitText as="p">Un texto que se corta donde caiga</SplitText>);
    expect(container.firstElementChild).toHaveAttribute("data-motion", "lines-auto");
    expect(container.querySelectorAll("[data-split-inner]")).toHaveLength(0);
    expect(container.textContent).toBe("Un texto que se corta donde caiga");
  });

  it("sin JS el texto se ve: no hay estilos en línea", () => {
    const { container } = render(<SplitText by="words">visible siempre</SplitText>);
    expect(container.querySelector("[style]")).toBeNull();
  });
});
