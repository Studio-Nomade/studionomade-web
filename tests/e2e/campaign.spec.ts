import { expect, test, type Page } from "@playwright/test";

const email = (label: string) => `d6-${label}-${Date.now()}@example.com`;
const campaignUrl =
  "/campanas/inmobiliarias?utm_source=google&utm_medium=cpc&utm_campaign=lanzamiento&utm_term=departamentos&utm_content=hero";

async function complete(page: Page, address: string) {
  await page.getByLabel("Nombre").fill("Prueba D6");
  await page.getByRole("textbox", { name: "Email *", exact: true }).fill(address);
  await page.getByLabel("Etapa del proyecto *", { exact: true }).selectOption("En desarrollo");
  await page.getByRole("textbox", { name: "Proyecto *", exact: true }).fill("Proyecto auditado");
  await page.getByLabel("Cuéntanos brevemente").fill("Validación integral de campaña.");
  await page.getByRole("checkbox").check();
}

async function findLead(address: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase local environment is required");
  const response = await fetch(
    `${url}/rest/v1/leads?email=eq.${encodeURIComponent(address)}&select=*`,
    {
      headers: { apikey: key, authorization: `Bearer ${key}` }
    }
  );
  expect(response.ok).toBeTruthy();
  return (await response.json()) as Array<Record<string, unknown>>;
}

test.describe.configure({ mode: "serial" });

test("envío con JavaScript persiste UTM y consentimiento", async ({ page }) => {
  const address = email("js");
  await page.goto(campaignUrl);
  await complete(page, address);
  await page.waitForTimeout(2600);
  await page.getByRole("button", { name: "Quiero conversar sobre mi proyecto" }).click();
  await expect(page.getByText("Gracias. Te contactaremos")).toBeVisible();
  const [lead] = await findLead(address);
  expect(lead).toMatchObject({
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "lanzamiento",
    utm_term: "departamentos",
    utm_content: "hero",
    consent_given: true,
    consent_version: "2026-09-v1",
    origin_type: "campana"
  });
  expect(lead.consent_at).toBeTruthy();
});

test("envío sin JavaScript también persiste", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const address = email("no-js");
  await page.goto(campaignUrl);
  await complete(page, address);
  await page.waitForTimeout(2600);
  await page.getByRole("button", { name: "Quiero conversar sobre mi proyecto" }).click();
  await expect(page.getByText("Gracias. Te contactaremos")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("envio-sin-js.png"), fullPage: true });
  expect(await findLead(address)).toHaveLength(1);
  await context.close();
});

test("honeypot responde éxito sin escritura", async ({ page }) => {
  const address = email("honeypot");
  await page.goto(campaignUrl);
  await complete(page, address);
  await page.locator('[name="empresa_web"]').fill("robot", { force: true });
  await page.getByRole("button", { name: "Quiero conversar sobre mi proyecto" }).click();
  await expect(page.getByText("Gracias. Te contactaremos")).toBeVisible();
  expect(await findLead(address)).toHaveLength(0);
});

test("sin consentimiento queda bloqueado", async ({ page }) => {
  const address = email("consent");
  await page.goto(campaignUrl);
  await complete(page, address);
  await page.getByRole("checkbox").uncheck();
  await page.waitForTimeout(2600);
  await page.getByRole("button", { name: "Quiero conversar sobre mi proyecto" }).click();
  await expect(page.getByText("Debes aceptar el consentimiento")).toBeVisible();
  expect(await findLead(address)).toHaveLength(0);
});
