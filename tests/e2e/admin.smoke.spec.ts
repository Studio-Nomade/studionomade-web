import { expect, test } from "@playwright/test";

test("Admin deniega por defecto y conserva headers de seguridad", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "admin", "Smoke exclusivo de Admin");
  const response = await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { level: 1, name: "Studio Nomade" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response?.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  await page.screenshot({ path: testInfo.outputPath("home-admin.png"), fullPage: true });
});
