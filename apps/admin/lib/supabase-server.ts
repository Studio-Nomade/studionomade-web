import "server-only";

import { cookies } from "next/headers";

import { createServerDatabaseClient } from "@studionomade/database";

import { readAdminServerEnvironment } from "./env";

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers.
 *
 * Usa la clave **publishable**, nunca la service role: todo lo que haga este
 * cliente queda sujeto a RLS con la identidad del usuario. El service role solo
 * vive en el BFF para operaciones sin sesión (captura pública de leads).
 */
export async function createAdminServerClient() {
  const env = readAdminServerEnvironment();
  const store = await cookies();

  return createServerDatabaseClient(env.supabaseUrl, env.supabasePublishableKey, {
    getAll: () => store.getAll().map(({ name, value }) => ({ name, value })),
    setAll: (values) => {
      try {
        for (const { name, value, options } of values) {
          store.set(name, value, options);
        }
      } catch {
        // `cookies()` es de solo lectura dentro de un Server Component. El refresco
        // de sesión lo hace el middleware, así que aquí se puede ignorar.
      }
    }
  });
}
