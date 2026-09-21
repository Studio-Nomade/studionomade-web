import { expect, test } from "@playwright/test";

test.describe("galería de componentes", () => {
  test.skip(true, "D8 publica /lab/ds y genera una baseline por componente.");
  test("índice", async ({ page }) => {
    await page.goto("/lab/ds");
    await expect(page).toHaveScreenshot("gallery-index.png", { fullPage: true });
  });
});
