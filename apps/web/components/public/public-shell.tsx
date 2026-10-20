import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./public.module.css";

export function PublicHeader() {
  return (
    <header className={styles.header}>
      <Link href="/">STUDIO NOMADE</Link>
      <nav aria-label="Navegación principal">
        <Link href="/proyectos">Proyectos</Link>
        <Link href="/studio">Studio</Link>
        <Link href="/lab">Lab</Link>
        <Link href="/contacto">Contacto</Link>
      </nav>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <strong>STUDIO NOMADE</strong>
      <span>Santiago · Madrid</span>
      <nav aria-label="Legal">
        <Link href="/privacidad">Privacidad</Link>
        <Link href="/terminos">Términos</Link>
      </nav>
    </footer>
  );
}

export function PublicPage({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      <PublicHeader />
      {children}
      <PublicFooter />
    </main>
  );
}

export { styles as publicStyles };
