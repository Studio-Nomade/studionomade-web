import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Parallax } from "./parallax";

it("declara factor y escala, y deja el contenido quieto sin JS", () => {
  const { container } = render(
    <Parallax y={0.05} scaleFrom={1.2} clip>
      <p>flota</p>
    </Parallax>
  );
  const root = container.firstElementChild!;
  expect(root).toHaveAttribute("data-motion", "parallax");
  expect(root).toHaveAttribute("data-parallax-y", "0.05");
  expect(root).toHaveAttribute("data-parallax-scale-from", "1.2");
  expect(root).toHaveAttribute("data-clip");
  expect(root).not.toHaveAttribute("data-reveal");
  expect(screen.getByText("flota").closest("[data-parallax-inner]")).toBeInTheDocument();
  expect(container.querySelector("[style]")).toBeNull();
});
