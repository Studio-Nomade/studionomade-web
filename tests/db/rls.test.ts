import { execFileSync } from "node:child_process";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

interface LocalStatus {
  API_URL: string;
  PUBLISHABLE_KEY: string;
  SECRET_KEY: string;
}

let status: LocalStatus;
const privateObjects = [
  { bucket: "private-documents", path: `${crypto.randomUUID()}.pdf` },
  { bucket: "temporary-uploads", path: `${crypto.randomUUID()}.pdf` }
];

function request(path: string, init: RequestInit = {}, serviceRole = false) {
  const key = serviceRole ? status.SECRET_KEY : status.PUBLISHABLE_KEY;
  return fetch(`${status.API_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      "Content-Type": "application/json",
      ...init.headers
    }
  });
}

function listBucket(bucket: string) {
  return fetch(`${status.API_URL}/storage/v1/object/list/${bucket}`, {
    method: "POST",
    headers: { apikey: status.PUBLISHABLE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ prefix: "", limit: 1 })
  });
}

beforeAll(async () => {
  status = JSON.parse(
    execFileSync("pnpm", ["exec", "supabase", "status", "-o", "json"], { encoding: "utf8" })
  );

  for (const object of privateObjects) {
    const response = await fetch(
      `${status.API_URL}/storage/v1/object/${object.bucket}/${object.path}`,
      {
        method: "POST",
        headers: {
          apikey: status.SECRET_KEY,
          "Content-Type": "application/pdf",
          "x-upsert": "true"
        },
        body: "%PDF-1.4 local RLS fixture"
      }
    );
    expect(response.ok).toBe(true);
  }
});

afterAll(async () => {
  for (const object of privateObjects) {
    await fetch(`${status.API_URL}/storage/v1/object/${object.bucket}/${object.path}`, {
      method: "DELETE",
      headers: { apikey: status.SECRET_KEY }
    });
  }
});

describe("RLS para el rol anónimo", () => {
  it("lee contenido publicado y no expone borradores", async () => {
    const response = await request("pages?select=slug,status&order=slug");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ slug: "inicio", status: "publicado" }]);
  });

  it("rechaza escrituras anónimas", async () => {
    const response = await request("pages", {
      method: "POST",
      body: JSON.stringify({ slug: "intruso", title: "Intruso", status: "borrador" })
    });
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it("no permite acceso anónimo a buckets privados", async () => {
    for (const bucket of ["private-documents", "temporary-uploads"]) {
      const response = await listBucket(bucket);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual([]);
    }
  });

  it("no permite insertar envíos ni leads", async () => {
    const formResponse = await request("forms?slug=eq.contacto-general&select=id");
    const [{ id: formId }] = (await formResponse.json()) as Array<{ id: string }>;

    const submission = await request("form_submissions", {
      method: "POST",
      body: JSON.stringify({ form_id: formId, payload: {} })
    });
    const lead = await request("leads", {
      method: "POST",
      body: JSON.stringify({ name: "Intruso" })
    });

    expect(submission.status).toBeGreaterThanOrEqual(400);
    expect(lead.status).toBeGreaterThanOrEqual(400);
  });

  it("no permite ejecutar capture_lead", async () => {
    const response = await request("rpc/capture_lead", {
      method: "POST",
      body: JSON.stringify({ p: { form_slug: "contacto-general" } })
    });
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});

describe("captura atómica con service_role", () => {
  it("crea submission, lead y evento con consentimiento y UTM", async () => {
    const email = `db-${crypto.randomUUID()}@example.com`;
    const response = await request(
      "rpc/capture_lead",
      {
        method: "POST",
        body: JSON.stringify({
          p: {
            form_slug: "campana-inmobiliarias",
            payload: { name: "Lead DB", email },
            source_path: "/inmobiliarias",
            ip_hash: "hash-no-reversible",
            user_agent: "vitest",
            name: "Lead DB",
            email,
            company: "Ejemplo SpA",
            message: "Necesito una propuesta",
            consent_given: true,
            consent_at: "2026-09-20T12:00:00.000Z",
            consent_purpose: "contacto-comercial",
            consent_version: "2026-09",
            utm_source: "linkedin",
            utm_medium: "paid-social",
            utm_campaign: "inmobiliarias",
            utm_term: "branding",
            utm_content: "video-a",
            landing_path: "/inmobiliarias",
            origin_type: "campana",
            origin_slug: "inmobiliarias"
          }
        })
      },
      true
    );
    expect(response.status).toBe(200);
    const leadId = (await response.json()) as string;

    const leadResponse = await request(
      `leads?id=eq.${leadId}&select=id,submission_id,consent_given,consent_at,consent_version,utm_source,utm_medium,utm_campaign,utm_term,utm_content`,
      {},
      true
    );
    const [lead] = (await leadResponse.json()) as Array<{
      id: string;
      submission_id: string;
      consent_given: boolean;
      consent_at: string;
      consent_version: string;
      utm_source: string;
      utm_medium: string;
      utm_campaign: string;
      utm_term: string;
      utm_content: string;
    }>;
    expect(lead).toMatchObject({
      id: leadId,
      consent_given: true,
      consent_version: "2026-09",
      utm_source: "linkedin",
      utm_medium: "paid-social",
      utm_campaign: "inmobiliarias",
      utm_term: "branding",
      utm_content: "video-a"
    });
    expect(lead.consent_at).toBeTruthy();

    const [submissionResponse, eventResponse] = await Promise.all([
      request(`form_submissions?id=eq.${lead.submission_id}&select=id,submitter_ip_hash`, {}, true),
      request(`lead_events?lead_id=eq.${leadId}&select=event_type`, {}, true)
    ]);
    expect(await submissionResponse.json()).toEqual([
      { id: lead.submission_id, submitter_ip_hash: "hash-no-reversible" }
    ]);
    expect(await eventResponse.json()).toEqual([{ event_type: "creado" }]);

    await request(`leads?id=eq.${leadId}`, { method: "DELETE" }, true);
    await request(`form_submissions?id=eq.${lead.submission_id}`, { method: "DELETE" }, true);
  });
});

describe("constraints y relaciones", () => {
  it("rechaza estados fuera del enum", async () => {
    const response = await request(
      "pages",
      {
        method: "POST",
        body: JSON.stringify({ slug: "estado-invalido", title: "Inválido", status: "desconocido" })
      },
      true
    );
    expect(response.status).toBe(400);
  });

  it("protege slugs únicos y claves foráneas", async () => {
    const duplicate = await request(
      "pages",
      {
        method: "POST",
        body: JSON.stringify({ slug: "inicio", title: "Duplicada", status: "borrador" })
      },
      true
    );
    expect(duplicate.status).toBe(409);

    const foreignKey = await request(
      "page_sections",
      {
        method: "POST",
        body: JSON.stringify({
          page_id: "00000000-0000-0000-0000-000000000000",
          section_type: "hero"
        })
      },
      true
    );
    expect(foreignKey.status).toBe(409);
  });
});
