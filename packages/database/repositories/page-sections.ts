import type { SupabaseClient } from "@supabase/supabase-js";

import { DataError, mapPostgrestError } from "../errors";
import type { Database } from "../types/database";

/**
 * Repositorio de secciones (bloques) de una página.
 *
 * El reorden NO se hace aquí fila a fila: `page_sections` tiene un constraint
 * único sobre `(page_id, sort_order)` y PostgREST no ofrece transacciones
 * multi-sentencia, así que cualquier intercambio chocaría a mitad de camino.
 * Se delega en la función `reorder_page_sections`, que es atómica y queda sujeta
 * a RLS con la identidad de quien llama.
 */

export interface PageSection {
  readonly id: string;
  readonly pageId: string;
  readonly sectionType: string;
  readonly content: unknown;
  readonly sortOrder: number;
  readonly isHidden: boolean;
  readonly variant: string | null;
}

type Row = Database["public"]["Tables"]["page_sections"]["Row"];

function toSection(row: Row): PageSection {
  return {
    id: row.id,
    pageId: row.page_id,
    sectionType: row.section_type,
    content: row.content,
    sortOrder: row.sort_order,
    isHidden: row.is_hidden,
    variant: row.variant
  };
}

export interface CreateSectionInput {
  readonly pageId: string;
  readonly sectionType: string;
  readonly content: unknown;
  readonly variant?: string | null;
}

export interface UpdateSectionInput {
  readonly content?: unknown;
  readonly variant?: string | null;
  readonly isHidden?: boolean;
}

export function createPageSectionRepository(client: SupabaseClient<Database>) {
  return {
    async listByPage(pageId: string): Promise<readonly PageSection[]> {
      const { data, error } = await client
        .from("page_sections")
        .select("*")
        .eq("page_id", pageId)
        .order("sort_order", { ascending: true });

      if (error) throw mapPostgrestError(error);
      return (data ?? []).map(toSection);
    },

    async getById(id: string): Promise<PageSection> {
      const { data, error } = await client
        .from("page_sections")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw mapPostgrestError(error);
      if (!data) throw new DataError("not_found", `page_sections.id=${id}`);
      return toSection(data);
    },

    /** Añade la sección al final. La posición se calcula en servidor, no se recibe. */
    async append(input: CreateSectionInput): Promise<PageSection> {
      const { data: last, error: lastError } = await client
        .from("page_sections")
        .select("sort_order")
        .eq("page_id", input.pageId)
        .order("sort_order", { ascending: false })
        .limit(1);

      if (lastError) throw mapPostgrestError(lastError);

      const nextOrder = (last?.[0]?.sort_order ?? -1) + 1;

      const { data, error } = await client
        .from("page_sections")
        .insert({
          page_id: input.pageId,
          section_type: input.sectionType,
          content: input.content as never,
          variant: input.variant ?? null,
          sort_order: nextOrder
        })
        .select("*")
        .single();

      if (error) throw mapPostgrestError(error);
      return toSection(data);
    },

    async update(id: string, input: UpdateSectionInput): Promise<PageSection> {
      const patch: Record<string, unknown> = {};
      if (input.content !== undefined) patch.content = input.content;
      if (input.variant !== undefined) patch.variant = input.variant;
      if (input.isHidden !== undefined) patch.is_hidden = input.isHidden;

      if (Object.keys(patch).length === 0) return this.getById(id);

      const { data, error } = await client
        .from("page_sections")
        .update(patch)
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) throw mapPostgrestError(error);
      if (!data) throw new DataError("not_found", `page_sections.id=${id}`);
      return toSection(data);
    },

    async remove(id: string): Promise<void> {
      const { error } = await client.from("page_sections").delete().eq("id", id);
      if (error) throw mapPostgrestError(error);
    },

    /**
     * Reordena TODAS las secciones de la página en una sola transacción.
     * `orderedIds` debe ser exactamente el conjunto de secciones de esa página;
     * cualquier desajuste aborta y deja el orden anterior intacto.
     */
    async reorder(pageId: string, orderedIds: readonly string[]): Promise<number> {
      const { data, error } = await client.rpc("reorder_page_sections", {
        p_page_id: pageId,
        p_ordered_ids: orderedIds as string[]
      });

      if (error) throw mapPostgrestError(error);
      return data ?? 0;
    }
  };
}

export type PageSectionRepository = ReturnType<typeof createPageSectionRepository>;
