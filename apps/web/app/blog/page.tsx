import type { Metadata } from "next";
import Link from "next/link";

import { PostCard } from "../../components/blog/post-card";
import styles from "../../components/blog/blog.module.css";
import { PublicPage } from "../../components/public/public-shell";
import { getBlogPosts } from "../../lib/blog/source";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog | Studio Nomade",
  description:
    "Notas de Studio Nomade sobre branding, arquitectura, audiovisual, diseño web y la forma en que trabajamos.",
  alternates: { canonical: "/blog" }
};

const PAGE_SIZE = 9;

export default async function BlogIndexPage({
  searchParams
}: {
  searchParams: Promise<{ categoria?: string; pagina?: string }>;
}) {
  const { categoria, pagina } = await searchParams;
  const posts = await getBlogPosts();
  const categories = [...new Set(posts.map((post) => post.category))];
  const active = categoria && categories.includes(categoria) ? categoria : undefined;
  const filtered = active ? posts.filter((post) => post.category === active) : posts;

  const page = Math.max(1, Number.parseInt(pagina ?? "1", 10) || 1);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const [featured, ...rest] = current === 1 ? slice : [undefined, ...slice];

  const href = (params: { categoria?: string; pagina?: number }) => {
    const query = new URLSearchParams();
    if (params.categoria) query.set("categoria", params.categoria);
    if (params.pagina && params.pagina > 1) query.set("pagina", String(params.pagina));
    const qs = query.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  return (
    <PublicPage headerTone="light">
      <section className={styles.index} aria-labelledby="blog-title">
        <header className={styles.indexHead}>
          <h1 id="blog-title" className={styles.indexTitle}>
            Blog
          </h1>
          <p className={styles.indexLead}>
            Ideas, procesos y aprendizajes del estudio: marcas, espacios, contenido y experiencias
            digitales.
          </p>
        </header>

        {categories.length > 1 ? (
          <nav className={styles.filters} aria-label="Categorías del blog">
            <Link href={href({})} aria-current={!active ? "page" : undefined}>
              Todas
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                href={href({ categoria: category })}
                aria-current={active === category ? "page" : undefined}
              >
                {category}
              </Link>
            ))}
          </nav>
        ) : null}

        {filtered.length === 0 ? (
          <p className={styles.empty}>Aún no hay notas en esta categoría.</p>
        ) : (
          <>
            {featured ? <PostCard post={featured} featured /> : null}
            {rest.length ? (
              <div className={styles.grid}>
                {rest.map((post) => (post ? <PostCard key={post.slug} post={post} /> : null))}
              </div>
            ) : null}
          </>
        )}

        {pages > 1 ? (
          <nav className={styles.pagination} aria-label="Páginas del blog">
            {current > 1 ? (
              <Link href={href({ categoria: active, pagina: current - 1 })}>← Anteriores</Link>
            ) : (
              <span />
            )}
            <span>
              {current} / {pages}
            </span>
            {current < pages ? (
              <Link href={href({ categoria: active, pagina: current + 1 })}>Siguientes →</Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </section>
    </PublicPage>
  );
}
