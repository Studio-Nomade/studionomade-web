import { z } from "zod";

/**
 * Texto enriquecido **sin HTML**.
 *
 * El requisito de seguridad de M06 es "sin HTML/script arbitrario". En vez de
 * aceptar HTML y sanearlo —que obliga a mantener un sanitizador y a acertar
 * siempre— el contenido viaja como estructura: texto plano más marcas.
 *
 * Además encaja con el design system, cuyo copy usa negritas dentro del párrafo
 * de forma deliberada ("lee solo lo que está en negrita y el argumento se
 * entiende igual"), y con el contrato `{ text, mark }` que ya usan las landings.
 */

export const inlineMarkSchema = z.enum(["none", "strong", "emphasis"]);

export const textSegmentSchema = z.object({
  text: z.string().max(2000),
  mark: inlineMarkSchema.default("none")
});

/** Un párrafo es una secuencia de segmentos con su marca. */
export const paragraphSchema = z.array(textSegmentSchema).min(1).max(60);

export const richTextSchema = z.array(paragraphSchema).min(1).max(40);

export type InlineMark = z.infer<typeof inlineMarkSchema>;
export type TextSegment = z.infer<typeof textSegmentSchema>;
export type Paragraph = z.infer<typeof paragraphSchema>;
export type RichText = z.infer<typeof richTextSchema>;

/** Texto plano, para títulos y etiquetas donde no cabe ninguna marca. */
export const plainTextSchema = z.string().trim().min(1).max(300);

/**
 * Enlaces: solo rutas internas o http(s) absolutos.
 * Bloquea `javascript:`, `data:` y cualquier otro esquema.
 */
export const hrefSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine(
    (value) =>
      value.startsWith("/") ||
      value.startsWith("https://") ||
      value.startsWith("http://") ||
      value.startsWith("mailto:") ||
      value.startsWith("tel:"),
    { message: "Solo se admiten rutas internas, http(s), mailto o tel" }
  )
  .refine((value) => !value.startsWith("//"), {
    message: "No se admiten URLs protocol-relative"
  });

/** Extrae el texto plano de un rich text, para resúmenes y SEO. */
export function toPlainText(rich: RichText): string {
  return rich
    .map((paragraph) => paragraph.map((segment) => segment.text).join(""))
    .join("\n\n")
    .trim();
}
