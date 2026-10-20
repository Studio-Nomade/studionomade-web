import type { ReactNode } from "react";
import { PublicFooter } from "./public-footer";
import { PublicHeader } from "./public-header";
import styles from "./public.module.css";

export { PublicFooter } from "./public-footer";
export { PublicHeader } from "./public-header";

/**
 * Esqueleto de las páginas públicas: cabecera, contenido y footer.
 *
 * `main` va por encima del footer (`z-index: 1`, fondo opaco) para que el
 * revelado fijo del footer funcione en escritorio.
 */
export function PublicPage({
  children,
  headerTone = "dark"
}: {
  children: ReactNode;
  /** `light` para páginas de fondo blanco (casos, listado). */
  headerTone?: "light" | "dark";
}) {
  return (
    <>
      <PublicHeader tone={headerTone} />
      <main id="contenido" className={styles.page}>
        {children}
      </main>
      <PublicFooter />
    </>
  );
}

export { styles as publicStyles };
