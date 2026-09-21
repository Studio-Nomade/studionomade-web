import Image from "next/image";
import Link from "next/link";
import type { AreaContent } from "../../content/areas";
import styles from "./area-page.module.css";

const team = [
  ["Anna Sanhueza", "Directora Creativa"],
  ["Sebastian Robles", "Dirección Arquitectura"],
  ["Javiera Díaz", "Directora de Arte"],
  ["Catalina Torres", "Planner & Art"],
  ["Fa Casol", "Branding"]
];

export function AreaPage({ area }: { area: AreaContent }) {
  const otherArea = area.slug === "branding" ? "architecture" : "branding";

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.wordmark}>
          STUDIO NOMADE
        </Link>
        <Link href="/#servicios" className={styles.back}>
          Volver <span aria-hidden="true">—</span>
        </Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroHeading}>
          <p>{area.services.join(" · ")}</p>
          <h1>{area.title}</h1>
        </div>
        <blockquote>“{area.quote}”</blockquote>
      </section>

      {area.mockups.length ? (
        <section className={styles.mockups}>
          <p>{area.note}</p>
          <div>
            {area.mockups.map((src) => (
              <Image key={src} src={src} alt="" width={480} height={600} />
            ))}
          </div>
        </section>
      ) : (
        <section className={styles.archHero}>
          <Image src={area.heroImage} alt="Proyecto de arquitectura" fill sizes="80vw" />
          <p>{area.note}</p>
        </section>
      )}

      <section className={styles.question}>
        <h2>¿Qué hacemos?</h2>
        <p>{area.what}</p>
      </section>

      <section className={styles.split}>
        <div className={styles.media}>
          <Image src={area.collateral[0]} alt="" fill sizes="(max-width: 48em) 100vw, 50vw" />
        </div>
        <div className={styles.values}>
          {area.values.map((value, index) => (
            <article key={value.title}>
              <span>0{index + 1}</span>
              <h3>{value.title}</h3>
              <p>{value.body}</p>
            </article>
          ))}
        </div>
      </section>

      {area.stats.length > 0 && (
        <section className={`${styles.split} ${styles.statsSplit}`}>
          <div className={styles.stats}>
            {area.stats.map((stat) => (
              <div key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
          <div className={styles.media}>
            <Image src={area.collateral[1]} alt="" fill sizes="(max-width: 48em) 100vw, 50vw" />
          </div>
        </section>
      )}

      <section className={styles.projects}>
        <div className={styles.sectionTitle}>
          <p>Una selección del trabajo</p>
          <h2>Proyectos</h2>
        </div>
        <div className={styles.projectGrid}>
          {area.projects.map((project) => (
            <article className={project.wide ? styles.wide : undefined} key={project.title}>
              <div>
                <Image
                  src={project.src}
                  alt={project.title}
                  fill
                  sizes="(max-width: 48em) 100vw, 50vw"
                />
              </div>
              <h3>{project.title}</h3>
              <p>{project.meta}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.method}>
        <div className={styles.sectionTitle}>
          <p>¿Cómo lo hacemos?</p>
          <h2>Metodología</h2>
        </div>
        <div>
          <h3>Entender antes de crear.</h3>
          <p>{area.method}</p>
          <div className={styles.tags}>
            {area.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.deliverables}>
        <div>
          <h3>Outputs</h3>
          <p>{area.outputs}</p>
          <h3>Tipos de proyecto</h3>
          <ul>
            {area.types.map((type) => (
              <li key={type}>{type}</li>
            ))}
          </ul>
          <h3>Resultados</h3>
          <p>{area.results}</p>
        </div>
        <div className={styles.sectionTitle}>
          <p>¿Qué entregamos?</p>
          <h2>Entregables</h2>
        </div>
      </section>

      <section className={styles.team}>
        <h2>Conoce al equipo</h2>
        <div>
          {team.map(([name, role]) => (
            <article key={name}>
              <div aria-hidden="true" />
              <h3>{name}</h3>
              <p>{role}</p>
            </article>
          ))}
        </div>
      </section>

      <nav className={styles.areaNav} aria-label="Áreas de Studio Nomade">
        <p>Sigue explorando</p>
        <Link href={`/areas/${otherArea}`}>
          {otherArea === "branding" ? "Branding & Design" : "Architecture & Design"}
          <span>Ir →</span>
        </Link>
      </nav>

      <section className={styles.cta}>
        <p>Podemos ayudarte. ¡Conversemos!</p>
        <h2>
          ¿Tienes algún
          <br />
          proyecto en mente?
        </h2>
        <Link href="/#contacto">Agenda una reunión</Link>
      </section>

      <footer className={styles.footer}>
        <Link href="/">STUDIO NOMADE</Link>
        <p>Nos movemos en manada · Santiago | Madrid</p>
        <p>contact@studionomade.cl</p>
      </footer>
    </main>
  );
}
