import { expect, test } from "@playwright/test";

test("la home administrativa responde", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "admin", "Smoke exclusivo de Admin");
  const response = await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Studio Nomade Admin" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  await page.screenshot({ path: testInfo.outputPath("home-admin.png"), fullPage: true });
});
