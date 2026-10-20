"use client";

import {
  Children,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode
} from "react";

import { prefersReducedMotion } from "./runtime";
import styles from "./carousel.module.css";

export interface CarouselProps {
  /** Cada hijo directo es una diapositiva. */
  children: ReactNode;
  /** Nombre accesible del carrusel ("Proyectos destacados"). */
  label: string;
  /** `full`: una diapositiva a todo el ancho (hero) · `peek`: asoma la siguiente (galería). */
  variant?: "full" | "peek";
  /**
   * `full`: flechas, contador y barra por pasos · `progress`: solo una barra
   * fina cuyo indicador sigue al scroll real (riel de mockups, sin flechas).
   */
  controls?: "full" | "progress";
  /** Texto o bloque que acompaña al riel: columna izquierda en escritorio, encima en móvil. */
  lead?: ReactNode;
  /** Al llegar al final, la flecha siguiente vuelve al inicio. */
  loop?: boolean;
  /** Avance automático en ms. `0` lo desactiva; nunca corre con movimiento reducido. */
  autoplay?: number;
  /** Controles en blanco, para fondos oscuros o imágenes. */
  invert?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  pauseLabel?: string;
  playLabel?: string;
  /** Nombre de cada diapositiva para lectores de pantalla. */
  slideLabel?: (index: number, total: number) => string;
  className?: string;
}

const pad = (value: number) => String(value).padStart(2, "0");
const defaultSlideLabel = (index: number, total: number) => `${index + 1} de ${total}`;
/** Desplazamiento mínimo (px) para que un arrastre con ratón no sea un clic. */
const DRAG_THRESHOLD = 4;

function Arrow({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" data-flip={flip || undefined}>
      <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/** Progreso horizontal 0–1 del carril. Sin desborde, 0. */
export function scrollProgress(
  track: Pick<HTMLElement, "scrollLeft" | "scrollWidth" | "clientWidth">
) {
  const max = track.scrollWidth - track.clientWidth;
  return max > 0 ? Math.min(1, Math.max(0, track.scrollLeft / max)) : 0;
}

/**
 * Diapositiva más cercana al inicio visible. Al final del recorrido manda la
 * última: en un riel con "peek" las últimas nunca llegan a alinearse al inicio.
 */
function nearestSlide(track: HTMLElement): number {
  const total = track.children.length;
  const max = track.scrollWidth - track.clientWidth;
  if (total > 1 && max > 0 && track.scrollLeft >= max - 1) return total - 1;
  let closest = 0;
  let distance = Infinity;
  Array.from(track.children).forEach((child, childIndex) => {
    const offset = Math.abs(
      (child as HTMLElement).offsetLeft - track.offsetLeft - track.scrollLeft
    );
    if (offset < distance) {
      distance = offset;
      closest = childIndex;
    }
  });
  return closest;
}

/**
 * Carrusel con flechas, contador y barra de progreso, para heros y galerías.
 *
 * La base es un carril con `scroll-snap` nativo: sin JavaScript se desliza con
 * el dedo, el trackpad o la barra, y cada diapositiva es alcanzable. Al hidratar
 * aparecen los controles (`data-enhanced`), el teclado (← → Inicio Fin), el
 * arrastre con ratón y el anuncio de la diapositiva actual.
 */
export function Carousel({
  children,
  label,
  variant = "full",
  controls = "full",
  lead,
  loop = false,
  autoplay = 0,
  invert = false,
  prevLabel = "Anterior",
  nextLabel = "Siguiente",
  pauseLabel = "Pausar",
  playLabel = "Reproducir",
  slideLabel = defaultSlideLabel,
  className
}: CarouselProps) {
  const slides = Children.toArray(children);
  const total = slides.length;
  const trackId = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ id: number; x: number; left: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    setEnhanced(true);
    setReduced(prefersReducedMotion());
  }, []);

  const goTo = useCallback(
    (target: number) => {
      const track = trackRef.current;
      if (!track || total === 0) return;
      const next = loop ? (target + total) % total : Math.max(0, Math.min(total - 1, target));
      const slide = track.children[next] as HTMLElement | undefined;
      if (!slide) return;
      track.scrollTo({
        left: slide.offsetLeft - track.offsetLeft,
        behavior: prefersReducedMotion() ? "auto" : "smooth"
      });
      setIndex(next);
    },
    [loop, total]
  );

  // El índice y la barra siguen al scroll real: el usuario también puede arrastrar.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setIndex(nearestSlide(track));
        setProgress(scrollProgress(track));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, []);

  const playing = autoplay > 0 && !reduced && !paused && !hovering && total > 1;
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => goTo(index + 1 >= total ? 0 : index + 1), autoplay);
    return () => clearInterval(timer);
  }, [autoplay, goTo, index, playing, total]);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const actions: Record<string, () => void> = {
      ArrowRight: () => goTo(index + 1),
      ArrowLeft: () => goTo(index - 1),
      Home: () => goTo(0),
      End: () => goTo(total - 1)
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  // Arrastre con ratón (el táctil ya desliza de forma nativa).
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || !trackRef.current) return;
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      left: trackRef.current.scrollLeft,
      moved: false
    };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const track = trackRef.current;
    if (!state || !track || state.id !== event.pointerId) return;
    const delta = event.clientX - state.x;
    if (!state.moved) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return;
      state.moved = true;
      setDragging(true);
      track.setPointerCapture?.(event.pointerId);
    }
    track.scrollLeft = state.left - delta;
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    drag.current = null;
    if (!state.moved) return;
    suppressClick.current = true;
    trackRef.current?.releasePointerCapture?.(event.pointerId);
    setDragging(false);
    if (trackRef.current) goTo(nearestSlide(trackRef.current));
  };
  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const atStart = !loop && index === 0;
  const atEnd = !loop && index === total - 1;
  const progressOnly = controls === "progress";

  return (
    <section
      className={[styles.carousel, className].filter(Boolean).join(" ")}
      aria-roledescription="carrusel"
      aria-label={label}
      data-variant={variant}
      data-controls={controls}
      data-lead={lead ? "" : undefined}
      data-invert={invert || undefined}
      data-enhanced={enhanced || undefined}
      data-dragging={dragging || undefined}
      onKeyDown={onKeyDown}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
    >
      {lead ? <div className={styles.lead}>{lead}</div> : null}

      <div
        className={styles.track}
        id={trackId}
        ref={trackRef}
        tabIndex={0}
        // Los gestos horizontales del trackpad quedan nativos aunque haya Lenis.
        data-lenis-prevent-horizontal=""
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(event) => event.preventDefault()}
      >
        {slides.map((slide, slideIndex) => (
          <div
            className={styles.slide}
            key={slideIndex}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={slideLabel(slideIndex, total)}
            data-active={slideIndex === index || undefined}
          >
            {slide}
          </div>
        ))}
      </div>

      {progressOnly ? (
        <div className={styles.controls}>
          <span
            className={styles.progress}
            data-mode="scroll"
            aria-hidden="true"
            style={
              {
                "--sn-carousel-thumb": total ? 1 / total : 1,
                "--sn-carousel-scroll": progress * Math.max(0, total - 1)
              } as CSSProperties
            }
          >
            <span />
          </span>
        </div>
      ) : (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.arrow}
            aria-controls={trackId}
            aria-label={prevLabel}
            disabled={atStart}
            onClick={() => goTo(index - 1)}
            data-cursor-magnetic=""
          >
            <Arrow flip />
          </button>
          <span className={styles.count} aria-hidden="true">
            {pad(index + 1)} <span>/ {pad(total)}</span>
          </span>
          <span className={styles.progress} aria-hidden="true">
            <span
              style={{ "--sn-carousel-progress": total ? (index + 1) / total : 0 } as CSSProperties}
            />
          </span>
          {autoplay > 0 && !reduced ? (
            <button
              type="button"
              className={styles.toggle}
              aria-pressed={paused}
              onClick={() => setPaused((value) => !value)}
            >
              {paused ? playLabel : pauseLabel}
            </button>
          ) : null}
          <button
            type="button"
            className={styles.arrow}
            aria-controls={trackId}
            aria-label={nextLabel}
            disabled={atEnd}
            onClick={() => goTo(index + 1)}
            data-cursor-magnetic=""
          >
            <Arrow />
          </button>
        </div>
      )}

      <p className={styles.srOnly} aria-live={playing ? "off" : "polite"} aria-atomic="true">
        {enhanced ? slideLabel(index, total) : null}
      </p>
    </section>
  );
}
