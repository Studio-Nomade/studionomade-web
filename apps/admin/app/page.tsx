import { isAuthError, requireAdminAccess } from "@studionomade/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { readAdminServerEnvironment } from "../lib/env";
import { createAdminServerClient } from "../lib/supabase-server";
import { signOut } from "./login/actions";

/**
 * Segunda capa de la autorización en profundidad.
 *
 * El middleware ya garantizó que hay sesión, pero la verificación que vale es
 * esta: se vuelve a validar el JWT contra el servidor, se aplica la allowlist y
 * se exige al menos un rol activo. Nunca se confía en que el middleware pasó.
 */

// El panel depende de la sesión de cada usuario: no se prerenderiza nunca. Sin
// esto, el build intentaría generarlo en estático (y en CI ni siquiera hay
// credenciales de Supabase).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const client = await createAdminServerClient();
  const { allowlist } = readAdminServerEnvironment();

  try {
    const { user, access } = await requireAdminAccess(client, allowlist);

    return (
      <main>
        <h1>Studio Nomade Admin</h1>
        <p>
          Sesión iniciada como <strong>{user.displayName ?? user.email}</strong>.
        </p>

        <h2>Acceso efectivo</h2>
        <p>
          Roles: <strong>{access.roles.join(", ")}</strong>
        </p>
        <p>
          Permisos: <strong>{access.permissions.join(", ") || "ninguno"}</strong>
        </p>

        <nav aria-label="Módulos de administración">
          <ul>
            <li>
              <Link href="/proyectos">Proyectos y medios</Link>
            </li>
            <li>
              <Link href="/leads">Leads</Link>
            </li>
            <li>
              <Link href="/lab">Digital Lab</Link>
            </li>
            <li>
              <Link href="/senales">Señales operativas</Link>
            </li>
          </ul>
        </nav>

        <form action={signOut}>
          <button type="submit">Cerrar sesión</button>
        </form>
      </main>
    );
  } catch (error) {
    if (isAuthError(error)) {
      if (error.code === "no_session") redirect("/login");
      redirect("/auth/denegado");
    }
    throw error;
  }
}
