import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "../types/database";

export function createBrowserDatabaseClient(url: string, publishableKey: string) {
  if (!url || !publishableKey) {
    throw new Error("Supabase URL and publishable key are required");
  }

  return createBrowserClient<Database>(url, publishableKey);
}
