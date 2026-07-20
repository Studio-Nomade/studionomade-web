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
