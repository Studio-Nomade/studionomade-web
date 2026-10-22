"use client";

import { MOTION } from "@studionomade/design-system";
import { useEffect, useRef } from "react";

import { getSmoothScroll, loadMotion, prefersReducedMotion } from "./runtime";
import styles from "./page-transition.module.css";

export interface PageTransitionProps {
  /** Ruta actual. El cambio de valor es la señal de que la página nueva llegó. */
  pathname: string;
  /** Navegación del framework (en Next: `router.push`). */
  navigate: (href: string) => void;
  /** Duración total en segundos: mitad para cubrir, mitad para descubrir. */
  duration?: number;
}

/** Tiempo máximo cubriendo la pantalla si la ruta nueva no llega. */
const COVER_TIMEOUT = 4000;

/**
 * Decide si un clic debe pasar por la cortina. Exportado para probarlo.
 * Solo enlaces internos a OTRA ruta, sin modificadores ni destino propio.
 */
export function shouldTransition(event: MouseEvent, location: Location): string | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const anchor = (event.target as Element | null)?.closest?.("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download") || anchor.dataset.transition === "off") return null;
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin) return null;
  // Mismo documento (anclas, misma ruta): no hay página que cubrir.
  if (url.pathname === location.pathname && url.search === location.search) return null;
  return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * Transición entre páginas: una cortina sube desde abajo (scaleY 0 → 1),
 * cambia la ruta y se retira hacia arriba (1 → 0), expo.inOut.
 *
 * Intercepta en fase de captura los clics en enlaces internos, así que funciona
 * con `next/link` (que respeta `defaultPrevented`) y con `<a>` simples. Degrada
 * sola: sin JS, con movimiento reducido, con modificadores (abrir en pestaña),
 * enlaces externos o anclas, el enlace navega como siempre. Atrás/adelante del
 * navegador no pasan por la cortina.
 *
 * Se eligió esto sobre la View Transitions API porque el App Router de Next 15
 * no expone el momento en que la ruta nueva ya está pintada sin las APIs
 * experimentales de React, y porque Firefox no la soporta en navegación SPA.
 */
export function PageTransition({
  pathname,
  navigate,
  duration = MOTION.duration
}: PageTransitionProps) {
  const curtainRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef<{ from: string; timer: ReturnType<typeof setTimeout> } | null>(null);
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const uncover = () => {
    const curtain = curtainRef.current;
    const pending = pendingRef.current;
    if (!curtain || !pending) return;
    clearTimeout(pending.timer);
    pendingRef.current = null;
    getSmoothScroll()?.scrollTo(0, { immediate: true, force: true });
    loadMotion()
      .then(({ gsap }) =>
        gsap.fromTo(
          curtain,
          { scaleY: 1, transformOrigin: "50% 0%" },
          {
            scaleY: 0,
            duration: duration / 2,
            ease: MOTION.ease.curtain,
            onComplete: () => {
              delete curtain.dataset.active;
            }
          }
        )
      )
      .catch(() => delete curtain.dataset.active);
  };

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (pendingRef.current || prefersReducedMotion()) return;
      const href = shouldTransition(event, window.location);
      const curtain = curtainRef.current;
      if (!href || !curtain) return;
      event.preventDefault();

      const from = window.location.pathname;
      pendingRef.current = { from, timer: setTimeout(uncover, COVER_TIMEOUT) };
      curtain.dataset.active = "";
      loadMotion()
        .then(({ gsap }) =>
          gsap.fromTo(
            curtain,
            { scaleY: 0, transformOrigin: "50% 100%" },
            {
              scaleY: 1,
              duration: duration / 2,
              ease: MOTION.ease.curtain,
              onComplete: () => navigateRef.current(href)
            }
          )
        )
        .catch(() => navigateRef.current(href));
    };
    // Captura: se adelanta al onClick de next/link, que respeta defaultPrevented.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [duration]);

  // La ruta cambió: la página nueva ya está en el DOM. Se descubre en el
  // siguiente frame para no mostrar el último pintado de la anterior.
  useEffect(() => {
    if (!pendingRef.current || pendingRef.current.from === pathname) return;
    const frame = requestAnimationFrame(uncover);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return <div ref={curtainRef} className={styles.curtain} aria-hidden="true" />;
}
