import { expect, test } from "@playwright/test";

const viewports = [360, 768, 1024, 1440];

test.describe("páginas de área", () => {
  test.skip(true, "D7 crea Branding, Architecture y sus baselines Ubuntu.");
  for (const area of ["branding", "architecture"]) {
    for (const width of viewports) {
      test(`${area} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/areas/${area}`);
        await expect(page).toHaveScreenshot(`${area}-${width}.png`, { fullPage: true });
      });
    }
  }
});
