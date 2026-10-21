import { describe, expect, it } from "vitest";

import {
  blogBodySchema,
  blogBodyToMarkdown,
  blogBodyToPlainText,
  markdownToBlogBody,
  parseInline,
  readingMinutes
} from "./blog";

const SAMPLE = `## Por qué un sitio web

Un sitio **efectivo** convierte visitas en *conversaciones*.

- Objetivo claro
- Contenido útil

1. Investigar
2. Diseñar

> La forma sigue a la función.

![Equipo en un taller](https://assets.studionomade.cl/blog/taller.jpg "Taller de descubrimiento")

### Cierre
Texto final.`;

describe("markdownToBlogBody", () => {
  it("reconoce títulos, listas, citas, imágenes y marcas", () => {
    const body = markdownToBlogBody(SAMPLE);
    expect(body.map((block) => block.type)).toEqual([
      "heading",
      "paragraph",
      "list",
      "list",
      "quote",
      "image",
      "heading",
      "paragraph"
    ]);
    expect(blogBodySchema.safeParse(body).success).toBe(true);
    expect(body[1]).toEqual({
      type: "paragraph",
      text: [
        { text: "Un sitio ", mark: "none" },
        { text: "efectivo", mark: "strong" },
        { text: " convierte visitas en ", mark: "none" },
        { text: "conversaciones", mark: "emphasis" },
        { text: ".", mark: "none" }
      ]
    });
    expect(body[5]).toMatchObject({ type: "image", caption: "Taller de descubrimiento" });
  });

  it("vuelve a markdown sin perder estructura", () => {
    const body = markdownToBlogBody(SAMPLE);
    expect(markdownToBlogBody(blogBodyToMarkdown(body))).toEqual(body);
  });

  it("no acepta imágenes con esquemas peligrosos", () => {
    const body = markdownToBlogBody("![x](javascript:alert(1))");
    expect(blogBodySchema.safeParse(body).success).toBe(false);
  });

  it("calcula texto plano y minutos de lectura", () => {
    const body = markdownToBlogBody(SAMPLE);
    expect(blogBodyToPlainText(body)).toContain("Por qué un sitio web");
    expect(readingMinutes(body)).toBe(1);
  });

  it("deja el texto sin marcas como un solo segmento", () => {
    expect(parseInline("hola")).toEqual([{ text: "hola", mark: "none" }]);
  });
});
