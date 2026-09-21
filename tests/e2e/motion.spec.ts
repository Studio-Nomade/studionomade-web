import { expect, test } from "@playwright/test";

/**
 * Los tres estados del sistema de revelado. El tercero es el que evita el fallo
 * catastrófico: contenido oculto de forma permanente.
 *
 * El contador va inline en cada `evaluate` a propósito: pasar un helper por
 * referencia depende de cómo se serialice la función y da falsos positivos.
 */

const CONTAR_OCULTOS = `
  [...document.querySelectorAll("[data-reveal]")].filter((element) => {
    const inner = element.querySelector("span > span");
    const style = getComputedStyle(inner ?? element);
    const desplazado =
      style.transform !== "none" && style.transform !== "matrix(1, 0, 0, 1, 0, 0)";
    return desplazado || style.opacity === "0";
  }).length
`;

test.describe("revelado al scroll", () => {
  test("ESTADO 1 — normal: nada marcado como revelado queda invisible", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    expect(await page.locator("[data-reveal]").count()).toBeGreaterThan(0);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);

    const contradiccion = await page.evaluate(`
      [...document.querySelectorAll("[data-reveal][data-revealed]")].filter((element) => {
        const inner = element.querySelector("span > span");
        const style = getComputedStyle(inner ?? element);
        const desplazado =
          style.transform !== "none" && style.transform !== "matrix(1, 0, 0, 1, 0, 0)";
        return desplazado || style.opacity === "0";
      }).length
    `);

    expect(contradiccion, "un elemento marcado como revelado sigue invisible").toBe(0);
  });

  test("ESTADO 1 — un salto de scroll no deja contenido atrás oculto", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    // Salto de un solo frame: IntersectionObserver no cruza ningún umbral.
    await page.evaluate(() => window.scrollTo(0, 3000));
    await page.waitForTimeout(1500);

    const atrasYOcultos = await page.evaluate(`
      [...document.querySelectorAll("[data-reveal]")].filter((element) => {
        if (element.getBoundingClientRect().bottom >= 0) return false;
        const inner = element.querySelector("span > span");
        const style = getComputedStyle(inner ?? element);
        const desplazado =
          style.transform !== "none" && style.transform !== "matrix(1, 0, 0, 1, 0, 0)";
        return desplazado || style.opacity === "0";
      }).length
    `);

    expect(atrasYOcultos, "contenido por encima del viewport quedó oculto").toBe(0);
  });
});

test.describe("revelado — movimiento reducido", () => {
  test("ESTADO 2 — todo visible desde el principio, sin animación", async ({ page }) => {
    // `emulateMedia` en vez de `test.use({ reducedMotion })`: lo segundo no llegó
    // a aplicarse y el test pasaba por el camino equivocado.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForTimeout(600);

    expect(
      await page.evaluate(`matchMedia("(prefers-reduced-motion: reduce)").matches`),
      "la emulación de movimiento reducido no se aplicó"
    ).toBe(true);

    expect(
      await page.evaluate(CONTAR_OCULTOS),
      "con movimiento reducido no debe ocultarse nada"
    ).toBe(0);
  });
});

test.describe("revelado — sin JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("ESTADO 3 — el contenido se ve entero", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(600);

    // Sin JS, `@media (scripting: enabled)` no aplica y nada llega a armarse.
    expect(await page.evaluate(CONTAR_OCULTOS), "sin JavaScript no debe ocultarse nada").toBe(0);

    // Y el contenido sigue siendo legible de verdad.
    await expect(page.getByRole("heading", { name: "SERVICIOS" })).toBeVisible();
  });
});
