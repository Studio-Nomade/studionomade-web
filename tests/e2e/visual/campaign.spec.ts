import { expect, test } from "@playwright/test";

const viewports = [360, 768, 1024, 1440];

// Las 4 baselines quedaron invalidadas por el bloque E1 (tipografía nueva,
// retirada de font-stretch, formularios con caja y revelado al scroll). Se
// regeneran de una sola vez en H4, en Ubuntu, con el workflow `visual-baselines`
// (workflow_dispatch). Desmarcar SOLO cuando lleguen las PNG nuevas.
test.skip(true, "E1/H4 regenera las baselines de campaña en Ubuntu.");

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
