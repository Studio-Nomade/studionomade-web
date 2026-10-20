/**
 * Verificación de sesión **server-side**.
 *
 * Se usa `auth.getUser()`, que valida el JWT contra el servidor de Supabase, y
 * NUNCA `auth.getSession()`, que se limita a leer la cookie y confía en su
 * contenido. En un Server Component o middleware, confiar en la cookie permite
 * falsificar la identidad: es la diferencia entre autenticar y suponer.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@studionomade/database";

import { type Allowlist, isAllowed } from "./allowlist";
import { AuthError } from "./errors";

export interface SessionUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
}

/** Devuelve el usuario verificado, o `null` si no hay sesión válida. */
export async function readSessionUser(
  client: SupabaseClient<Database>
): Promise<SessionUser | null> {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user?.email) return null;

  const metadata = data.user.user_metadata ?? {};
  const displayName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : null;
  const avatarUrl = typeof metadata.avatar_url === "string" ? metadata.avatar_url : null;

  return {
    id: data.user.id,
    email: data.user.email.toLowerCase(),
    displayName,
    avatarUrl
  };
}

/**
 * Exige sesión válida **y** correo en la allowlist.
 *
 * Supabase Auth crea la cuenta en cuanto Google devuelve un OAuth correcto, así
 * que la allowlist es la puerta que decide si esa cuenta llega a tener acceso.
 * Como segunda barrera, un usuario recién creado no recibe ningún rol, y sin rol
 * no puede leer ni escribir nada (ver `canAccessAdmin`).
 */
export async function requireAllowlistedSession(
  client: SupabaseClient<Database>,
  allowlist: Allowlist
): Promise<SessionUser> {
  const user = await readSessionUser(client);
  if (!user) {
    throw new AuthError("no_session");
  }

  if (!isAllowed(user.email, allowlist)) {
    throw new AuthError("not_allowlisted", `email fuera de la allowlist: ${user.id}`);
  }

  return user;
}
