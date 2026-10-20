"use client";

import { usePathname, useRouter } from "next/navigation";
import { Cursor, PageTransition, SmoothScroll } from "@studionomade/ui";

/**
 * Capa global de movimiento del sitio público: scroll suave, cursor de
 * escritorio y cortina entre páginas. Cada pieza se desactiva sola en táctil,
 * con `prefers-reduced-motion` o sin JavaScript.
 */
export function MotionShell() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <>
      <SmoothScroll />
      <Cursor />
      <PageTransition pathname={pathname} navigate={router.push} />
    </>
  );
}
