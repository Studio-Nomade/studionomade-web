import Image from "next/image";
import Link from "next/link";
import { Parallax } from "@studionomade/ui";
import { AREA_LABELS, type PublicProject } from "../../../content/projects";
import styles from "./case-next.module.css";

/**
 * "Siguiente proyecto" (sitio legado): un enlace grande con la portada del caso
 * siguiente a sangre, el título en Inter fino y la invitación a seguir. No
 * secuestra el scroll: avanzar es un clic, como cualquier enlace.
 */
export function CaseNext({ project }: { project: PublicProject }) {
  return (
    <nav className={styles.next} aria-label="Siguiente proyecto">
      <Link href={`/proyectos/${project.slug}`} className={styles.link} data-cursor-label="Ver">
        <Parallax y={0.08} clip className={styles.media}>
          <span className={styles.frame}>
            <Image src={project.cover.src} alt="" fill sizes="100vw" />
          </span>
        </Parallax>
        <span className={styles.shade} aria-hidden="true" />
        <span className={styles.copy}>
          <span className={styles.eyebrow}>Siguiente proyecto</span>
          <span className={styles.title}>{project.title}</span>
          <span className={styles.meta}>
            {project.areaCode} · {AREA_LABELS[project.areaCode]}
          </span>
          <span className={styles.hint} aria-hidden="true">
            Sigue deslizando
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </span>
        </span>
      </Link>
    </nav>
  );
}
