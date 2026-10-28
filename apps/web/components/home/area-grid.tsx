"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Lista de áreas. Sin puntero fino no hay hover que cambie la imagen: en táctil
 * cada tarjeta muestra su segunda imagen mientras cruza la franja central de la
 * pantalla (`data-swapped`), con la misma animación de máscara del hover.
 */
export function AreaGrid({ className, children }: { className?: string; children: ReactNode }) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof IntersectionObserver === "undefined") return;
    if (typeof window.matchMedia !== "function" || !window.matchMedia("(hover: none)").matches)
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          entry.target.toggleAttribute("data-swapped", entry.isIntersecting);
      },
      { rootMargin: "-35% 0% -35% 0%" }
    );
    for (const item of Array.from(list.children)) observer.observe(item);
    return () => observer.disconnect();
  }, []);

  return (
    <ul ref={listRef} className={className}>
      {children}
    </ul>
  );
}
