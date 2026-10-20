import Image from "next/image";
import Link from "next/link";
import { Reveal, SplitText } from "@studionomade/ui";
import { AREA_LABELS, type PublicProject } from "../../content/projects";
import styles from "./project-index.module.css";

/**
 * Listado de casos: grilla de dos columnas con portada en máscara, código de
 * área y zoom al hover. Cada tarjeta lleva el acento de su caso en la marca de
 * área (decorativa; el texto queda en neutro para cumplir AA).
 */
export function ProjectIndex({ projects }: { projects: PublicProject[] }) {
  return (
    <div className={styles.index}>
      <header className={styles.header}>
        <SplitText as="h1" by="chars" className={styles.title}>
          Proyectos
        </SplitText>
        <Reveal as="p" delay={0.3} className={styles.lead}>
          Ideas que se transforman en identidades, espacios y experiencias memorables.
        </Reveal>
      </header>
      <ul className={styles.grid}>
        {projects.map((project, index) => (
          <li key={project.slug} data-accent={project.accent ?? project.area}>
            <Link
              href={`/proyectos/${project.slug}`}
              className={styles.card}
              data-cursor-label="Ver"
            >
              <Reveal preset="mask" step={index % 2} className={styles.media}>
                <Image
                  src={project.cover.src}
                  alt=""
                  fill
                  sizes="(max-width: 48em) 100vw, 45vw"
                  priority={index < 2}
                />
              </Reveal>
              <span className={styles.meta}>
                <span className={styles.code}>
                  {project.areaCode}
                  <span className={styles.srOnly}> {AREA_LABELS[project.areaCode]}</span>
                </span>
                <span>{project.year}</span>
              </span>
              <span className={styles.name}>{project.title}</span>
              <span className={styles.summary}>{project.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
