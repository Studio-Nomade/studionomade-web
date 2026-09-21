import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { CampaignDisplay } from "./campaign-display";
it("usa el nivel semántico solicitado", () => {
  render(<CampaignDisplay level={3}>Título</CampaignDisplay>);
  expect(screen.getByRole("heading", { level: 3 })).toHaveAttribute("data-level", "3");
});
