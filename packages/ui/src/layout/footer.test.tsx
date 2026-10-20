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
  const links = screen.getAllByRole("link", { name: "Correo" });
  expect(links).toHaveLength(2);
  for (const link of links) expect(link).toHaveAttribute("href", "mailto:x@y.cl");
});
it("enmarca la firma entre dos reglas y fecha el legal con el año en curso", () => {
  const { container } = render(<Footer />);
  expect(screen.getByText("Nos movemos en manada")).toBeInTheDocument();
  expect(screen.getByText("Santiago | Madrid")).toBeInTheDocument();
  const tagline = screen.getByText("Nos movemos en manada").parentElement!;
  expect(tagline.previousElementSibling?.tagName).toBe("DIV");
  expect(tagline.nextElementSibling?.tagName).toBe("DIV");
  expect(
    screen.getByText(new RegExp(`© ${new Date().getFullYear()} Studio Nomade`))
  ).toBeInTheDocument();
  expect(container.querySelector("footer")).not.toHaveAttribute("data-reveal-fixed");
});
it("prefiere el slot de logo y activa el revelado fijo a pedido", () => {
  const { container } = render(<Footer logo={<b>logo</b>} logoSrc="/x.png" reveal />);
  expect(screen.getByText("logo")).toBeInTheDocument();
  expect(container.querySelector("img")).toBeNull();
  expect(container.querySelector("footer")).toHaveAttribute("data-reveal-fixed");
});
