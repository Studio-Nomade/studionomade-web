import { z } from "zod";

import { BLOCK_SCHEMAS, type BlockType, isBlockType } from "./blocks";

export {
  BLOCK_SCHEMAS,
  BLOCK_TYPES,
  PLANNED_BLOCK_TYPES,
  blockLabels,
  isBlockType,
  type BlockType
} from "./blocks";

export {
  hrefSchema,
  inlineMarkSchema,
  paragraphSchema,
  plainTextSchema,
  richTextSchema,
  textSegmentSchema,
  toPlainText,
  type InlineMark,
  type Paragraph,
  type RichText,
  type TextSegment
} from "./rich-text";

/** Contenido ya validado de un bloque, discriminado por su tipo. */
export type BlockContent = {
  [K in BlockType]: { type: K; content: z.infer<(typeof BLOCK_SCHEMAS)[K]> };
}[BlockType];

export type ParseBlockResult =
  | { readonly ok: true; readonly block: BlockContent }
  | { readonly ok: false; readonly error: string };

/**
 * Valida el par (`section_type`, `content`) que viene de la base.
 *
 * Nunca lanza: una fila corrupta o de un tipo retirado no debe tumbar la página
 * entera. Quien llama decide si la omite o muestra un aviso.
 */
export function parseBlock(sectionType: string, content: unknown): ParseBlockResult {
  if (!isBlockType(sectionType)) {
    return { ok: false, error: `Tipo de bloque desconocido: ${sectionType}` };
  }

  const parsed = BLOCK_SCHEMAS[sectionType].safeParse(content ?? {});
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: `Contenido inválido en el bloque ${sectionType}: ${issue?.path.join(".") || "raíz"} ${issue?.message ?? ""}`.trim()
    };
  }

  return { ok: true, block: { type: sectionType, content: parsed.data } as BlockContent };
}

/**
 * Valida antes de escribir. A diferencia de `parseBlock`, aquí **sí** conviene
 * fallar: no se guarda un bloque que no cumple su esquema.
 */
export function assertBlockContent(sectionType: string, content: unknown): BlockContent {
  const result = parseBlock(sectionType, content);
  if (!result.ok) throw new Error(result.error);
  return result.block;
}

/** Contenido inicial válido para un bloque recién creado desde el editor. */
export function emptyBlockContent(type: BlockType): unknown {
  switch (type) {
    case "hero":
      return { title: "Nuevo hero" };
    case "texto":
      return { body: [[{ text: "Escribe aquí.", mark: "none" }]] };
    case "cta":
      return { title: "Conversemos", primary: { label: "Contáctanos", href: "/contacto" } };
    case "faq":
      return {
        items: [{ question: "¿Pregunta?", answer: [[{ text: "Respuesta.", mark: "none" }]] }]
      };
    case "cifras":
      // "+XX" es el marcador que usa el design system cuando el dato real aún no
      // está confirmado: se mantiene visible en vez de inventar una cifra.
      return { items: [{ value: "+XX", label: "Descripción" }] };
    default:
      return {};
  }
}

/**
 * Validación de **completitud**, exigida solo al publicar.
 *
 * Los esquemas de `BLOCK_SCHEMAS` son deliberadamente permisivos: un bloque
 * recién insertado en el editor está incompleto por definición y aun así debe
 * poder guardarse como borrador. Lo que no puede salir al público es un bloque
 * a medias, y eso se comprueba aquí.
 *
 * Devuelve la lista de problemas; vacía significa "publicable".
 */
export function blockCompletenessIssues(block: BlockContent): readonly string[] {
  const issues: string[] = [];

  switch (block.type) {
    case "imagen":
      if (!block.content.media) issues.push("El bloque de imagen no tiene imagen asignada.");
      break;
    case "galeria":
      if (block.content.items.length === 0) issues.push("La galería no tiene imágenes.");
      break;
    case "logos":
      if (block.content.items.length === 0) issues.push("El bloque de logos está vacío.");
      break;
    case "faq":
      if (block.content.items.length === 0) issues.push("El bloque de preguntas está vacío.");
      break;
    case "cifras":
      if (block.content.items.length === 0) issues.push("El bloque de cifras está vacío.");
      break;
    default:
      break;
  }

  return issues;
}

/** ¿Todas las secciones de una página pueden publicarse? */
export function pageCompletenessIssues(
  sections: readonly { sectionType: string; content: unknown; isHidden: boolean }[]
): readonly string[] {
  const issues: string[] = [];

  for (const [index, section] of sections.entries()) {
    // Un bloque oculto no llega al público: no bloquea la publicación.
    if (section.isHidden) continue;

    const parsed = parseBlock(section.sectionType, section.content);
    if (!parsed.ok) {
      issues.push(`Bloque ${index + 1}: ${parsed.error}`);
      continue;
    }
    issues.push(...blockCompletenessIssues(parsed.block).map((i) => `Bloque ${index + 1}: ${i}`));
  }

  return issues;
}

export { campaignContentSchema } from "./campaign";
export type { CampaignContent } from "./campaign";
