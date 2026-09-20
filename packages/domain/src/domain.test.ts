import { describe, expect, it } from "vitest";

import { resolveIndexing } from "./indexing";
import { createLogger } from "./logging";
import { canTransition, requiresPublishPermission, resolveStatusChange } from "./publishing";
import { ensureUniqueSlug, generateSlug, isValidSlug } from "./slug";

describe("generateSlug", () => {
  it("normaliza acentos y la ñ del español", () => {
    expect(generateSlug("Diseño de Marca")).toBe("diseno-de-marca");
    expect(generateSlug("Arquitectura & Diseño")).toBe("arquitectura-diseno");
    expect(generateSlug("Cómo lo hacemos")).toBe("como-lo-hacemos");
    expect(generateSlug("ÁÉÍÓÚ üÜ")).toBe("aeiou-uu");
  });

  it("colapsa separadores y recorta los extremos", () => {
    expect(generateSlug("  ---Hola   Mundo---  ")).toBe("hola-mundo");
    expect(generateSlug("a/b\\c_d.e")).toBe("a-b-c-d-e");
  });

  it("nunca deja un guion final tras truncar", () => {
    const slug = generateSlug("x".repeat(80) + " " + "y".repeat(40));
    expect(slug.length).toBeLessThanOrEqual(96);
    expect(slug.endsWith("-")).toBe(false);
  });

  it("produce slugs válidos o cadena vacía", () => {
    expect(isValidSlug(generateSlug("Proyecto 2025"))).toBe(true);
    expect(generateSlug("¿?¡!")).toBe("");
  });
});

describe("ensureUniqueSlug", () => {
  it("devuelve el slug base si está libre", async () => {
    const slug = await ensureUniqueSlug("Mi Página", async () => false);
    expect(slug).toBe("mi-pagina");
  });

  it("añade un sufijo hasta encontrar hueco", async () => {
    const tomados = new Set(["mi-pagina", "mi-pagina-2"]);
    const slug = await ensureUniqueSlug("Mi Página", async (c) => tomados.has(c));
    expect(slug).toBe("mi-pagina-3");
  });

  it("usa un fallback cuando el título no deja nada utilizable", async () => {
    const slug = await ensureUniqueSlug("¿?", async () => false);
    expect(slug).toBe("sin-titulo");
  });

  it("se rinde en vez de iterar sin fin", async () => {
    await expect(ensureUniqueSlug("colisión", async () => true, 3)).rejects.toThrow(/único/);
  });
});

describe("máquina de estados", () => {
  it("permite las transiciones editoriales razonables", () => {
    expect(canTransition("borrador", "revision")).toBe(true);
    expect(canTransition("revision", "publicado")).toBe(true);
    expect(canTransition("publicado", "archivado")).toBe(true);
    expect(canTransition("archivado", "borrador")).toBe(true);
    expect(canTransition("publicado", "publicado")).toBe(true);
  });

  it("bloquea saltos sin sentido", () => {
    expect(canTransition("archivado", "publicado")).toBe(false);
    expect(canTransition("publicado", "revision")).toBe(false);
  });

  it("marca qué transiciones exigen permiso de publicación", () => {
    expect(requiresPublishPermission("publicado")).toBe(true);
    expect(requiresPublishPermission("borrador")).toBe(false);
    expect(requiresPublishPermission("archivado")).toBe(false);
  });

  it("fija published_at al publicar por primera vez", () => {
    const now = () => new Date("2026-09-20T12:00:00.000Z");
    expect(resolveStatusChange("publicado", null, now)).toEqual({
      status: "publicado",
      publishedAt: "2026-09-20T12:00:00.000Z"
    });
  });

  it("conserva el published_at original al republicar y al despublicar", () => {
    const original = "2026-01-01T00:00:00.000Z";
    expect(resolveStatusChange("publicado", original).publishedAt).toBe(original);
    expect(resolveStatusChange("borrador", original).publishedAt).toBe(original);
  });
});

describe("resolveIndexing", () => {
  it("solo indexa en producción", () => {
    expect(resolveIndexing({ environment: "local", status: "publicado" }).index).toBe(false);
    expect(resolveIndexing({ environment: "preview", status: "publicado" }).index).toBe(false);
    expect(resolveIndexing({ environment: "production", status: "publicado" }).index).toBe(true);
  });

  it("no indexa contenido sin publicar", () => {
    expect(resolveIndexing({ environment: "production", status: "borrador" }).index).toBe(false);
    expect(resolveIndexing({ environment: "production", status: "revision" }).index).toBe(false);
  });

  it("respeta el noindex explícito pero sigue permitiendo follow", () => {
    const decision = resolveIndexing({
      environment: "production",
      status: "publicado",
      noindexOverride: true
    });
    expect(decision.index).toBe(false);
    expect(decision.follow).toBe(true);
  });
});

describe("logger estructurado", () => {
  it("emite JSON de una línea con la correlación", () => {
    const lines: string[] = [];
    const logger = createLogger({ requestId: "req-1", route: "/api/paginas" }, (l) => lines.push(l));

    logger.info("page.listed", { total: 3 });

    const entry = JSON.parse(lines[0]);
    expect(entry).toMatchObject({
      level: "info",
      event: "page.listed",
      requestId: "req-1",
      route: "/api/paginas",
      total: 3
    });
    expect(lines[0]).not.toContain("\n");
  });

  it("nunca registra PII aunque se la pasen", () => {
    const lines: string[] = [];
    const logger = createLogger({ requestId: "req-2" }, (l) => lines.push(l));

    logger.warn("auth.rejected", {
      email: "sebastian@studionomade.cl",
      ip: "1.2.3.4",
      userId: "uuid-opaco"
    });

    const entry = JSON.parse(lines[0]);
    expect(lines[0]).not.toContain("studionomade.cl");
    expect(lines[0]).not.toContain("1.2.3.4");
    expect(entry.email).toBeUndefined();
    expect(entry.email_omitido).toBe(true);
    expect(entry.userId).toBe("uuid-opaco");
  });

  it("propaga el contexto a los loggers hijos", () => {
    const lines: string[] = [];
    const logger = createLogger({ requestId: "req-3" }, (l) => lines.push(l));
    logger.child({ userId: "u-1" }).info("algo");
    expect(JSON.parse(lines[0])).toMatchObject({ requestId: "req-3", userId: "u-1" });
  });
});
