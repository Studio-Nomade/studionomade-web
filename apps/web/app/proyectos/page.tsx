import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicPage, publicStyles as styles } from "../../components/public/public-shell";
import { publicProjects } from "../../content/projects";

export const metadata: Metadata = {
  title: "Proyectos | Studio Nomade",
  description: "Casos de branding, arquitectura, audiovisual y experiencias de Studio Nomade.",
  alternates: { canonical: "/proyectos" }
};

export default function ProjectsPage() {
  return (
    <PublicPage>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Trabajo seleccionado</p>
          <h1 className={styles.display}>PROYECTOS</h1>
        </div>
        <p className={styles.lead}>
          Ideas que se transforman en identidades, espacios y experiencias memorables.
        </p>
      </section>
      <section className={styles.section}>
        <div className={styles.grid}>
          {publicProjects.map((project) => (
            <Link className={styles.card} href={`/proyectos/${project.slug}`} key={project.slug}>
              <div className={styles.media}>
                <Image src={project.cover} alt="" fill sizes="(max-width: 48em) 100vw, 50vw" />
              </div>
              <h2>{project.title}</h2>
              <p>
                {project.client} · {project.year}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </PublicPage>
  );
}
