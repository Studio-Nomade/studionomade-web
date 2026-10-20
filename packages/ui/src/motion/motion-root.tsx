"use client";

import { useEffect } from "react";

import { setupMotion, type MotionHandle } from "./presets";
import { loadMotion, prefersReducedMotion } from "./runtime";

declare global {
  interface Window {
    /** Lo lee el watchdog del layout para saber si la hidratación llegó. */
    __snRevealReady?: boolean;
  }
}

const SELECTOR = "[data-motion]";

/**
 * Activa TODAS las primitivas declarativas de movimiento (`Reveal`, `SplitText`,
 * `SplitLines`, `Parallax`, `Counter`, `StrokeNumber`). Se monta UNA vez en el
 * layout raíz.
 *
 * Las primitivas son Server Components que solo emiten `data-motion`; este
 * componente es el único que carga GSAP, crea un ScrollTrigger por elemento
 * (`top 85%`, una sola vez) y los limpia cuando el elemento sale del DOM —por
 * ejemplo al navegar con el App Router—.
 *
 * Garantías:
 * - Sin JavaScript no se oculta nada (el CSS solo pre-oculta con
 *   `@media (scripting: enabled)`).
 * - Con `prefers-reduced-motion: reduce` no se carga GSAP: el CSS tampoco
 *   pre-oculta y el contenido queda en su estado final.
 * - Si GSAP no carga, se marca `data-reveal-failed` en `<html>` y todo vuelve a
 *   ser visible.
 */
export function MotionRoot() {
  useEffect(() => {
    // Confirma que el cliente está vivo: desactiva el watchdog del layout.
    window.__snRevealReady = true;
    if (prefersReducedMotion()) return;

    const root = document.documentElement;
    const handles = new Map<HTMLElement, MotionHandle>();
    let disposed = false;
    let mutations: MutationObserver | undefined;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    let sweepScheduled = false;

    const sweep = () => {
      sweepScheduled = false;
      // Red de seguridad: lo que un salto de scroll dejó por encima del viewport
      // sin llegar a notificar se revela en el acto, sin animación.
      for (const [element, handle] of handles) {
        if (element.hasAttribute("data-revealed") || !handle.reveal) continue;
        if (element.getBoundingClientRect().bottom < 0) handle.reveal(true);
      }
    };
    const onScroll = () => {
      if (sweepScheduled) return;
      sweepScheduled = true;
      requestAnimationFrame(sweep);
    };

    loadMotion()
      .then((engine) => {
        if (disposed) return;
        const { ScrollTrigger } = engine;

        const add = (element: HTMLElement) => {
          if (handles.has(element)) return;
          const handle = setupMotion(element, engine);
          if (handle) handles.set(element, handle);
        };
        const scan = (scope: ParentNode) => {
          for (const element of scope.querySelectorAll<HTMLElement>(SELECTOR)) add(element);
        };
        const prune = () => {
          for (const [element, handle] of handles) {
            if (element.isConnected) continue;
            handle.cleanup();
            handles.delete(element);
          }
        };
        const scheduleRefresh = () => {
          clearTimeout(refreshTimer);
          refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 120);
        };

        scan(document);
        sweep();

        // Contenido que llega después: Client Components, navegación del App
        // Router, formularios que cambian de estado.
        mutations = new MutationObserver((records) => {
          let changed = false;
          for (const record of records) {
            for (const node of record.addedNodes) {
              if (!(node instanceof HTMLElement)) continue;
              if (node.matches(SELECTOR)) add(node);
              scan(node);
              changed = true;
            }
            if (record.removedNodes.length) changed = true;
          }
          if (!changed) return;
          prune();
          scheduleRefresh();
        });
        mutations.observe(document.body, { childList: true, subtree: true });

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("load", onScroll);
        // Las fuentes cambian la altura de los titulares: recalcula disparadores.
        document.fonts?.ready.then(() => !disposed && ScrollTrigger.refresh()).catch(() => {});
      })
      .catch(() => {
        // Más vale sin animación que con el contenido atrapado tras su máscara.
        root.setAttribute("data-reveal-failed", "");
      });

    return () => {
      disposed = true;
      clearTimeout(refreshTimer);
      mutations?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("load", onScroll);
      for (const handle of handles.values()) handle.cleanup();
      handles.clear();
    };
  }, []);

  return null;
}
