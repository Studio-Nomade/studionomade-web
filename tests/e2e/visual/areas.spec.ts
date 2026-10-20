import { existsSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

/**
 * Regresión visual de Branding y Architecture (Figma "SERVICIOS").
 *
 * Las baselines se generan en Ubuntu (fuentes y antialiasing de CI) con el
 * workflow `ci.yml` → `workflow_dispatch` con `update_visual_snapshots: true`,
 * que publica el artefacto `visual-baselines-linux`. Copiar sus PNG a
 * `tests/e2e/visual/areas.spec.ts-snapshots/` y commitearlos: desde ese momento
 * el test corre solo. Sin baselines se salta, para no fallar en máquinas locales.
 *
 * Proyecto `visual`: movimiento reducido (nada pre-oculto) y DPR 1.
 */
const baselines = path.join(import.meta.dirname, "areas.spec.ts-snapshots");
const viewports = [390, 768, 1024, 1440];

test.describe("páginas de área", () => {
  test.skip(
    !existsSync(baselines) && !process.argv.includes("--update-snapshots"),
    "Sin baselines Ubuntu: generarlas con el workflow visual-baselines."
  );
  for (const area of ["branding", "architecture"]) {
    for (const width of viewports) {
      test(`${area} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/areas/${area}`);
        await page.evaluate(() => document.fonts.ready);
        await expect(page).toHaveScreenshot(`${area}-${width}.png`, {
          fullPage: true,
          animations: "disabled"
        });
      });
    }
  }
});
