import { expect, test } from "@playwright/test";

test("public milestone routes render and expose hardened headers", async ({ page }) => {
  for (const path of [
    "/proyectos",
    "/proyectos/cinnalove",
    "/studio",
    "/contacto",
    "/lab",
    "/lab/kinetic-type",
    "/privacidad",
    "/terminos"
  ]) {
    const response = await page.goto(path);
    expect(response?.ok(), path).toBe(true);
    expect(response?.headers()["content-security-policy"], path).toContain(
      "frame-ancestors 'none'"
    );
    expect(response?.headers()["permissions-policy"], path).toContain("camera=()");
  }
});

test("lab filters, demo and prototype-origin form are connected", async ({ page }) => {
  await page.goto("/lab?maturity=prototipo");
  await expect(page.getByRole("heading", { name: "Kinetic Type" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Chromatic Grid" })).toHaveCount(0);
  await page.getByRole("link", { name: "Ver experimento" }).first().click();
  await expect(page.locator('input[name="origin_type"]')).toHaveValue("prototipo");
  await expect(page.locator('input[name="source_path"]')).toHaveValue("/lab/kinetic-type");
  await expect(page.getByRole("link", { name: "Abrir prototipo aislado" })).toHaveAttribute(
    "href",
    /prototipos\.studionomade\.cl\/kinetic-type/
  );
});
