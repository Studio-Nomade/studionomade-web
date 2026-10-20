/**
 * Núcleo compartido por las primitivas de movimiento. No es API pública: lo
 * consumen los componentes de `motion/` y `layout/`.
 *
 * GSAP se carga con `import()` dinámico y una sola vez. Así su peso (~45 kB
 * gzip con ScrollTrigger y SplitText) sale del bundle inicial y no compite con
 * el LCP: el contenido ya está pintado y visible cuando llega.
 */
import type Lenis from "lenis";

type Gsap = typeof import("gsap").gsap;
type ScrollTriggerStatic = typeof import("gsap/ScrollTrigger").ScrollTrigger;
type SplitTextStatic = typeof import("gsap/SplitText").SplitText;

export interface MotionEngine {
  gsap: Gsap;
  ScrollTrigger: ScrollTriggerStatic;
  SplitText: SplitTextStatic;
}

let engine: Promise<MotionEngine> | undefined;

export function loadMotion(): Promise<MotionEngine> {
  engine ??= Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
    import("gsap/SplitText")
  ]).then(([core, scroll, split]) => {
    const { gsap } = core;
    gsap.registerPlugin(scroll.ScrollTrigger, split.SplitText);
    return { gsap, ScrollTrigger: scroll.ScrollTrigger, SplitText: split.SplitText };
  });
  // Un fallo de red no debe dejar la promesa envenenada para siempre.
  engine.catch(() => {
    engine = undefined;
  });
  return engine;
}

function matches(query: string): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(query).matches
    : false;
}

/** `true` si el usuario pidió movimiento reducido. Sin `matchMedia`, `false`. */
export function prefersReducedMotion(): boolean {
  return matches("(prefers-reduced-motion: reduce)");
}

/** Puntero preciso con hover: ratón o trackpad. Excluye táctil. */
export function hasFinePointer(): boolean {
  return matches("(pointer: fine) and (hover: hover)");
}

/* ---- Lenis compartido: lo crea SmoothScroll y lo leen menú y transición ---- */

let lenis: Lenis | null = null;

export function setSmoothScroll(instance: Lenis | null) {
  lenis = instance;
}

export function getSmoothScroll(): Lenis | null {
  return lenis;
}

/** Bloquea o libera el scroll de la página, con o sin Lenis. */
export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.toggleAttribute("data-scroll-locked", locked);
}
