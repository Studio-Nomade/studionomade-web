import { expect, test } from "@playwright/test";

const viewports = [360, 768, 1024, 1440];

test.describe("campaña inmobiliarias", () => {
  test.skip(true, "D6 crea la ruta y las baselines Ubuntu.");
  for (const width of viewports) {
    test(`viewport ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/inmobiliarias");
      await expect(page).toHaveScreenshot(`campaign-${width}.png`, { fullPage: true });
    });
  }
});
