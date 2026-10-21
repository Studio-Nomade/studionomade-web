"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent
} from "react";
import type { HomeHeroSlide, HomeHeroVideo } from "../../content/home";
import { HeroTitle } from "./hero-title";
import styles from "./home-hero.module.css";

/** Tiempo de cada diapositiva: lo marca el relleno del botón «Ver proyecto». */
export const HERO_INTERVAL_MS = 6000;

/** Desplazamiento horizontal mínimo (px) para que un gesto táctil cambie de diapositiva. */
const SWIPE_MIN = 48;

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * Video de fondo de una diapositiva: solo corre la activa y nunca con
 * movimiento reducido (queda el `poster`). Es decorativo: el texto va aparte.
 */
function HeroVideo({
  video,
  active,
  reduced
}: {
  video: HomeHeroVideo;
  active: boolean;
  reduced: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    // `play()` rechaza si el navegador bloquea el autoplay: queda el poster.
    if (active && !reduced) Promise.resolve(element.play()).catch(() => {});
    else element.pause();
  }, [active, reduced]);

  return (
    <video
      ref={ref}
      className={styles.video}
      poster={video.poster}
      muted
      loop
      playsInline
      preload={active ? "auto" : "none"}
      aria-hidden="true"
    >
      <source src={video.src} type={video.type} />
    </video>
  );
}

/**
 * Hero a pantalla completa con los proyectos destacados (referencia: mubien.com).
 *
 * Las diapositivas se apilan y cambian por fundido. Abajo, al centro, el botón
 * «Ver proyecto · <Nombre>» enlaza al caso y se va llenando con una capa más
 * oscura: esa animación CSS ES el temporizador (al terminar, `animationend`
 * avanza), así que pausarla con `animation-play-state` conserva el progreso.
 *
 * Se pausa con el cursor sobre los controles, con foco de teclado dentro, con
 * el botón de pausa y fuera de pantalla. Con `prefers-reduced-motion` no hay
 * autoplay, fundido ni relleno. Sin JavaScript se ve la primera diapositiva.
 */
export function HomeHero({
  slides,
  interval = HERO_INTERVAL_MS
}: {
  slides: HomeHeroSlide[];
  interval?: number;
}) {
  const total = slides.length;
  const slidesId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  const [active, setActive] = useState(0);
  /** Reinicia el relleno aunque se vuelva a la misma diapositiva. */
  const [cycle, setCycle] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [stopped, setStopped] = useState(false);
  /** La región viva solo habla tras una acción de la persona, no con el autoplay. */
  const [announce, setAnnounce] = useState(false);

  useEffect(() => {
    setEnhanced(true);
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.25
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const goTo = useCallback(
    (index: number, manual = false) => {
      setActive(((index % total) + total) % total);
      setCycle((value) => value + 1);
      setAnnounce(manual);
    },
    [total]
  );

  const autoplay = enhanced && !reduced && total > 1;
  const running = autoplay && !stopped && !hovered && !focused && visible;
  const current = slides[active];

  if (!current) return null;

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowRight") goTo(active + 1, true);
    else if (event.key === "ArrowLeft") goTo(active - 1, true);
    else return;
    event.preventDefault();
  };

  // Pausa solo con foco de teclado: un clic en una flecha no debe congelar el autoplay.
  const onFocus = (event: FocusEvent<HTMLElement>) => {
    if (event.target instanceof Element && event.target.matches(":focus-visible")) setFocused(true);
  };
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    swiped.current = false;
    swipe.current = event.pointerType === "mouse" ? null : { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(event.clientY - start.y)) return;
    swiped.current = true;
    goTo(active + (dx < 0 ? 1 : -1), true);
  };
  // Un deslizamiento no debe abrir el caso que quedó bajo el dedo.
  const onClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!swiped.current) return;
    swiped.current = false;
    event.preventDefault();
  };

  return (
    <section
      ref={rootRef}
      className={styles.hero}
      aria-roledescription="carousel"
      aria-label="Proyectos destacados"
      data-enhanced={enhanced || undefined}
      data-autoplay={autoplay || undefined}
      data-paused={!running || undefined}
      style={{ "--home-hero-interval": `${interval}ms` } as CSSProperties}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (swipe.current = null)}
      onClickCapture={onClickCapture}
    >
      <div className={styles.slides} id={slidesId}>
        {slides.map((slide, index) => {
          const isActive = index === active;
          return (
            <div
              key={slide.slug}
              className={styles.slide}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} de ${total}: ${slide.title}`}
              aria-hidden={!isActive || undefined}
              data-active={isActive || undefined}
              data-accent={slide.area}
            >
              <div className={styles.media} data-focus={slide.image.focus}>
                {slide.video ? (
                  <HeroVideo video={slide.video} active={isActive} reduced={reduced} />
                ) : (
                  <Image
                    src={slide.image.src}
                    alt={slide.image.alt}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                  />
                )}
              </div>
              <div className={styles.shade} aria-hidden="true" />
              {/* La imagen también lleva al caso con el cursor «Ver»; para teclado y
                  lectores el enlace es el botón de abajo. */}
              {isActive ? (
                <Link
                  className={styles.cover}
                  href={slide.href}
                  tabIndex={-1}
                  aria-hidden="true"
                  data-cursor-label="Ver"
                />
              ) : null}
              <div className={styles.caption}>
                <p className={styles.meta}>
                  <span className={styles.code}>{slide.code}</span>
                  <span>{slide.areaName}</span>
                </p>
                <HeroTitle title={slide.title} />
                <p className={styles.details}>
                  <span className={styles.year}>{slide.year}</span>
                  {slide.disciplines.length > 0 ? (
                    <span>{slide.disciplines.join(" · ")}</span>
                  ) : null}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={styles.controls}
        onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <p className={styles.counter} aria-hidden="true">
          <span className={styles.counterCurrent}>{pad(active + 1)}</span>
          <span className={styles.counterTotal}> / {pad(total)}</span>
        </p>

        <Link
          className={styles.pill}
          href={current.href}
          aria-label={`Ver proyecto ${current.title}`}
          data-accent={current.area}
        >
          <span
            key={`${active}-${cycle}`}
            className={styles.progress}
            aria-hidden="true"
            onAnimationEnd={() => goTo(active + 1)}
          />
          <span className={styles.pillCode} aria-hidden="true">
            {current.code}
          </span>
          <span className={styles.pillText} aria-hidden="true">
            Ver proyecto <span className={styles.pillDot}>·</span>{" "}
            <span className={styles.pillName}>{current.title}</span>
          </span>
        </Link>

        <div className={styles.nav}>
          {autoplay ? (
            <button
              type="button"
              className={styles.navButton}
              onClick={() => setStopped((value) => !value)}
              aria-label={stopped ? "Reanudar presentación" : "Pausar presentación"}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                {stopped ? <path d="M8 5.5v13l10.5-6.5z" /> : <path d="M8 5v14M16 5v14" />}
              </svg>
            </button>
          ) : null}
          <button
            type="button"
            className={styles.navButton}
            onClick={() => goTo(active - 1, true)}
            aria-label="Proyecto anterior"
            aria-controls={slidesId}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M20 12H5M11 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => goTo(active + 1, true)}
            aria-label="Proyecto siguiente"
            aria-controls={slidesId}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M4 12h15M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <p className={styles.srOnly} aria-live={announce ? "polite" : "off"} aria-atomic="true">
        {`Proyecto ${active + 1} de ${total}: ${current.title}`}
      </p>
    </section>
  );
}
