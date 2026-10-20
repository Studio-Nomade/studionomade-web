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

  // El área no repite la navegación: se pasa a la otra por el menú del sitio.
  await page.getByRole("button", { name: "Menú" }).click();
  await page.getByRole("dialog").getByRole("link", { name: "Architecture" }).click();
  await expect(page).toHaveURL(/\/areas\/architecture$/);
  await expect(page.getByRole("heading", { level: 1, name: "Architecture" })).toBeVisible();
});

test("las áreas llevan el formulario de contacto en la misma página", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "web", "Exclusivo de Web");
  await page.goto("/areas/branding");
  await page.getByRole("link", { name: /Contáctanos/ }).click();
  await expect(page).toHaveURL(/#contacto$/);
  const form = page.locator("#contacto form");
  await expect(form.locator('input[name="origin_type"]')).toHaveValue("area");
  await expect(form.locator('input[name="origin_slug"]')).toHaveValue("branding");
  await expect(form.getByRole("link", { name: "política de privacidad" })).toHaveAttribute(
    "href",
    "/privacidad"
  );
});
