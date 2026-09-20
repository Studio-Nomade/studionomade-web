import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Section } from "./section";
it("aplica tono y acento", () => {
  render(
    <Section tone="band" accent="inmobiliarias">
      Contenido
    </Section>
  );
  const section = screen.getByText("Contenido").closest("section");
  expect(section).toHaveAttribute("data-tone", "band");
  expect(section).toHaveAttribute("data-accent", "inmobiliarias");
});
