import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { StrokeNumber } from "./stroke-number";

it("dibuja el número en SVG decorativo y lo expone como texto", () => {
  const { container } = render(<StrokeNumber value="03" delay={0.2} />);
  const root = container.firstElementChild!;
  expect(root).toHaveAttribute("data-motion", "stroke");
  expect(root).toHaveAttribute("data-motion-delay", "0.2");
  expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  expect(container.querySelector("text")).toHaveTextContent("03");
  expect(screen.getAllByText("03")).toHaveLength(2);
});
