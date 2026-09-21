import { createServerClient, type CookieOptions } from "@supabase/ssr";

import type { Database } from "../types/database";

export interface ServerCookieStore {
  getAll(): Array<{ name: string; value: string }>;
  setAll(cookies: Array<{ name: string; value: string; options: CookieOptions }>): void;
}

export function createServerDatabaseClient(
  url: string,
  publishableKey: string,
  cookies: ServerCookieStore
) {
  if (!url || !publishableKey) {
    throw new Error("Supabase URL and publishable key are required");
  }

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () => cookies.getAll(),
      setAll: (values) => cookies.setAll(values)
    }
  });
}
