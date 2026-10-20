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

  return (
    <section
      className={[styles.carousel, className].filter(Boolean).join(" ")}
      aria-roledescription="carrusel"
      aria-label={label}
      data-variant={variant}
      data-invert={invert || undefined}
      data-enhanced={enhanced || undefined}
      onKeyDown={onKeyDown}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
    >
      <div className={styles.track} id={trackId} ref={trackRef} tabIndex={0}>
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

      <p className={styles.srOnly} aria-live={playing ? "off" : "polite"} aria-atomic="true">
        {enhanced ? slideLabel(index, total) : null}
      </p>
    </section>
  );
}
