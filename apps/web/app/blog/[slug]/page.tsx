import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogBodyToPlainText, readingMinutes } from "@studionomade/content-schema";

import { BlogBodyContent } from "../../../components/blog/blog-body";
import { PostCard } from "../../../components/blog/post-card";
import styles from "../../../components/blog/blog.module.css";
import { PublicPage } from "../../../components/public/public-shell";
import { AREA_BY_SLUG } from "../../../content/area-meta";
import { formatPostDate } from "../../../lib/blog/format";
import { getBlogPost, getBlogPosts } from "../../../lib/blog/source";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getBlogPosts()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = await getBlogPost((await params).slug);
  if (!post) return {};
  return {
    title: `${post.title} | Blog Studio Nomade`,
    description: post.excerpt || blogBodyToPlainText(post.body).slice(0, 160),
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      images: post.cover ? [{ url: post.cover.src, alt: post.cover.alt }] : undefined
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = await getBlogPosts();
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();

  const area = post.area ? AREA_BY_SLUG[post.area] : undefined;
  const related = posts
    .filter((item) => item.slug !== post.slug)
    .sort(
      (a, b) =>
        Number(b.category === post.category) - Number(a.category === post.category) ||
        b.publishedAt.localeCompare(a.publishedAt)
    )
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    image: post.cover?.src,
    articleSection: post.category,
    keywords: post.tags.join(", "),
    author: { "@type": "Organization", name: post.author ?? "Studio Nomade" },
    publisher: { "@type": "Organization", name: "Studio Nomade" }
  };

  return (
    <PublicPage headerTone="light">
      <article className={styles.article}>
        <header className={styles.articleHead}>
          <p className={styles.meta}>
            <Link href="/blog">Blog</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/blog?categoria=${encodeURIComponent(post.category)}`}>
              {post.category}
            </Link>
            {area ? <span className={styles.code}>{area.code}</span> : null}
          </p>
          <h1 className={styles.articleTitle}>{post.title}</h1>
          {post.excerpt ? <p className={styles.articleLead}>{post.excerpt}</p> : null}
          <p className={styles.byline}>
            <span>{post.author ?? "Studio Nomade"}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{readingMinutes(post.body)} min de lectura</span>
          </p>
        </header>

        {post.cover ? (
          <figure className={styles.articleCover}>
            <Image
              src={post.cover.src}
              alt={post.cover.alt}
              fill
              priority
              sizes="(min-width: 64em) 80vw, 100vw"
              unoptimized={post.cover.src.startsWith("https://")}
            />
          </figure>
        ) : null}

        <BlogBodyContent body={post.body} />

        {post.tags.length ? (
          <ul className={styles.tags} aria-label="Temas">
            {post.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        ) : null}

        <aside className={styles.cta} aria-label="Contacto">
          <p>¿Tienes un proyecto en mente?</p>
          <div>
            <Link href="/contacto" className={styles.ctaPrimary}>
              Cuéntanos tu proyecto
            </Link>
            <Link href="/contacto#agenda">Agendar una videollamada</Link>
          </div>
        </aside>
      </article>

      {related.length ? (
        <section className={styles.related} aria-labelledby="blog-related">
          <h2 id="blog-related" className={styles.relatedTitle}>
            Otras notas
          </h2>
          <div className={styles.grid}>
            {related.map((item) => (
              <PostCard key={item.slug} post={item} headingLevel="h3" />
            ))}
          </div>
        </section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </PublicPage>
  );
}
