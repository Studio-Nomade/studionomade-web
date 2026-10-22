import { isAuthError, requireAdminAccess } from "@studionomade/auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminNav } from "../../components/admin-nav";
import styles from "../../components/admin.module.css";
import { readAdminServerEnvironment } from "../../lib/env";
import { createAdminServerClient } from "../../lib/supabase-server";
import { signOut } from "../login/actions";

export const dynamic = "force-dynamic";

/**
 * Marco del panel: barra lateral con los módulos y la sesión. Cada página
 * vuelve a validar su rol o permiso (y RLS tiene la última palabra).
 */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const client = await createAdminServerClient();
  try {
    const { user, access } = await requireAdminAccess(
      client,
      readAdminServerEnvironment().allowlist
    );
    return (
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <p className={styles.brand}>
            Studio Nomade
            <span>Intranet</span>
          </p>
          <AdminNav roles={access.roles} />
          <div className={styles.session}>
            <span className={styles.user}>{user.displayName ?? user.email}</span>
            <span className={styles.roles}>{access.roles.join(", ")}</span>
            <form action={signOut}>
              <button type="submit" className={styles.linkButton}>
                Cerrar sesión
              </button>
            </form>
          </div>
        </aside>
        <div className={styles.content}>{children}</div>
      </div>
    );
  } catch (error) {
    if (isAuthError(error)) {
      if (error.code === "no_session") redirect("/login");
      redirect("/auth/denegado");
    }
    throw error;
  }
}
