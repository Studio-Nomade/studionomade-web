"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Carril horizontal de scroll libre: nativo (trackpad, dedo, barra y flechas
 * del teclado con el foco dentro) más arrastre con el ratón. No intercepta el
 * scroll vertical de la página.
 */
export function DragScroll({
  children,
  className,
  label
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = ref.current;
    if (!track) return;
    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    let moved = false;

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragging = true;
      moved = false;
      startX = event.clientX;
      startScroll = track.scrollLeft;
    };
    const onMove = (event: PointerEvent) => {
      if (!dragging) return;
      const delta = event.clientX - startX;
      if (!moved && Math.abs(delta) > 4) {
        moved = true;
        track.dataset.dragging = "";
        track.setPointerCapture(event.pointerId);
      }
      if (moved) track.scrollLeft = startScroll - delta;
    };
    const onUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      delete track.dataset.dragging;
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    };
    // Un arrastre no debe terminar en clic sobre lo que haya debajo.
    const onClick = (event: MouseEvent) => {
      if (moved) {
        event.preventDefault();
        event.stopPropagation();
        moved = false;
      }
    };
    const onDragStart = (event: DragEvent) => event.preventDefault();

    track.addEventListener("pointerdown", onDown);
    track.addEventListener("pointermove", onMove);
    track.addEventListener("pointerup", onUp);
    track.addEventListener("pointercancel", onUp);
    track.addEventListener("click", onClick, true);
    track.addEventListener("dragstart", onDragStart);
    return () => {
      track.removeEventListener("pointerdown", onDown);
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", onUp);
      track.removeEventListener("pointercancel", onUp);
      track.removeEventListener("click", onClick, true);
      track.removeEventListener("dragstart", onDragStart);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      role="region"
      aria-label={label}
      tabIndex={0}
      data-lenis-prevent-horizontal=""
    >
      {children}
    </div>
  );
}
