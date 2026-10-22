import { describe, expect, it } from "vitest";

import {
  BLOCK_TYPES,
  assertBlockContent,
  emptyBlockContent,
  blockCompletenessIssues,
  isBlockType,
  pageCompletenessIssues,
  parseBlock,
  toPlainText
} from "./index";

describe("registro de bloques", () => {
  it("expone el subconjunto esencial de M06", () => {
    expect([...BLOCK_TYPES].sort()).toEqual(
      ["cta", "cifras", "faq", "galeria", "hero", "imagen", "logos", "texto"].sort()
    );
  });

  it("reconoce solo los tipos registrados", () => {
    expect(isBlockType("hero")).toBe(true);
    expect(isBlockType("video")).toBe(false);
    expect(isBlockType("__proto__")).toBe(false);
  });

  it("el contenido inicial de cada tipo es válido contra su propio esquema", () => {
    for (const type of BLOCK_TYPES) {
      const result = parseBlock(type, emptyBlockContent(type));
      expect(result.ok, `${type}: ${result.ok ? "" : result.error}`).toBe(true);
    }
  });
});

describe("parseBlock", () => {
  it("no lanza ante un tipo desconocido: devuelve el error", () => {
    const result = parseBlock("timeline", {});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("desconocido");
  });

  it("no lanza ante contenido corrupto", () => {
    const result = parseBlock("hero", { title: "" });
    expect(result.ok).toBe(false);
  });

  it("devuelve el contenido tipado y discriminado", () => {
    const result = parseBlock("hero", { title: "Branding" });
    expect(result.ok).toBe(true);
    if (result.ok && result.block.type === "hero") {
      expect(result.block.content.title).toBe("Branding");
    }
  });
});

describe("seguridad del contenido", () => {
  it("rechaza hrefs con esquemas peligrosos", () => {
    for (const href of ["javascript:alert(1)", "data:text/html,<script>", "//evil.com"]) {
      const result = parseBlock("cta", {
        title: "X",
        primary: { label: "Ir", href }
      });
      expect(result.ok, `debería rechazar ${href}`).toBe(false);
    }
  });

  it("acepta rutas internas y http(s)", () => {
    for (const href of ["/contacto", "https://studionomade.cl", "mailto:a@b.cl"]) {
      const result = parseBlock("cta", { title: "X", primary: { label: "Ir", href } });
      expect(result.ok, `debería aceptar ${href}`).toBe(true);
    }
  });

  it("el rich text no admite HTML: es estructura, no marcado", () => {
    const result = parseBlock("texto", {
      body: [[{ text: "<script>alert(1)</script>", mark: "none" }]]
    });
    // El texto se guarda literal y se escapará al renderizar; nunca se interpreta.
    expect(result.ok).toBe(true);
    if (result.ok && result.block.type === "texto") {
      expect(result.block.content.body[0][0].text).toBe("<script>alert(1)</script>");
    }
  });

  it("rechaza marcas inline fuera del vocabulario", () => {
    const result = parseBlock("texto", { body: [[{ text: "x", mark: "script" }]] });
    expect(result.ok).toBe(false);
  });
});

describe("assertBlockContent", () => {
  it("sí lanza al escribir, a diferencia de parseBlock", () => {
    expect(() => assertBlockContent("hero", { title: "" })).toThrow();
    expect(() => assertBlockContent("hero", { title: "Ok" })).not.toThrow();
  });
});

describe("toPlainText", () => {
  it("aplana párrafos y segmentos conservando el orden", () => {
    expect(
      toPlainText([
        [
          { text: "Combinamos ", mark: "none" },
          { text: "estrategia", mark: "strong" }
        ],
        [{ text: "Segundo párrafo.", mark: "none" }]
      ])
    ).toBe("Combinamos estrategia\n\nSegundo párrafo.");
  });
});

describe("completitud al publicar", () => {
  it("un bloque de imagen sin imagen es guardable pero no publicable", () => {
    const parsed = parseBlock("imagen", emptyBlockContent("imagen"));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(blockCompletenessIssues(parsed.block)).toHaveLength(1);
  });

  it("con imagen asignada sí es publicable", () => {
    const parsed = parseBlock("imagen", {
      media: { mediaAssetId: "11111111-1111-1111-1111-111111111111" }
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(blockCompletenessIssues(parsed.block)).toHaveLength(0);
  });

  it("las colecciones vacías bloquean la publicación", () => {
    for (const type of ["galeria", "logos", "faq", "cifras"] as const) {
      const parsed = parseBlock(type, {});
      expect(parsed.ok, type).toBe(true);
      if (!parsed.ok) continue;
      expect(blockCompletenessIssues(parsed.block).length, type).toBeGreaterThan(0);
    }
  });

  it("un bloque oculto no impide publicar la página", () => {
    const issues = pageCompletenessIssues([
      { sectionType: "imagen", content: {}, isHidden: true },
      { sectionType: "hero", content: { title: "Ok" }, isHidden: false }
    ]);
    expect(issues).toHaveLength(0);
  });

  it("señala el bloque concreto que falla, por posición", () => {
    const issues = pageCompletenessIssues([
      { sectionType: "hero", content: { title: "Ok" }, isHidden: false },
      { sectionType: "galeria", content: {}, isHidden: false }
    ]);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain("Bloque 2");
  });

  it("un tipo desconocido guardado en base se reporta, no revienta", () => {
    const issues = pageCompletenessIssues([
      { sectionType: "timeline", content: {}, isHidden: false }
    ]);
    expect(issues[0]).toContain("desconocido");
  });
});
