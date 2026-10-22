import type { ContentStatus } from "@studionomade/database";

/**
 * Decide si una URL puede ser indexada por buscadores.
 *
 * Regla dura del proyecto: **solo producción indexa**. Preview y local siempre
 * van con `noindex`, para no competir con el sitio real ni filtrar borradores.
 */

export type AppEnvironment = "local" | "preview" | "production";

export interface IndexingInput {
  readonly environment: AppEnvironment;
  readonly status?: ContentStatus;
  /** Marca explícita de la ficha, cuando el CMS la ofrezca. */
  readonly noindexOverride?: boolean;
}

export interface IndexingDecision {
  readonly index: boolean;
  readonly follow: boolean;
  readonly reason: string;
}

export function resolveIndexing(input: IndexingInput): IndexingDecision {
  if (input.environment !== "production") {
    return { index: false, follow: false, reason: "entorno no productivo" };
  }

  if (input.noindexOverride) {
    return { index: false, follow: true, reason: "noindex explícito del contenido" };
  }

  if (input.status && input.status !== "publicado") {
    return { index: false, follow: false, reason: `estado ${input.status}` };
  }

  return { index: true, follow: true, reason: "contenido publicado en producción" };
}
