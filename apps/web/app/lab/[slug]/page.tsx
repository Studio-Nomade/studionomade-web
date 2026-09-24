import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLabPrototype, LAB_PROTOTYPES } from "../../../content/lab";
import { PublicPage } from "../../../components/public/public-shell";
import styles from "../../../components/public/public.module.css";
import { ContactForm } from "../../../components/public/contact-form";

export function generateStaticParams() {
  return LAB_PROTOTYPES.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const item = getLabPrototype((await params).slug);
  return item
    ? {
        title: `${item.title} | Digital Lab`,
        description: item.description,
        robots: { index: false, follow: false }
      }
    : {};
}
export default async function LabDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const item = getLabPrototype((await params).slug);
  if (!item) notFound();
  const prototypeBase =
    process.env.NEXT_PUBLIC_PROTOTYPES_URL ?? "https://prototipos.studionomade.cl";
  return (
    <PublicPage>
      <section className={styles.section}>
        <p className={styles.eyebrow}>Experimento · v{item.version}</p>
        <h1>{item.title}</h1>
        <p className={styles.lead}>{item.description}</p>
        <p>Este prototipo usa exclusivamente datos ficticios y no captura información personal.</p>
        <p>
          <a href={`${prototypeBase}/${item.slug}/`} rel="noopener noreferrer">
            Abrir prototipo aislado
          </a>
        </p>
        <p>
          <Link href="/lab">Volver al Lab</Link>
        </p>
        <h2>¿Quieres explorar una versión para tu proyecto?</h2>
        <ContactForm origin={item.slug} originType="prototipo" sourcePath={`/lab/${item.slug}`} />
      </section>
    </PublicPage>
  );
}
