import { expect, test } from "@playwright/test";

/**
 * El desborde horizontal no es solo un problema de móvil.
 *
 * El titular de área es una sola palabra indivisible: si no cabe en su pista de
 * grid, empuja el resto fuera del viewport. Eso ocurrió entre 1024px y 1440px
 * con ARCHITECTURE —el nombre más largo—, un rango que la única medición a 360px
 * no cubría. Por eso se mide también en escritorio, y con la ruta de Architecture
 * incluida explícitamente.
 */
const rutas = ["/", "/areas/branding", "/areas/architecture", "/campanas/inmobiliarias"];
const anchos = [360, 768, 1024, 1280, 1440, 1920];

for (const ruta of rutas) {
  for (const ancho of anchos) {
    test(`${ruta} no desborda a ${ancho}px`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 900 });
      await page.goto(ruta);
      // Las imágenes siguen cargando después del primer paint y pueden ensanchar
      // el documento, así que se espera a que el ancho se estabilice.
      await expect
        .poll(async () =>
          page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
          )
        )
        .toBeLessThanOrEqual(0);
    });
  }
}
