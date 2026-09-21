import { createClient } from "@supabase/supabase-js";

import type { Database } from "../types/database";

export function createServiceDatabaseClient(url: string, serviceKey: string) {
  if (!url || !serviceKey) {
    throw new Error("Supabase URL and service role key are required");
  }

  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
