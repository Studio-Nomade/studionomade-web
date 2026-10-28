"use client";

import { MOTION } from "@studionomade/design-system";
import { useEffect } from "react";

import { hasFinePointer, loadMotion, prefersReducedMotion, setSmoothScroll } from "./runtime";

export interface SmoothScrollProps {
  /** Interpolación por frame (0–1). 0.12 equivale al damping del sitio de origen. */
  lerp?: number;
}

/**
 * Scroll suave con Lenis (MIT), sincronizado con ScrollTrigger. Se monta una vez
 * en el layout y no renderiza nada.
 *
 * Solo se activa con puntero preciso (ratón o trackpad) y sin
 * `prefers-reduced-motion`: en táctil el scroll nativo es mejor y en
 * accesibilidad, obligatorio. Sin JS, el scroll es el nativo.
 *
 * Lenis desplaza la ventana real, así que anclas, `position: sticky`, la
 * restauración de scroll y la búsqueda del navegador siguen funcionando.
 * `data-lenis-prevent` en un contenedor le devuelve su scroll nativo (menús,
 * modales con overflow).
 */
export function SmoothScroll({ lerp = MOTION.smoothLerp }: SmoothScrollProps) {
  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    let disposed = false;
    let destroy: (() => void) | undefined;

    Promise.all([import("lenis"), loadMotion()])
      .then(([{ default: Lenis }, { ScrollTrigger }]) => {
        if (disposed) return;
        const lenis = new Lenis({ lerp, autoRaf: true, syncTouch: false });
        lenis.on("scroll", ScrollTrigger.update);
        setSmoothScroll(lenis);
        destroy = () => {
          setSmoothScroll(null);
          lenis.destroy();
        };
      })
      .catch(() => {});

    return () => {
      disposed = true;
      destroy?.();
    };
  }, [lerp]);

  return null;
}
