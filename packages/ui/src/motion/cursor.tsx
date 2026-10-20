"use client";

import { useEffect, useRef, useState } from "react";

import { hasFinePointer, loadMotion, prefersReducedMotion } from "./runtime";
import styles from "./cursor.module.css";

export interface CursorProps {
  /** Elementos sobre los que el círculo crece. */
  hoverSelector?: string;
  /** Fuerza de atracción de `data-cursor-magnetic` (0–1). */
  magnetism?: number;
}

const DEFAULT_HOVER = "a, button, [role='button'], label, summary, [data-cursor]";

/**
 * Cursor personalizado SOLO en escritorio (`pointer: fine` con hover): un
 * círculo que sigue al puntero con inercia.
 *
 * - Crece sobre enlaces y botones (`hoverSelector`).
 * - `data-cursor-label="Ver"` en un elemento muestra esa etiqueta dentro.
 * - `data-cursor-magnetic` atrae el elemento hacia el puntero.
 *
 * Es decorativo (`aria-hidden`, sin eventos de puntero) y no oculta el cursor
 * nativo. No se monta en táctil, con movimiento reducido ni en el servidor, así
 * que no hay nada que hidratar.
 */
export function Cursor({ hoverSelector = DEFAULT_HOVER, magnetism = 0.3 }: CursorProps) {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setEnabled(hasFinePointer() && !prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!dot || !label) return;
    let disposed = false;
    let teardown: (() => void) | undefined;

    loadMotion()
      .then(({ gsap }) => {
        if (disposed) return;
        gsap.set(dot, { xPercent: -50, yPercent: -50 });
        const moveX = gsap.quickTo(dot, "x", { duration: 0.5, ease: "power3.out" });
        const moveY = gsap.quickTo(dot, "y", { duration: 0.5, ease: "power3.out" });
        let magnet: HTMLElement | null = null;

        const onMove = (event: PointerEvent) => {
          if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
          dot.dataset.visible = "";
          moveX(event.clientX);
          moveY(event.clientY);
          if (magnet) {
            const box = magnet.getBoundingClientRect();
            gsap.to(magnet, {
              x: (event.clientX - (box.left + box.width / 2)) * magnetism,
              y: (event.clientY - (box.top + box.height / 2)) * magnetism,
              duration: 0.4,
              ease: "power3.out"
            });
          }
        };

        const onOver = (event: PointerEvent) => {
          const target = event.target as Element | null;
          const labelled = target?.closest<HTMLElement>("[data-cursor-label]");
          const interactive = target?.closest<HTMLElement>(hoverSelector);
          const nextMagnet = target?.closest<HTMLElement>("[data-cursor-magnetic]") ?? null;
          if (nextMagnet !== magnet) {
            if (magnet) gsap.to(magnet, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
            magnet = nextMagnet;
          }
          label.textContent = labelled?.dataset.cursorLabel ?? "";
          dot.dataset.state = labelled ? "label" : interactive ? "hover" : "idle";
        };

        const onLeave = () => {
          delete dot.dataset.visible;
        };
        const onDown = () => {
          dot.dataset.pressed = "";
        };
        const onUp = () => {
          delete dot.dataset.pressed;
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerover", onOver, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        window.addEventListener("pointerdown", onDown, { passive: true });
        window.addEventListener("pointerup", onUp, { passive: true });

        teardown = () => {
          window.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerover", onOver);
          document.documentElement.removeEventListener("pointerleave", onLeave);
          window.removeEventListener("pointerdown", onDown);
          window.removeEventListener("pointerup", onUp);
          if (magnet) gsap.set(magnet, { clearProps: "transform" });
        };
      })
      .catch(() => setEnabled(false));

    return () => {
      disposed = true;
      teardown?.();
    };
  }, [enabled, hoverSelector, magnetism]);

  if (!enabled) return null;

  return (
    <div ref={dotRef} className={styles.cursor} aria-hidden="true" data-state="idle">
      <span ref={labelRef} className={styles.label} />
    </div>
  );
}
