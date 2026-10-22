import { describe, expect, it } from "vitest";

import { LEAD_NEEDS, LEAD_BUDGET_RANGES, LEAD_TIMELINES, LEAD_SOURCE_CHANNELS } from "./leads";
import {
  blogPostInputSchema,
  LEAD_LABELS,
  leadTriageSchema,
  parseLeadFilters,
  slugify
} from "./admin";

const ID = "6f1c2b9e-4b7a-4c1e-9a33-0b8d5f2e7c11";

describe("parseLeadFilters", () => {
  it("acepta filtros válidos y descarta los inválidos sin lanzar", () => {
    expect(parseLeadFilters({ estado: "nuevo", area: "branding", pagina: "2" })).toMatchObject({
      estado: "nuevo",
      area: "branding",
      pagina: 2
    });
    const filters = parseLeadFilters({ estado: "inexistente", q: "  Nexa " });
    expect(filters.estado).toBeUndefined();
    expect(filters).toMatchObject({ q: "Nexa", pagina: 1 });
  });
});

describe("leadTriageSchema", () => {
  it("normaliza vacíos a null", () => {
    expect(
      leadTriageSchema.parse({ lead_id: ID, status: "revisado", priority: "", assigned_area: "" })
    ).toMatchObject({ priority: null, assigned_area: null, notes: null });
  });

  it("exige motivo al descartar y no permite derivar a mano", () => {
    expect(leadTriageSchema.safeParse({ lead_id: ID, status: "descartado" }).success).toBe(false);
    expect(
      leadTriageSchema.safeParse({ lead_id: ID, status: "descartado", discard_reason: "Spam" })
        .success
    ).toBe(true);
    expect(leadTriageSchema.safeParse({ lead_id: ID, status: "derivado" }).success).toBe(false);
  });
});

describe("blogPostInputSchema", () => {
  it("valida una nota y separa las etiquetas", () => {
    const value = blogPostInputSchema.parse({
      title: "Hola",
      slug: "hola-mundo",
      markdown: "Texto",
      category: "Estudio",
      tags: "Branding, Web , ",
      cover_url: "",
      area: "web-design"
    });
    expect(value).toMatchObject({ tags: ["Branding", "Web"], cover_url: null, intent: "guardar" });
  });

  it("rechaza slugs y portadas inválidos", () => {
    const base = { title: "x", markdown: "y", category: "Estudio" };
    expect(blogPostInputSchema.safeParse({ ...base, slug: "Hola Mundo" }).success).toBe(false);
    expect(
      blogPostInputSchema.safeParse({ ...base, slug: "ok", cover_url: "javascript:alert(1)" })
        .success
    ).toBe(false);
  });
});

describe("slugify", () => {
  it("quita tildes, ñ y símbolos", () => {
    expect(slugify("Guía: Diseño de Marca en España!")).toBe("guia-diseno-de-marca-en-espana");
  });
});

describe("LEAD_LABELS", () => {
  it("cubre todas las opciones del formulario de contacto", () => {
    for (const need of LEAD_NEEDS) expect(LEAD_LABELS.need[need]).toBeTruthy();
    for (const budget of LEAD_BUDGET_RANGES) expect(LEAD_LABELS.budget[budget]).toBeTruthy();
    for (const timeline of LEAD_TIMELINES) expect(LEAD_LABELS.timeline[timeline]).toBeTruthy();
    for (const source of LEAD_SOURCE_CHANNELS) expect(LEAD_LABELS.source[source]).toBeTruthy();
  });
});
