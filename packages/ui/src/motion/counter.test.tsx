import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Counter } from "./counter";
import { formatCounter } from "./presets";

describe("Counter", () => {
  it("renderiza el valor final: es lo que se ve sin JS y con movimiento reducido", () => {
    render(<Counter to={50} prefix="+" />);
    const counter = screen.getByText("+50");
    expect(counter).toHaveAttribute("data-motion", "counter");
    expect(counter).toHaveAttribute("data-to", "50");
    expect(counter).toHaveAttribute("data-prefix", "+");
    expect(counter).not.toHaveAttribute("data-reveal");
  });

  it("aplica ceros a la izquierda, decimales y sufijo", () => {
    render(<Counter to={4} pad={2} suffix=" años" />);
    expect(screen.getByText("04 años")).toBeInTheDocument();
  });
});

describe("formatCounter", () => {
  it("formatea durante la cuenta", () => {
    expect(formatCounter(0, { pad: 2, prefix: "+" })).toBe("+00");
    expect(formatCounter(7.26, { decimals: 1, suffix: "%" })).toBe("7.3%");
    expect(formatCounter(-3, { pad: 2 })).toBe("-03");
  });
});
