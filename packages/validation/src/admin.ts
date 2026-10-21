import { z } from "zod";

import { LEAD_AREAS, LEAD_BUDGET_RANGES } from "./leads";

/**
 * Validaciones del admin: clasificación de leads, filtros de la bandeja y
 * notas del blog. Todo llega por FormData desde Server Actions o por query
 * string, así que los campos vacíos se normalizan a `undefined`/`null`.
 */

export const LEAD_STATUSES = [
  "nuevo",
  "revisado",
  "contactado",
  "calificado",
  "derivado",
  "descartado",
  "spam"
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_PRIORITIES = ["alta", "media", "baja"] as const;
export type LeadPriority = (typeof LEAD_PRIORITIES)[number];

export const LEAD_ORIGINS = [
  "campana",
  "area",
  "contacto",
  "prototipo",
  "importacion",
  "referido"
] as const;

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(emptyToUndefined, z.enum(values).optional());

export const leadFiltersSchema = z.object({
  estado: optionalEnum(LEAD_STATUSES),
  origen: optionalEnum(LEAD_ORIGINS),
  area: optionalEnum(LEAD_AREAS),
  presupuesto: optionalEnum(LEAD_BUDGET_RANGES),
  prioridad: optionalEnum(LEAD_PRIORITIES),
  q: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
  pagina: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(500).default(1))
});
export type LeadFilters = z.infer<typeof leadFiltersSchema>;

/** Query string → filtros válidos. Nunca lanza: lo inválido se ignora. */
export function parseLeadFilters(input: Record<string, string | string[] | undefined>) {
  const flat = Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );
  const parsed = leadFiltersSchema.safeParse(flat);
  if (parsed.success) return parsed.data;
  // Descarta solo los campos inválidos.
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    const single = leadFiltersSchema.shape[key as keyof typeof leadFiltersSchema.shape];
    if (single && single.safeParse(value).success) clean[key] = value;
  }
  return leadFiltersSchema.parse(clean);
}

const nullableEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(emptyToUndefined, z.enum(values).nullable().default(null));

export const leadTriageSchema = z
  .object({
    lead_id: z.string().uuid(),
    status: z.enum(LEAD_STATUSES),
    priority: nullableEnum(LEAD_PRIORITIES),
    assigned_area: nullableEnum(LEAD_AREAS),
    notes: z.preprocess(emptyToUndefined, z.string().trim().max(4000).nullable().default(null)),
    discard_reason: z.preprocess(
      emptyToUndefined,
      z.string().trim().max(300).nullable().default(null)
    )
  })
  .superRefine((value, context) => {
    if (value.status === "descartado" && !value.discard_reason) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discard_reason"],
        message: "Indica el motivo del descarte"
      });
    }
    if (value.status === "derivado") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["status"],
        message: "Usa «Derivar a NOMA» para marcar un lead como derivado"
      });
    }
  });
export type LeadTriage = z.infer<typeof leadTriageSchema>;

export const BLOG_INTENTS = ["guardar", "publicar", "despublicar", "archivar"] as const;

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Escribe un slug")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones");

export const blogPostInputSchema = z.object({
  id: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  intent: z.enum(BLOG_INTENTS).default("guardar"),
  title: z.string().trim().min(1, "Escribe un título").max(200),
  slug: slugSchema,
  excerpt: z.preprocess(emptyToUndefined, z.string().trim().max(400).nullable().default(null)),
  markdown: z.string().trim().min(1, "Escribe el cuerpo de la nota").max(60000),
  cover_url: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .max(2048)
      .refine((value) => value.startsWith("/") || value.startsWith("https://"), {
        message: "La portada debe ser una ruta interna o una URL https"
      })
      .nullable()
      .default(null)
  ),
  cover_alt: z.preprocess(emptyToUndefined, z.string().trim().max(300).nullable().default(null)),
  category: z.string().trim().min(1, "Elige una categoría").max(60),
  tags: z.preprocess(
    (value) =>
      typeof value === "string"
        ? value
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : value,
    z.array(z.string().max(40)).max(12).default([])
  ),
  area: nullableEnum(LEAD_AREAS),
  author_name: z.preprocess(emptyToUndefined, z.string().trim().max(120).nullable().default(null)),
  published_at: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), "Fecha inválida")
      .nullable()
      .default(null)
  )
});
export type BlogPostInput = z.infer<typeof blogPostInputSchema>;

/** Título → slug: minúsculas, sin tildes ni ñ, palabras con guiones. */
export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
}

/** Etiquetas legibles para el admin. */
export const LEAD_LABELS = {
  status: {
    nuevo: "Nuevo",
    revisado: "Revisado",
    contactado: "Contactado",
    calificado: "Calificado",
    derivado: "Derivado a NOMA",
    descartado: "Descartado",
    spam: "Spam"
  } satisfies Record<LeadStatus, string>,
  priority: { alta: "Alta", media: "Media", baja: "Baja" } satisfies Record<LeadPriority, string>,
  origin: {
    campana: "Campaña",
    area: "Página de área",
    contacto: "Contacto",
    prototipo: "Prototipo",
    importacion: "Importación",
    referido: "Referido"
  } satisfies Record<(typeof LEAD_ORIGINS)[number], string>,
  area: {
    branding: "Branding & Design",
    architecture: "Architecture & Design",
    audiovisual: "Audiovisual & Animation",
    "web-design": "Web Design"
  },
  need: {
    imagen_marca: "Imagen de marca",
    redes_sociales: "Redes sociales",
    produccion_audiovisual: "Producción audiovisual",
    estrategia_comunicacional: "Estrategia comunicacional",
    diseno_web: "Diseño web",
    interiores_stands: "Diseño de interiores / stands",
    asesoria_comunicacional: "Asesoría comunicacional",
    otro: "Otro"
  } as Record<string, string>,
  budget: {
    menos_1m: "Menos de $1.000.000",
    "1m_3m": "$1M – $3M",
    "3m_8m": "$3M – $8M",
    "8m_20m": "$8M – $20M",
    mas_20m: "Más de $20M",
    sin_definir: "Aún no lo sabe"
  } as Record<string, string>,
  timeline: {
    lo_antes_posible: "Lo antes posible",
    "1_3_meses": "1–3 meses",
    "3_6_meses": "3–6 meses",
    sin_fecha: "Sin fecha definida"
  } as Record<string, string>,
  source: {
    recomendacion: "Recomendación",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    behance: "Behance",
    google: "Google",
    otro: "Otro"
  } as Record<string, string>
} as const;
