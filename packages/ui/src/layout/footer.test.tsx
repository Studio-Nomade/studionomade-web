import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Footer } from "./footer";
it("renderiza columnas y redes accesibles", () => {
  render(
    <Footer
      columns={[{ title: "Contacto", items: [{ label: "Correo", href: "mailto:x@y.cl" }] }]}
      social={[{ kind: "email", href: "mailto:x@y.cl" }]}
    />
  );
  expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "email" })).toBeInTheDocument();
});
