import type { SupabaseClient } from "@supabase/supabase-js";

import { DataError, mapPostgrestError } from "../errors";
import { type Page, type ContentStatus, toPage } from "../mappers";
import { type PageRequest, type Paginated, paginate, resolveRange } from "../queries/pagination";
import type { Database } from "../types/database";

/**
 * Repositorio de páginas. Es el ÚNICO lugar del sistema que sabe cómo se
 * consultan y escriben las páginas; ni el dominio ni la UI ven SQL ni PostgREST.
 *
 * Nada aquí comprueba permisos: eso es responsabilidad del servicio de dominio
 * (servidor) y de RLS (base de datos). El repositorio se limita a hablar con la
 * base con la identidad que trae el cliente.
 */

export interface ListPagesFilter extends PageRequest {
  readonly status?: ContentStatus;
  readonly search?: string;
}

export interface CreatePageInput {
  readonly slug: string;
  readonly title: string;
  readonly status: ContentStatus;
  readonly publishedAt?: string | null;
}

export interface UpdatePageInput {
  readonly title?: string;
  readonly slug?: string;
  readonly status?: ContentStatus;
  readonly publishedAt?: string | null;
}

export function createPageRepository(client: SupabaseClient<Database>) {
  return {
    async list(filter: ListPagesFilter = {}): Promise<Paginated<Page>> {
      const range = resolveRange(filter);

      let query = client
        .from("pages")
        .select("*", { count: "exact" })
        .order("updated_at", { ascending: false })
        .range(range.from, range.to);

      if (filter.status) query = query.eq("status", filter.status);
      // `ilike` con comodines: el valor va parametrizado, no concatenado en SQL.
      if (filter.search) query = query.ilike("title", `%${filter.search}%`);

      const { data, error, count } = await query;
      if (error) throw mapPostgrestError(error);

      return paginate((data ?? []).map(toPage), range, count);
    },

    async findBySlug(slug: string): Promise<Page | null> {
      const { data, error } = await client.from("pages").select("*").eq("slug", slug).maybeSingle();
      if (error) throw mapPostgrestError(error);
      return data ? toPage(data) : null;
    },

    async getById(id: string): Promise<Page> {
      const { data, error } = await client.from("pages").select("*").eq("id", id).maybeSingle();
      if (error) throw mapPostgrestError(error);
      if (!data) throw new DataError("not_found", `pages.id=${id}`);
      return toPage(data);
    },

    async create(input: CreatePageInput): Promise<Page> {
      const { data, error } = await client
        .from("pages")
        .insert({
          slug: input.slug,
          title: input.title,
          status: input.status,
          published_at: input.publishedAt ?? null
        })
        .select("*")
        .single();

      if (error) throw mapPostgrestError(error);
      return toPage(data);
    },

    async update(id: string, input: UpdatePageInput): Promise<Page> {
      const patch: Record<string, unknown> = {};
      if (input.title !== undefined) patch.title = input.title;
      if (input.slug !== undefined) patch.slug = input.slug;
      if (input.status !== undefined) patch.status = input.status;
      if (input.publishedAt !== undefined) patch.published_at = input.publishedAt;

      if (Object.keys(patch).length === 0) {
        return this.getById(id);
      }

      const { data, error } = await client
        .from("pages")
        .update(patch)
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) throw mapPostgrestError(error);
      // Cero filas al actualizar significa que RLS lo ocultó o no existe. No se
      // distingue a propósito: no revelar recursos ajenos.
      if (!data) throw new DataError("not_found", `pages.id=${id}`);
      return toPage(data);
    },

    async remove(id: string): Promise<void> {
      const { error } = await client.from("pages").delete().eq("id", id);
      if (error) throw mapPostgrestError(error);
    },

    /** ¿El slug ya está tomado por otra página? */
    async slugExists(slug: string, exceptId?: string): Promise<boolean> {
      let query = client.from("pages").select("id").eq("slug", slug);
      if (exceptId) query = query.neq("id", exceptId);

      const { data, error } = await query.limit(1);
      if (error) throw mapPostgrestError(error);
      return (data?.length ?? 0) > 0;
    }
  };
}

export type PageRepository = ReturnType<typeof createPageRepository>;
