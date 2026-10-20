"use client";

import { BREAKPOINTS } from "@studionomade/design-system";
import { Children, useEffect, useRef, useState, type ReactNode } from "react";

import { getSmoothScroll, loadMotion } from "./runtime";
import styles from "./horizontal-scroll.module.css";

export interface HorizontalScrollProps {
  /** Cada hijo directo es un panel de la galería. */
  children: ReactNode;
  /** Nombre accesible de la región. */
  label: string;
  /** Ancho mínimo (px) a partir del cual se pinnea. Por debajo, scroll nativo. */
  minWidth?: number;
  className?: string;
}

/**
 * Galería horizontal a pantalla completa: la sección se fija (pin) y el scroll
 * vertical la recorre de lado a lado, con ScrollTrigger.
 *
 * Sin JS, con movimiento reducido o por debajo de `minWidth`, es un carril
 * horizontal nativo con `scroll-snap`, enfocable para desplazarlo con flechas.
 * Pinneada, si el foco de teclado cae en un panel fuera de pantalla, la página
 * se desplaza hasta el punto del recorrido donde ese panel es visible.
 */
export function HorizontalScroll({
  children,
  label,
  minWidth = BREAKPOINTS.md,
  className
}: HorizontalScrollProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);

  // 1. ¿Corresponde pinnear? Ancho suficiente y movimiento permitido.
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(
      `(min-width: ${minWidth}px) and (prefers-reduced-motion: no-preference)`
    );
    const update = () => setPinned(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [minWidth]);

  // 2. Con el layout pinneado ya pintado (`data-pinned`), crea el recorrido.
  useEffect(() => {
    if (!pinned) return;
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!pin || !track) return;
    let revert: (() => void) | undefined;
    let disposed = false;

    loadMotion()
      .then(({ gsap }) => {
        if (disposed) return;
        const ctx = gsap.context(() => {
          const distance = () => Math.max(0, track.scrollWidth - pin.clientWidth);
          const tween = gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: pin,
              start: "top top",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: true,
              invalidateOnRefresh: true
            }
          });

          // Teclado: lleva el scroll vertical al punto donde el panel enfocado se ve.
          const onFocus = (event: FocusEvent) => {
            const trigger = tween.scrollTrigger;
            const panel = (event.target as HTMLElement).closest<HTMLElement>("[data-panel]");
            if (!trigger || !panel || distance() === 0) return;
            const ratio = Math.min(1, panel.offsetLeft / distance());
            const top = trigger.start + (trigger.end - trigger.start) * ratio;
            const lenis = getSmoothScroll();
            if (lenis) lenis.scrollTo(top, { immediate: true });
            else window.scrollTo({ top, behavior: "auto" });
          };
          track.addEventListener("focusin", onFocus);
          return () => track.removeEventListener("focusin", onFocus);
        }, pin);
        revert = () => ctx.revert();
      })
      .catch(() => setPinned(false));

    return () => {
      disposed = true;
      revert?.();
    };
  }, [pinned]);

  return (
    <section
      className={[styles.scroller, className].filter(Boolean).join(" ")}
      aria-label={label}
      data-pinned={pinned || undefined}
    >
      {/* Se pinnea el envoltorio interno, no la sección: el pin-spacer de
          ScrollTrigger queda dentro de un nodo que React no reordena. */}
      <div ref={pinRef} className={styles.pin}>
        <div ref={trackRef} className={styles.track} tabIndex={pinned ? -1 : 0}>
          {Children.toArray(children).map((child, index) => (
            <div className={styles.panel} key={index} data-panel="">
              {child}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
