import { describe, expect, it } from "vitest";

import { parseAllowlist } from "./allowlist";
import { isAuthError, toPublicError } from "./errors";
import { requireAdminAccess, requireAnyRole, requirePermission } from "./guards";
import { canAccessAdmin, hasAnyRole, hasPermission, hasRole } from "./roles";

const ALLOWLIST = parseAllowlist("@studionomade.cl");

/**
 * Doble de prueba del cliente de Supabase: solo implementa lo que los guards usan
 * (`auth.getUser` y la consulta de user_roles con sus permisos embebidos).
 */
function fakeClient(options: {
  email?: string | null;
  roles?: Array<{ slug: string; is_active: boolean; permissions: string[] }>;
}) {
  const { email = "editor@studionomade.cl", roles = [] } = options;

  return {
    auth: {
      getUser: async () =>
        email
          ? { data: { user: { id: "user-1", email, user_metadata: { full_name: "Edi Tor" } } }, error: null }
          : { data: { user: null }, error: new Error("no session") }
    },
    from: () => ({
      select: () => ({
        eq: async () => ({
          data: roles.map((role) => ({
            roles: {
              slug: role.slug,
              is_active: role.is_active,
              role_permissions: role.permissions.map((code) => ({ permissions: { code } }))
            }
          })),
          error: null
        })
      })
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

const EDITOR = [
  { slug: "editor", is_active: true, permissions: ["content.read", "content.write", "content.publish"] }
];

describe("requireAdminAccess", () => {
  it("rechaza sin sesión", async () => {
    await expect(requireAdminAccess(fakeClient({ email: null }), ALLOWLIST)).rejects.toMatchObject({
      code: "no_session",
      status: 401
    });
  });

  it("rechaza un correo fuera de la allowlist", async () => {
    const client = fakeClient({ email: "externo@gmail.com", roles: EDITOR });
    await expect(requireAdminAccess(client, ALLOWLIST)).rejects.toMatchObject({
      code: "not_allowlisted",
      status: 403
    });
  });

  it("rechaza a un usuario allowlisted pero SIN roles", async () => {
    const client = fakeClient({ roles: [] });
    await expect(requireAdminAccess(client, ALLOWLIST)).rejects.toMatchObject({
      code: "no_profile",
      status: 403
    });
  });

  it("ignora los roles desactivados", async () => {
    const client = fakeClient({
      roles: [{ slug: "author", is_active: false, permissions: ["content.write"] }]
    });
    await expect(requireAdminAccess(client, ALLOWLIST)).rejects.toMatchObject({ code: "no_profile" });
  });

  it("acepta a un editor y devuelve sus permisos efectivos", async () => {
    const { user, access } = await requireAdminAccess(fakeClient({ roles: EDITOR }), ALLOWLIST);
    expect(user.email).toBe("editor@studionomade.cl");
    expect(access.roles).toEqual(["editor"]);
    expect(access.permissions).toContain("content.write");
    expect(canAccessAdmin(access)).toBe(true);
  });
});

describe("requirePermission", () => {
  it("deja pasar con el permiso", async () => {
    const context = await requirePermission(fakeClient({ roles: EDITOR }), ALLOWLIST, "content.write");
    expect(hasPermission(context.access, "content.write")).toBe(true);
  });

  it("rechaza sin el permiso, con 403", async () => {
    await expect(
      requirePermission(fakeClient({ roles: EDITOR }), ALLOWLIST, "users.manage")
    ).rejects.toMatchObject({ code: "forbidden", status: 403 });
  });
});

describe("requireAnyRole", () => {
  it("acepta si tiene alguno de los roles", async () => {
    const client = fakeClient({
      roles: [{ slug: "commercial", is_active: true, permissions: [] }]
    });
    const context = await requireAnyRole(client, ALLOWLIST, "commercial", "admin");
    expect(hasAnyRole(context.access, "commercial")).toBe(true);
    expect(hasRole(context.access, "admin")).toBe(false);
  });

  it("rechaza si no tiene ninguno", async () => {
    await expect(
      requireAnyRole(fakeClient({ roles: EDITOR }), ALLOWLIST, "commercial", "superadmin")
    ).rejects.toMatchObject({ code: "forbidden" });
  });
});

describe("errores públicos", () => {
  it("no filtran el detalle interno al cliente", async () => {
    try {
      await requireAdminAccess(fakeClient({ email: "externo@gmail.com" }), ALLOWLIST);
      expect.unreachable("debería haber lanzado");
    } catch (error) {
      expect(isAuthError(error)).toBe(true);
      if (!isAuthError(error)) return;
      const publicError = toPublicError(error);
      expect(publicError.message).not.toContain("allowlist:");
      expect(Object.keys(publicError)).toEqual(["code", "message"]);
      expect(error.detail).toBeDefined();
    }
  });
});
