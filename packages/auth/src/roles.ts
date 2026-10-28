/**
 * Roles y permisos efectivos de un usuario.
 *
 * La matriz rol→permiso vive en la base de datos (`public.role_permissions`,
 * sembrada por la migración de M04). Aquí NO se duplica: se lee. Duplicarla en
 * TypeScript crearía deriva silenciosa respecto de lo que RLS hace cumplir.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@studionomade/database";

export const ROLE_SLUGS = [
  "superadmin",
  "admin",
  "editor",
  "reviewer",
  "area_editor",
  "commercial",
  "analyst",
  "collaborator"
] as const;

export type RoleSlug = (typeof ROLE_SLUGS)[number];

export const PERMISSION_CODES = [
  "content.read",
  "content.write",
  "content.publish",
  "settings.manage",
  "users.manage"
] as const;

export type PermissionCode = (typeof PERMISSION_CODES)[number];

export interface EffectiveAccess {
  readonly roles: readonly RoleSlug[];
  readonly permissions: readonly PermissionCode[];
}

export const NO_ACCESS: EffectiveAccess = { roles: [], permissions: [] };

function isRoleSlug(value: string): value is RoleSlug {
  return (ROLE_SLUGS as readonly string[]).includes(value);
}

function isPermissionCode(value: string): value is PermissionCode {
  return (PERMISSION_CODES as readonly string[]).includes(value);
}

/**
 * Lee los roles activos del usuario y los permisos que esos roles otorgan.
 *
 * Se ejecuta con la sesión del propio usuario: las políticas "users read own roles"
 * y "authenticated reads role permissions" bastan, y no hace falta service role.
 */
export async function readEffectiveAccess(
  client: SupabaseClient<Database>,
  userId: string
): Promise<EffectiveAccess> {
  const { data, error } = await client
    .from("user_roles")
    .select("roles!inner(slug, is_active, role_permissions(permissions(code)))")
    .eq("user_id", userId);

  if (error || !data) {
    return NO_ACCESS;
  }

  const roles = new Set<RoleSlug>();
  const permissions = new Set<PermissionCode>();

  for (const row of data) {
    const role = row.roles;
    if (!role || !role.is_active) continue;
    if (isRoleSlug(role.slug)) roles.add(role.slug);

    for (const link of role.role_permissions ?? []) {
      const code = link.permissions?.code;
      if (code && isPermissionCode(code)) permissions.add(code);
    }
  }

  return { roles: [...roles], permissions: [...permissions] };
}

export function hasRole(access: EffectiveAccess, role: RoleSlug): boolean {
  return access.roles.includes(role);
}

export function hasAnyRole(access: EffectiveAccess, ...roles: readonly RoleSlug[]): boolean {
  return roles.some((role) => access.roles.includes(role));
}

export function hasPermission(access: EffectiveAccess, permission: PermissionCode): boolean {
  return access.permissions.includes(permission);
}

/** Un usuario sin ningún rol activo no puede entrar al panel. */
export function canAccessAdmin(access: EffectiveAccess): boolean {
  return access.roles.length > 0;
}
