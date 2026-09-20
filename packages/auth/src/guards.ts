/**
 * Guards de autorización para Server Actions y Route Handlers.
 *
 * Autorización en profundidad: estos guards son la capa de **servidor**. No
 * sustituyen a RLS (que es la última palabra en la base de datos) ni al
 * middleware (que solo decide si la ruta se sirve). Las tres capas se aplican.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@studionomade/database";

import type { Allowlist } from "./allowlist";
import { AuthError } from "./errors";
import {
  type EffectiveAccess,
  type PermissionCode,
  type RoleSlug,
  canAccessAdmin,
  hasAnyRole,
  hasPermission,
  readEffectiveAccess
} from "./roles";
import { type SessionUser, requireAllowlistedSession } from "./session";

export interface AuthorizedContext {
  readonly user: SessionUser;
  readonly access: EffectiveAccess;
}

/** Sesión verificada + allowlist + al menos un rol activo. */
export async function requireAdminAccess(
  client: SupabaseClient<Database>,
  allowlist: Allowlist
): Promise<AuthorizedContext> {
  const user = await requireAllowlistedSession(client, allowlist);
  const access = await readEffectiveAccess(client, user.id);

  if (!canAccessAdmin(access)) {
    throw new AuthError("no_profile", `usuario sin roles activos: ${user.id}`);
  }

  return { user, access };
}

export async function requirePermission(
  client: SupabaseClient<Database>,
  allowlist: Allowlist,
  permission: PermissionCode
): Promise<AuthorizedContext> {
  const context = await requireAdminAccess(client, allowlist);

  if (!hasPermission(context.access, permission)) {
    throw new AuthError("forbidden", `falta el permiso ${permission}: ${context.user.id}`);
  }

  return context;
}

export async function requireAnyRole(
  client: SupabaseClient<Database>,
  allowlist: Allowlist,
  ...roles: readonly RoleSlug[]
): Promise<AuthorizedContext> {
  const context = await requireAdminAccess(client, allowlist);

  if (!hasAnyRole(context.access, ...roles)) {
    throw new AuthError("forbidden", `falta alguno de los roles ${roles.join(", ")}`);
  }

  return context;
}
