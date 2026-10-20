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
  /** Al llegar al final, la flecha siguiente vuelve al inicio. */
  loop?: boolean;
  /** Avance automático en ms. `0` lo desactiva; nunca corre con movimiento reducido. */
  autoplay?: number;
  /** Controles en blanco, para fondos oscuros o imágenes. */
  invert?: boolean;
  /**
   * `bar` (por defecto): flechas, contador y barra bajo el carril ·
   * `sides`: flechas a los lados de la diapositiva y, debajo, una barra
   * segmentada (un tramo por diapositiva) con etiquetas clicables.
   */
  layout?: "bar" | "sides";
  /** Etiquetas de cada diapositiva ("Mockup 01"). Con `layout="sides"` son botones. */
  labels?: string[];
  /** Pinta el tramo activo de la barra con `--accent`. */
  accent?: boolean;
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
 * Carrusel con flechas, contador y barra de progreso, para heros y galerías.
 *
 * La base es un carril con `scroll-snap` nativo: sin JavaScript se desliza con
 * el dedo, el trackpad o la barra, y cada diapositiva es alcanzable. Al hidratar
 * aparecen los controles (`data-enhanced`), el teclado (← → Inicio Fin) y el
 * anuncio de la diapositiva actual.
 */
export function Carousel({
  children,
  label,
  variant = "full",
  loop = false,
  autoplay = 0,
  invert = false,
  layout = "bar",
  labels,
  accent = false,
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
  const [enhanced, setEnhanced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [reduced, setReduced] = useState(false);

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

  // El índice sigue al scroll real: el usuario también puede arrastrar.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
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
        setIndex(closest);
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
      {layout === "sides" ? (
        <Chevron flip={direction === "prev"} />
      ) : (
        <Arrow flip={direction === "prev"} />
      )}
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

  const track = (
    <div className={styles.track} id={trackId} ref={trackRef} tabIndex={0}>
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

  return (
    <section
      className={[styles.carousel, className].filter(Boolean).join(" ")}
      aria-roledescription="carrusel"
      aria-label={label}
      data-variant={variant}
      data-layout={layout}
      data-invert={invert || undefined}
      data-accent-progress={accent || undefined}
      data-enhanced={enhanced || undefined}
      onKeyDown={onKeyDown}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
    >
      {layout === "sides" ? (
        <>
          <div className={styles.stage}>
            {arrow("prev")}
            {track}
            {arrow("next")}
          </div>
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
            {labels?.length ? (
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
            ) : null}
            {toggle}
          </div>
        </>
      ) : (
        <>
          {track}
          <div className={styles.controls}>
            {arrow("prev")}
            <span className={styles.count} aria-hidden="true">
              {pad(index + 1)} <span>/ {pad(total)}</span>
            </span>
            <span className={styles.progress} aria-hidden="true">
              <span
                style={
                  { "--sn-carousel-progress": total ? (index + 1) / total : 0 } as CSSProperties
                }
              />
            </span>
            {toggle}
            {arrow("next")}
          </div>
        </>
      )}

      <p className={styles.srOnly} aria-live={playing ? "off" : "polite"} aria-atomic="true">
        {enhanced ? [labels?.[index], slideLabel(index, total)].filter(Boolean).join(", ") : null}
      </p>
    </section>
  );
}
