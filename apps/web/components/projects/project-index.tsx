import Image from "next/image";
import Link from "next/link";
import { Reveal, SplitText } from "@studionomade/ui";
import { AREA_LABELS, type PublicProject } from "../../content/projects";
import styles from "./project-index.module.css";

/**
 * Listado de casos (referencia: mubien.com/work). Cuadrícula de borde a borde
 * con el margen del sitio, dos columnas en escritorio y una en móvil, con una
 * sola imagen por proyecto.
 *
 * Con puntero fino, al pasar el cursor (o al enfocar con teclado) aparece un
 * recuadro claro abajo a la izquierda con la sigla del área, el nombre, la
 * bajada y un texto corto. En touch o pantallas angostas el recuadro va siempre
 * bajo la imagen. Todo es CSS: el componente sigue siendo de servidor.
 */
export function ProjectIndex({ projects }: { projects: PublicProject[] }) {
  return (
    <div className={styles.index}>
      <header className={styles.header}>
        <SplitText as="h1" by="chars" className={styles.title}>
          Proyectos
        </SplitText>
        <Reveal as="p" delay={0.3} className={styles.lead}>
          Identidades, espacios y experiencias que diseñamos junto a nuestros clientes.
        </Reveal>
      </header>
      <ul className={styles.grid}>
        {projects.map((project, index) => (
          <li
            key={project.slug}
            className={styles.item}
            data-accent={project.accent ?? project.area}
          >
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
                  sizes="(max-width: 48em) 100vw, 50vw"
                  priority={index < 2}
                />
              </Reveal>
              <div className={styles.panel}>
                <p className={styles.code}>
                  {project.areaCode}
                  <span className={styles.srOnly}> · {AREA_LABELS[project.areaCode]}</span>
                </p>
                <h2 className={styles.name}>{project.displayName}</h2>
                <p className={styles.tagline}>{project.tagline}</p>
                <p className={styles.excerpt}>{project.excerpt}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
