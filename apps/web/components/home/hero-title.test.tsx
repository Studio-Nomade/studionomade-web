import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeroTitle, splitTitle } from "./hero-title";

describe("splitTitle", () => {
  it("parte por palabras y letras con un índice continuo para el escalonado", () => {
    const words = splitTitle("Reebok x Lollapalooza");
    expect(words.map((chars) => chars.map(({ char }) => char).join(""))).toEqual([
      "Reebok",
      "x",
      "Lollapalooza"
    ]);
    expect(words.flat().map(({ index }) => index)).toEqual(
      Array.from({ length: 19 }, (_, index) => index)
    );
  });
});

describe("HeroTitle", () => {
  it("expone el título íntegro y oculta la versión partida a lectores de pantalla", () => {
    const { container } = render(<HeroTitle title="CinnaLove" />);
    expect(screen.getByRole("heading", { level: 2, name: "CinnaLove" })).toBeInTheDocument();
    const hidden = container.querySelector('[aria-hidden="true"]');
    expect(hidden?.textContent).toBe("CinnaLove");
    expect(hidden?.querySelectorAll("[style]")).toHaveLength(9);
  });

  it("cada letra lleva su índice como propiedad personalizada", () => {
    const { container } = render(<HeroTitle title="Nexa" />);
    const steps = [...container.querySelectorAll<HTMLElement>('[style*="--sn-reveal-step"]')].map(
      (element) => element.style.getPropertyValue("--sn-reveal-step")
    );
    expect(steps).toEqual(["0", "1", "2", "3"]);
  });

  it("marca los títulos largos para reducir el cuerpo", () => {
    const { container } = render(<HeroTitle title="Reebok x Lollapalooza" />);
    expect(container.querySelector("h2")).toHaveAttribute("data-long");
    const short = render(<HeroTitle title="Equifax" />);
    expect(short.container.querySelector("h2")).not.toHaveAttribute("data-long");
  });
});
