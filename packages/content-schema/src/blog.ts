import { z } from "zod";

import { paragraphSchema, type Paragraph, type TextSegment } from "./rich-text";

/**
 * Cuerpo de las notas del blog: bloques estructurados, sin HTML (misma regla
 * que el resto del contenido). El editor del admin escribe un markdown mínimo
 * que se convierte a estos bloques en el servidor, y vuelve a markdown al editar.
 *
 * Markdown admitido (una línea en blanco separa bloques):
 * - `## Título` y `### Subtítulo`
 * - `- ítem` (lista) y `1. ítem` (lista numerada)
 * - `> cita`
 * - `![texto alternativo](https://… "pie de foto")`
 * - en el texto: `**negrita**` y `*cursiva*`
 */

const imageSrcSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine((value) => value.startsWith("/") || value.startsWith("https://"), {
    message: "La imagen debe ser una ruta interna o una URL https"
  });

export const blogBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), text: paragraphSchema }),
  z.object({
    type: z.literal("heading"),
    level: z.union([z.literal(2), z.literal(3)]),
    text: z.string().trim().min(1).max(200)
  }),
  z.object({
    type: z.literal("list"),
    ordered: z.boolean().default(false),
    items: z.array(paragraphSchema).min(1).max(40)
  }),
  z.object({ type: z.literal("quote"), text: paragraphSchema }),
  z.object({
    type: z.literal("image"),
    src: imageSrcSchema,
    alt: z.string().trim().min(1).max(300),
    caption: z.string().trim().max(300).optional()
  })
]);

export const blogBodySchema = z.array(blogBlockSchema).min(1).max(200);

export type BlogBlock = z.infer<typeof blogBlockSchema>;
export type BlogBody = z.infer<typeof blogBodySchema>;

/** `**negrita**` y `*cursiva*` → segmentos con marca. */
export function parseInline(text: string): Paragraph {
  const segments: TextSegment[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) segments.push({ text: text.slice(last, index), mark: "none" });
    const token = match[0];
    segments.push(
      token.startsWith("**")
        ? { text: token.slice(2, -2), mark: "strong" }
        : { text: token.slice(1, -1), mark: "emphasis" }
    );
    last = index + token.length;
  }
  if (last < text.length) segments.push({ text: text.slice(last), mark: "none" });
  return segments.length ? segments : [{ text, mark: "none" }];
}

export function serializeInline(paragraph: Paragraph): string {
  return paragraph
    .map(({ text, mark }) =>
      mark === "strong" ? `**${text}**` : mark === "emphasis" ? `*${text}*` : text
    )
    .join("");
}

const IMAGE = /^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]*)")?\)$/;

/** Markdown mínimo → bloques. Nunca lanza; lo que no reconoce es párrafo. */
export function markdownToBlogBody(markdown: string): BlogBody {
  const blocks: BlogBlock[] = [];
  const chunks = markdown
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((line) => line.trim());
    const first = lines[0];
    const image = first.match(IMAGE);

    if (lines.length === 1 && image) {
      blocks.push({
        type: "image",
        alt: image[1].trim() || "Imagen de la nota",
        src: image[2],
        ...(image[3] ? { caption: image[3] } : {})
      });
    } else if (/^###\s+/.test(first)) {
      blocks.push({ type: "heading", level: 3, text: first.replace(/^###\s+/, "") });
      if (lines.length > 1)
        blocks.push({ type: "paragraph", text: parseInline(lines.slice(1).join(" ")) });
    } else if (/^##\s+/.test(first)) {
      blocks.push({ type: "heading", level: 2, text: first.replace(/^##\s+/, "") });
      if (lines.length > 1)
        blocks.push({ type: "paragraph", text: parseInline(lines.slice(1).join(" ")) });
    } else if (lines.every((line) => /^[-*]\s+/.test(line))) {
      blocks.push({
        type: "list",
        ordered: false,
        items: lines.map((line) => parseInline(line.replace(/^[-*]\s+/, "")))
      });
    } else if (lines.every((line) => /^\d+[.)]\s+/.test(line))) {
      blocks.push({
        type: "list",
        ordered: true,
        items: lines.map((line) => parseInline(line.replace(/^\d+[.)]\s+/, "")))
      });
    } else if (lines.every((line) => line.startsWith(">"))) {
      blocks.push({
        type: "quote",
        text: parseInline(lines.map((line) => line.replace(/^>\s?/, "")).join(" "))
      });
    } else {
      blocks.push({ type: "paragraph", text: parseInline(lines.join(" ")) });
    }
  }
  return blocks;
}

/** Bloques → markdown (para editar una nota existente). */
export function blogBodyToMarkdown(body: BlogBody): string {
  return body
    .map((block) => {
      switch (block.type) {
        case "heading":
          return `${block.level === 2 ? "##" : "###"} ${block.text}`;
        case "list":
          return block.items
            .map(
              (item, index) => `${block.ordered ? `${index + 1}.` : "-"} ${serializeInline(item)}`
            )
            .join("\n");
        case "quote":
          return `> ${serializeInline(block.text)}`;
        case "image":
          return `![${block.alt}](${block.src}${block.caption ? ` "${block.caption}"` : ""})`;
        default:
          return serializeInline(block.text);
      }
    })
    .join("\n\n");
}

/** Texto plano del cuerpo: extractos automáticos, tiempo de lectura y SEO. */
export function blogBodyToPlainText(body: BlogBody): string {
  return body
    .map((block) => {
      switch (block.type) {
        case "heading":
          return block.text;
        case "list":
          return block.items.map((item) => item.map((s) => s.text).join("")).join(". ");
        case "image":
          return block.caption ?? "";
        default:
          return block.text.map((s) => s.text).join("");
      }
    })
    .filter(Boolean)
    .join("\n");
}

/** Minutos de lectura (≈200 palabras por minuto, mínimo 1). */
export function readingMinutes(body: BlogBody): number {
  const words = blogBodyToPlainText(body).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
