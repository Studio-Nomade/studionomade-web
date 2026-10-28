import type { ContentStatus } from "@studionomade/database";

/**
 * Máquina de estados editorial.
 *
 * La base de datos ya garantiza el invariante duro (`publicado` exige
 * `published_at`). Aquí se define qué transiciones tienen sentido y qué permiso
 * exige cada una, para poder rechazarlas antes de tocar la base.
 */

export const CONTENT_STATUSES = ["borrador", "revision", "publicado", "archivado"] as const;

const ALLOWED_TRANSITIONS: Record<ContentStatus, readonly ContentStatus[]> = {
  borrador: ["revision", "publicado", "archivado"],
  revision: ["borrador", "publicado", "archivado"],
  publicado: ["borrador", "archivado"],
  archivado: ["borrador"]
};

/** Transiciones que ponen o quitan contenido de cara al público. */
const REQUIRES_PUBLISH_PERMISSION: readonly ContentStatus[] = ["publicado"];

export function canTransition(from: ContentStatus, to: ContentStatus): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function requiresPublishPermission(to: ContentStatus): boolean {
  return REQUIRES_PUBLISH_PERMISSION.includes(to);
}

export interface StatusChange {
  readonly status: ContentStatus;
  readonly publishedAt: string | null;
}

/**
 * Resuelve el par (estado, published_at) coherente para una transición.
 *
 * Despublicar no borra `published_at`: se conserva como registro de cuándo estuvo
 * publicado por primera vez, que es información editorial útil.
 */
export function resolveStatusChange(
  to: ContentStatus,
  currentPublishedAt: string | null,
  now: () => Date = () => new Date()
): StatusChange {
  if (to === "publicado") {
    return { status: to, publishedAt: currentPublishedAt ?? now().toISOString() };
  }
  return { status: to, publishedAt: currentPublishedAt };
}
