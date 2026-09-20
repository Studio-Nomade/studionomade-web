import type { SupabaseClient } from "@supabase/supabase-js";

import { DataError, mapPostgrestError } from "../errors";
import { type Area, toArea } from "../mappers";
import type { Database } from "../types/database";

/**
 * Repositorio de áreas de negocio. Las áreas son un catálogo pequeño y estable:
 * no necesita paginación.
 */
export function createAreaRepository(client: SupabaseClient<Database>) {
  return {
    async listActive(): Promise<readonly Area[]> {
      const { data, error } = await client
        .from("areas")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw mapPostgrestError(error);
      return (data ?? []).map(toArea);
    },

    async listAll(): Promise<readonly Area[]> {
      const { data, error } = await client
        .from("areas")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw mapPostgrestError(error);
      return (data ?? []).map(toArea);
    },

    async findBySlug(slug: string): Promise<Area | null> {
      const { data, error } = await client.from("areas").select("*").eq("slug", slug).maybeSingle();
      if (error) throw mapPostgrestError(error);
      return data ? toArea(data) : null;
    },

    async getById(id: string): Promise<Area> {
      const { data, error } = await client.from("areas").select("*").eq("id", id).maybeSingle();
      if (error) throw mapPostgrestError(error);
      if (!data) throw new DataError("not_found", `areas.id=${id}`);
      return toArea(data);
    }
  };
}

export type AreaRepository = ReturnType<typeof createAreaRepository>;
