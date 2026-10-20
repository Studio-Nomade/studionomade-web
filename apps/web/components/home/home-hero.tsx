import Image from "next/image";
import Link from "next/link";
import { AREA_LABELS, type HomeFeaturedProject } from "../../content/home";
import { HeroCarousel } from "./hero-carousel";
import { HeroTitle } from "./hero-title";
import styles from "./home-hero.module.css";

/** Avance automático lento: el título termina de armarse mucho antes del cambio. */
export const HERO_AUTOPLAY_MS = 7000;

/**
 * Hero a pantalla completa con los proyectos destacados.
 *
 * Base `Carousel variant="full"` (scroll-snap nativo, flechas, contador, barra
 * de progreso y autoplay con pausa). Cada diapositiva es un enlace al caso con
 * el cursor "Ver"; su título se arma por letras al activarse (`data-active`).
 * La primera imagen es el LCP: va con `priority` y el resto en diferido.
 */
export function HomeHero({ projects }: { projects: HomeFeaturedProject[] }) {
  return (
    <div className={styles.hero}>
      <HeroCarousel
        className={styles.carousel}
        titles={projects.map((project) => project.title)}
        autoplay={HERO_AUTOPLAY_MS}
      >
        {projects.map((project, index) => (
          <article className={styles.slide} key={project.slug} data-accent={project.area}>
            <div className={styles.media} data-focus={project.image.focus}>
              <Image
                src={project.image.src}
                alt={project.image.alt}
                fill
                priority={index === 0}
                sizes="100vw"
              />
            </div>
            <div className={styles.shade} aria-hidden="true" />
            {/* Toda la diapositiva es el enlace; el pie de foto queda encima sin
                capturar el puntero. */}
            <Link
              className={styles.cover}
              href={`/proyectos/${project.slug}`}
              data-cursor-label="Ver"
            >
              <span className={styles.srOnly}>Ver proyecto {project.title}</span>
            </Link>
            <div className={styles.caption}>
              <p className={styles.meta}>
                <span className={styles.code}>{project.code}</span>
                <span>{AREA_LABELS[project.code]}</span>
              </p>
              <HeroTitle title={project.title} />
              <p className={styles.details}>
                <span className={styles.year}>{project.year}</span>
                <span className={styles.disciplines}>{project.disciplines.join(" · ")}</span>
              </p>
              <span className={styles.link} aria-hidden="true">
                Ver proyecto
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M4 12h15M13 6l6 6-6 6" />
                </svg>
              </span>
            </div>
          </article>
        ))}
      </HeroCarousel>
    </div>
  );
}
