import { expect, test } from "@playwright/test";

test("la home pública responde", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "web", "Smoke exclusivo de Web");
  const response = await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Studio Nomade" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  await page.screenshot({ path: testInfo.outputPath("home-web.png"), fullPage: true });
});

test("los servicios conectan Branding y Architecture", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "web", "Navegación exclusiva de Web");
  await page.goto("/");

  await page.getByRole("link", { name: "Ver área BRANDING" }).click();
  await expect(page).toHaveURL(/\/areas\/branding$/);
  await expect(page.getByRole("heading", { level: 1, name: "BRANDING" })).toBeVisible();

  await page.getByRole("link", { name: /Architecture & Design/ }).click();
  await expect(page).toHaveURL(/\/areas\/architecture$/);
  await expect(page.getByRole("heading", { level: 1, name: "ARCHITECTURE" })).toBeVisible();
});
