import { expect, test, type Page } from "@playwright/test";

const email = (label: string) => `d6-${label}-${Date.now()}@example.com`;
const campaignUrl =
  "/campanas/inmobiliarias?utm_source=google&utm_medium=cpc&utm_campaign=lanzamiento&utm_term=departamentos&utm_content=hero&gclid=e2e-gclid_123&fbclid=e2e-fbclid_456";

async function complete(page: Page, address: string) {
  await page.getByLabel("Nombre").fill("Prueba D6");
  await page.getByRole("textbox", { name: "Email *", exact: true }).fill(address);
  await page.getByLabel("Etapa del proyecto *", { exact: true }).selectOption("En desarrollo");
  await page.getByRole("textbox", { name: "Proyecto *", exact: true }).fill("Proyecto auditado");
  await page.getByRole("textbox", { name: "Teléfono", exact: true }).fill("+56 9 1234 5678");
  await page.getByLabel("Cuéntanos brevemente").fill("Validación integral de campaña.");
  await page.getByRole("checkbox").check();
}

const submit = (page: Page) =>
  page.getByRole("button", { name: "Quiero conversar sobre mi proyecto" }).click();

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

test("envío con JavaScript persiste UTM, click IDs, etapa y consentimiento", async ({ page }) => {
  const address = email("js");
  await page.goto(campaignUrl);
  await complete(page, address);
  await page.waitForTimeout(2600);
  await submit(page);
  await expect(page.getByText("Gracias. Te contactaremos")).toBeVisible();
  const [lead] = await findLead(address);
  expect(lead).toMatchObject({
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "lanzamiento",
    utm_term: "departamentos",
    utm_content: "hero",
    gclid: "e2e-gclid_123",
    fbclid: "e2e-fbclid_456",
    project_stage: "en_desarrollo",
    company: "Proyecto auditado",
    phone: "+56912345678",
    message: "Validación integral de campaña.",
    consent_given: true,
    consent_version: "2026-10-v1",
    origin_type: "campana"
  });
  expect(lead.consent_at).toBeTruthy();
  expect(String(lead.landing_url)).toContain("/campanas/inmobiliarias?");
  expect(String(lead.landing_url)).toContain("gclid=e2e-gclid_123");
  // Sin píxel en el entorno de prueba no hay cookie _fbc: se deriva de fbclid.
  expect(String(lead.fbc)).toMatch(/^fb\.1\.\d{13}\.e2e-fbclid_456$/);
});

test("el consentimiento visible enlaza a la política de privacidad", async ({ page }) => {
  await page.goto(campaignUrl);
  const link = page.getByRole("link", { name: "política de privacidad" });
  await expect(link).toHaveAttribute("href", "/privacidad");
  await expect(page.getByText("Autorizo a Studio Nomade SpA a tratar mis datos")).toBeVisible();
});

test("errores en español, accesibles y sin perder lo escrito", async ({ page }) => {
  await page.goto(campaignUrl);
  await page.waitForTimeout(2600);
  await page.getByRole("textbox", { name: "Teléfono", exact: true }).fill("123");
  await page.getByLabel("Cuéntanos brevemente").fill("Texto que no debe perderse.");
  await submit(page);
  await expect(page.getByText("Revisa los campos indicados.")).toBeVisible();
  for (const [label, message] of [
    ["Nombre *", "Ingresa tu nombre (mínimo 2 caracteres)."],
    ["Email *", "Ingresa tu email."],
    ["Proyecto *", "Ingresa el nombre del proyecto."]
  ] as const) {
    const input = page.getByRole("textbox", { name: label, exact: true });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription(message);
  }
  const stage = page.getByLabel("Etapa del proyecto *", { exact: true });
  await expect(stage).toHaveAttribute("aria-invalid", "true");
  await expect(stage).toHaveAccessibleDescription("Selecciona la etapa del proyecto.");
  await expect(page.getByText(/^Ingresa un teléfono chileno válido/)).toBeVisible();
  await expect(page.getByLabel("Cuéntanos brevemente")).toHaveValue("Texto que no debe perderse.");
});

test("envío sin JavaScript también persiste", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const address = email("no-js");
  await page.goto(campaignUrl);
  await complete(page, address);
  await page.waitForTimeout(2600);
  await submit(page);
  await expect(page.getByText("Gracias. Te contactaremos")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("envio-sin-js.png"), fullPage: true });
  const [lead] = await findLead(address);
  // Sin JavaScript la atribución sale de lo que vio el servidor al renderizar.
  expect(lead).toMatchObject({
    gclid: "e2e-gclid_123",
    fbclid: "e2e-fbclid_456",
    project_stage: "en_desarrollo"
  });
  expect(String(lead.landing_url)).toContain("/campanas/inmobiliarias?");
  await context.close();
});

test("honeypot responde éxito sin escritura", async ({ page }) => {
  const address = email("honeypot");
  await page.goto(campaignUrl);
  await complete(page, address);
  await page.locator('[name="empresa_web"]').fill("robot", { force: true });
  await submit(page);
  await expect(page.getByText("Gracias. Te contactaremos")).toBeVisible();
  expect(await findLead(address)).toHaveLength(0);
});

test("sin consentimiento queda bloqueado", async ({ page }) => {
  const address = email("consent");
  await page.goto(campaignUrl);
  await complete(page, address);
  await page.getByRole("checkbox").uncheck();
  await page.waitForTimeout(2600);
  await submit(page);
  await expect(page.getByText("Debes aceptar el consentimiento")).toBeVisible();
  expect(await findLead(address)).toHaveLength(0);
});
