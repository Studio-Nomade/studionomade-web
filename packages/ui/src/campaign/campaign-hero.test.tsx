import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { CampaignHero } from "./campaign-hero";
it("renderiza el titular y sus slots", () => {
  render(<CampaignHero highlight="INMO" title="BILIARIAS" art={<span data-testid="art" />} />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("INMOBILIARIAS");
  expect(screen.getByTestId("art")).toBeInTheDocument();
});
