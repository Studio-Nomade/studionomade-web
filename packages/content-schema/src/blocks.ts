import { z } from "zod";

import { hrefSchema, plainTextSchema, richTextSchema } from "./rich-text";

/**
 * Registro de tipos de bloque.
 *
 * `page_sections.section_type` es `text` libre y `content` es `jsonb` sin tipar:
 * la base no valida nada. Este registro es la única fuente de verdad sobre qué
 * bloques existen y qué forma tiene el contenido de cada uno.
 *
 * M06 arranca con el subconjunto esencial (Hero, Texto, Imagen, Galería, CTA,
 * FAQ, Cifras, Logos) y deja el registro **extensible**: añadir un tipo es añadir
 * una entrada aquí, sin tocar ni la base ni el DAL.
 */

const mediaRefSchema = z.object({
  mediaAssetId: z.string().uuid(),
  alt: z.string().trim().max(300).optional(),
  caption: z.string().trim().max(300).optional()
});

const ctaSchema = z.object({
  label: plainTextSchema.max(80),
  href: hrefSchema
});

// ------------------------------------------------------------------ esquemas

const heroSchema = z.object({
  eyebrow: plainTextSchema.max(120).optional(),
  title: plainTextSchema,
  lead: richTextSchema.optional(),
  media: mediaRefSchema.optional(),
  cta: ctaSchema.optional()
});

const textSchema = z.object({
  heading: plainTextSchema.optional(),
  body: richTextSchema
});

const imageSchema = z.object({
  // Opcional a propósito: un bloque recién insertado en el editor todavía no
  // tiene imagen. La exigencia de completitud se aplica al PUBLICAR, no al
  // guardar un borrador (ver `blockCompletenessIssues`).
  media: mediaRefSchema.optional(),
  ratio: z.enum(["wide", "editorial", "portrait", "square"]).default("editorial"),
  fullBleed: z.boolean().default(false)
});

const gallerySchema = z.object({
  heading: plainTextSchema.optional(),
  items: z.array(mediaRefSchema).max(24).default([])
});

const ctaBlockSchema = z.object({
  title: plainTextSchema,
  subtitle: plainTextSchema.optional(),
  primary: ctaSchema,
  secondary: ctaSchema.optional()
});

const faqSchema = z.object({
  heading: plainTextSchema.optional(),
  items: z
    .array(
      z.object({
        question: plainTextSchema.max(300),
        answer: richTextSchema
      })
    )
    .max(30)
    .default([])
});

const statsSchema = z.object({
  heading: plainTextSchema.optional(),
  items: z
    .array(
      z.object({
        // El design system escribe las cifras como "+100"; se guarda tal cual,
        // incluido el marcador "+XX" cuando el dato real aún no existe.
        value: z.string().trim().min(1).max(20),
        label: plainTextSchema.max(120)
      })
    )
    .max(8)
    .default([])
});

const logosSchema = z.object({
  heading: plainTextSchema.optional(),
  items: z
    .array(
      z.object({
        name: plainTextSchema.max(120),
        media: mediaRefSchema,
        href: hrefSchema.optional()
      })
    )
    .max(40)
    .default([])
});

// ------------------------------------------------------------------ registro

export const BLOCK_SCHEMAS = {
  hero: heroSchema,
  texto: textSchema,
  imagen: imageSchema,
  galeria: gallerySchema,
  cta: ctaBlockSchema,
  faq: faqSchema,
  cifras: statsSchema,
  logos: logosSchema
} as const;

export type BlockType = keyof typeof BLOCK_SCHEMAS;

export const BLOCK_TYPES = Object.keys(BLOCK_SCHEMAS) as readonly BlockType[];

/**
 * Tipos del inventario completo (`02_Base_Estructuracion §15`) que todavía NO
 * están implementados. Se declaran para que el editor pueda mostrarlos como
 * "próximamente" en vez de fingir que no existen.
 */
export const PLANNED_BLOCK_TYPES = [
  "video",
  "proyectos",
  "servicios",
  "areas",
  "proceso",
  "testimonios",
  "equipo",
  "vimeo",
  "behance",
  "social",
  "prototipo",
  "formulario",
  "timeline",
  "descarga",
  "relacionado"
] as const;

export function isBlockType(value: string): value is BlockType {
  return Object.prototype.hasOwnProperty.call(BLOCK_SCHEMAS, value);
}

export const blockLabels: Record<BlockType, string> = {
  hero: "Hero",
  texto: "Texto",
  imagen: "Imagen",
  galeria: "Galería",
  cta: "Llamada a la acción",
  faq: "Preguntas frecuentes",
  cifras: "Cifras",
  logos: "Logos"
};
