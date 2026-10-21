import { createClient } from "@supabase/supabase-js";

import type { Database } from "../types/database";

/**
 * Cliente anónimo para lecturas públicas desde el servidor (blog publicado),
 * sujeto a RLS y sin sesión ni cookies. Usa la clave publishable.
 */
export function createPublicDatabaseClient(url: string, publishableKey: string) {
  if (!url || !publishableKey) {
    throw new Error("Supabase URL and publishable key are required");
  }

  return createClient<Database>(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
