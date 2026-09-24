import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicPage, publicStyles as styles } from "../../../components/public/public-shell";
import { getPublicProject, publicProjects } from "../../../content/projects";

export function generateStaticParams() {
  return publicProjects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const project = getPublicProject((await params).slug);
  if (!project) return {};
  return {
    title: `${project.title} | Studio Nomade`,
    description: project.summary,
    alternates: { canonical: `/proyectos/${project.slug}` },
    openGraph: { title: project.title, description: project.summary, images: [project.cover] }
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getPublicProject((await params).slug);
  if (!project) notFound();
  const related = publicProjects.find((item) => item.slug !== project.slug);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    creator: { "@type": "Organization", name: "Studio Nomade" },
    dateCreated: project.year
  };
  return (
    <PublicPage>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c")
        }}
      />
      <section className={styles.caseHero}>
        <Image src={project.cover} alt="" fill priority sizes="100vw" />
        <div className={styles.caseTitle}>
          <p>
            {project.area} · {project.year}
          </p>
          <h1>{project.title}</h1>
        </div>
      </section>
      <section className={styles.section}>
        <p className={styles.lead}>{project.summary}</p>
      </section>
      <section className={`${styles.section} ${styles.columns}`}>
        <article>
          <h2>Desafío</h2>
          <p>{project.challenge}</p>
        </article>
        <article>
          <h2>Estrategia</h2>
          <p>{project.strategy}</p>
        </article>
        <article>
          <h2>Resultado</h2>
          <p>{project.result}</p>
        </article>
      </section>
      <section className={`${styles.section} ${styles.gallery}`}>
        {project.gallery.map((src) => (
          <Image key={src} src={src} alt="" width={900} height={700} />
        ))}
      </section>
      {related && (
        <section className={styles.cta}>
          <h2>Siguiente proyecto</h2>
          <Link href={`/proyectos/${related.slug}`}>{related.title} →</Link>
        </section>
      )}
    </PublicPage>
  );
}
