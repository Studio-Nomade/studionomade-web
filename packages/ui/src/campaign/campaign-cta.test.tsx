import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { CampaignCTA } from "./campaign-cta";
it("expone la llamada como enlace", () => {
  render(<CampaignCTA title="Conversemos" label="Ir" href="#form" />);
  expect(screen.getByRole("link", { name: "Ir" })).toHaveAttribute("href", "#form");
});
