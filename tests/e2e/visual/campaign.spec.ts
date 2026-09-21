import { expect, test } from "@playwright/test";

const viewports = [360, 768, 1024, 1440];

test.describe("campaña inmobiliarias", () => {
  for (const width of viewports) {
    test(`viewport ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/campanas/inmobiliarias");
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`campaign-${width}.png`, { fullPage: true });
    });
  }
});
