import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, Checkbox, Field, Select, TextArea } from "./index";

describe("componentes UI base", () => {
  it("renderiza Button como botón o enlace accesible", () => {
    render(
      <>
        <Button>Continuar</Button>
        <Button href="/destino" disabled>
          Destino
        </Button>
      </>
    );
    expect(screen.getByRole("button", { name: "Continuar" })).toHaveAttribute("type", "button");
    expect(screen.getByRole("link", { name: "Destino" })).not.toHaveAttribute("disabled");
  });

  it("entrega todas las claves del formulario nativo", () => {
    render(
      <form data-testid="form">
        <Field label="Nombre" name="name" defaultValue="Ada" />
        <Select
          label="Etapa"
          name="stage"
          options={[{ value: "idea", label: "Idea" }]}
          defaultValue="idea"
        />
        <TextArea label="Mensaje" name="message" defaultValue="Hola" />
        <Checkbox label="Acepto" name="consent" defaultChecked />
      </form>
    );
    const data = new FormData(screen.getByTestId("form") as HTMLFormElement);
    expect(Object.fromEntries(data)).toEqual({
      name: "Ada",
      stage: "idea",
      message: "Hola",
      consent: "on"
    });
  });

  it("encadena error y ayuda con aria-describedby", () => {
    render(<Field label="Email" name="email" error="Inválido" hint="Usa tu correo" />);
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute(
      "aria-describedby",
      "f-email-error f-email-hint"
    );
  });
});
