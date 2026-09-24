import type { Database } from "../types/database";

/**
 * Mappers: fila de base de datos → entidad de dominio.
 *
 * Su razón de ser es que el dominio y la UI no dependan de la forma exacta de las
 * tablas: `snake_case`, columnas internas y `jsonb` sin tipar se quedan aquí.
 */

type Row<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];

export type ContentStatus = Database["public"]["Enums"]["content_status"];

export interface Page {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly status: ContentStatus;
  readonly publishedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function toPage(row: Row<"pages">): Page {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export interface Area {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string | null;
  readonly isActive: boolean;
  readonly sortOrder: number;
}

export function toArea(row: Row<"areas">): Area {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    isActive: row.is_active,
    sortOrder: row.sort_order
  };
}

export interface Project {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string | null;
  readonly status: ContentStatus;
  readonly primaryAreaId: string;
  readonly clientId: string | null;
  readonly publishedAt: string | null;
}

export function toProject(row: Row<"projects">): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    status: row.status,
    primaryAreaId: row.primary_area_id,
    clientId: row.client_id,
    publishedAt: row.published_at
  };
}
