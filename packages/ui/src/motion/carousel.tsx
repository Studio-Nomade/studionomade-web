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
   * Dónde van las flechas. `bar` (por defecto): flechas, contador y barra bajo
   * el carril · `sides`: flechas a los lados de la diapositiva y, debajo, una
   * barra segmentada (un tramo por diapositiva).
   */
  layout?: "bar" | "sides";
  /**
   * `full` (por defecto): flechas y su indicador según `layout` · `progress`:
   * sin flechas ni contador, solo una barra fina cuyo indicador sigue al
   * scroll real (riel de mockups). Con `progress`, `layout` no aplica.
   */
  controls?: "full" | "progress";
  /** Texto o bloque que acompaña al riel: columna izquierda en escritorio, encima en móvil. */
  lead?: ReactNode;
  /**
   * Etiquetas de cada diapositiva ("Mockup 01"). Nombran cada diapositiva y,
   * con JS, se muestran como botones bajo el indicador (`aria-current` en la actual).
   */
  labels?: string[];
  /** Pinta el indicador activo (tramo, barra o pulgar) con `--accent`. */
  accent?: boolean;
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
  /** Nombre de cada diapositiva para lectores de pantalla (si no hay `labels`). */
  slideLabel?: (index: number, total: number) => string;
  className?: string;
}

const pad = (value: number) => String(value).padStart(2, "0");
const defaultSlideLabel = (index: number, total: number) => `${index + 1} de ${total}`;
/** Desplazamiento mínimo (px) para que un arrastre con ratón no sea un clic. */
const DRAG_THRESHOLD = 4;

function Chevron({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 12 22" aria-hidden="true" focusable="false" data-flip={flip || undefined}>
      <path d="M1 1l10 10L1 21" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function Arrow({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" data-flip={flip || undefined}>
      <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/**
 * Anula el clic que el navegador emite al soltar un arrastre. Se escucha en
 * `window` en fase de captura para adelantarse a todo: al `onClick` de React,
 * a `next/link` y a la cortina de `PageTransition` (que captura en `document`),
 * así arrastrar el hero de la Home no abre el caso de la diapositiva.
 */
function suppressNextClick() {
  const stop = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  window.addEventListener("click", stop, { capture: true, once: true });
  // El clic llega en la misma tarea que el pointerup; si no llega, se retira.
  setTimeout(() => window.removeEventListener("click", stop, { capture: true }), 0);
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
 * Carrusel para heros, galerías, rieles de mockups y sliders de casos.
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
  layout = "bar",
  controls = "full",
  lead,
  labels,
  accent = false,
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
    suppressNextClick();
    trackRef.current?.releasePointerCapture?.(event.pointerId);
    setDragging(false);
    if (trackRef.current) goTo(nearestSlide(trackRef.current));
  };

  const progressOnly = controls === "progress";
  const sides = layout === "sides" && !progressOnly;
  const atStart = !loop && index === 0;
  const atEnd = !loop && index === total - 1;

  const arrow = (direction: "prev" | "next") => (
    <button
      type="button"
      className={styles.arrow}
      aria-controls={trackId}
      aria-label={direction === "prev" ? prevLabel : nextLabel}
      disabled={direction === "prev" ? atStart : atEnd}
      onClick={() => goTo(index + (direction === "prev" ? -1 : 1))}
      data-direction={direction}
      data-cursor-magnetic=""
    >
      {sides ? <Chevron flip={direction === "prev"} /> : <Arrow flip={direction === "prev"} />}
    </button>
  );

  const toggle =
    autoplay > 0 && !reduced ? (
      <button
        type="button"
        className={styles.toggle}
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
      >
        {paused ? playLabel : pauseLabel}
      </button>
    ) : null;

  const tabs = labels?.length ? (
    <div className={styles.labels}>
      {labels.slice(0, total).map((text, labelIndex) => (
        <button
          type="button"
          key={`${labelIndex}-${text}`}
          className={styles.label}
          aria-controls={trackId}
          aria-current={labelIndex === index || undefined}
          onClick={() => goTo(labelIndex)}
        >
          {text}
        </button>
      ))}
    </div>
  ) : null;

  const track = (
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
      onDragStart={(event) => event.preventDefault()}
    >
      {slides.map((slide, slideIndex) => (
        <div
          className={styles.slide}
          key={slideIndex}
          role="group"
          aria-roledescription="diapositiva"
          aria-label={labels?.[slideIndex] ?? slideLabel(slideIndex, total)}
          data-active={slideIndex === index || undefined}
        >
          {slide}
        </div>
      ))}
    </div>
  );

  let indicator: ReactNode;
  if (progressOnly) {
    indicator = (
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
        {toggle}
      </div>
    );
  } else if (sides) {
    indicator = (
      <div className={styles.meta}>
        <span className={styles.segments} aria-hidden="true">
          <span
            style={
              {
                "--sn-carousel-progress": index,
                "--sn-step-count": Math.max(1, total)
              } as CSSProperties
            }
          />
        </span>
        {tabs}
        {toggle}
      </div>
    );
  } else {
    indicator = (
      <div className={styles.controls}>
        {arrow("prev")}
        <span className={styles.count} aria-hidden="true">
          {pad(index + 1)} <span>/ {pad(total)}</span>
        </span>
        <span className={styles.progress} aria-hidden="true">
          <span
            style={{ "--sn-carousel-progress": total ? (index + 1) / total : 0 } as CSSProperties}
          />
        </span>
        {toggle}
        {arrow("next")}
      </div>
    );
  }

  return (
    <section
      className={[styles.carousel, className].filter(Boolean).join(" ")}
      aria-roledescription="carrusel"
      aria-label={label}
      data-variant={variant}
      data-layout={sides ? "sides" : "bar"}
      data-controls={controls}
      data-lead={lead ? "" : undefined}
      data-invert={invert || undefined}
      data-accent-progress={accent || undefined}
      data-enhanced={enhanced || undefined}
      data-dragging={dragging || undefined}
      onKeyDown={onKeyDown}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
    >
      {lead ? <div className={styles.lead}>{lead}</div> : null}

      {sides ? (
        <div className={styles.stage}>
          {arrow("prev")}
          {track}
          {arrow("next")}
        </div>
      ) : (
        track
      )}

      {indicator}
      {sides ? null : tabs}

      <p className={styles.srOnly} aria-live={playing ? "off" : "polite"} aria-atomic="true">
        {enhanced ? [labels?.[index], slideLabel(index, total)].filter(Boolean).join(", ") : null}
      </p>
    </section>
  );
}
