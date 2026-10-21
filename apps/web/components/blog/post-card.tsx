import Image from "next/image";
import Link from "next/link";

import { AREA_BY_SLUG } from "../../content/area-meta";
import type { BlogPost } from "../../content/blog";
import { formatPostDate } from "../../lib/blog/format";
import styles from "./blog.module.css";

/** Tarjeta de nota para listados (blog y home). */
export function PostCard({
  post,
  featured = false,
  headingLevel = "h2"
}: {
  post: BlogPost;
  featured?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  const area = post.area ? AREA_BY_SLUG[post.area] : undefined;
  return (
    <article className={styles.card} data-featured={featured || undefined}>
      <Link href={`/blog/${post.slug}`} className={styles.cardLink} data-cursor-label="Leer">
        <span className={styles.cardMedia}>
          {post.cover ? (
            <Image
              src={post.cover.src}
              alt={post.cover.alt}
              fill
              sizes={featured ? "(min-width: 64em) 60vw, 100vw" : "(min-width: 64em) 30vw, 100vw"}
              unoptimized={post.cover.src.startsWith("https://")}
            />
          ) : (
            <span className={styles.cardPlaceholder} aria-hidden="true">
              {post.category}
            </span>
          )}
        </span>
        <span className={styles.cardBody}>
          <span className={styles.meta}>
            {area ? <span className={styles.code}>{area.code}</span> : null}
            <span>{post.category}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
          </span>
          <Heading className={styles.cardTitle}>{post.title}</Heading>
          {post.excerpt ? <span className={styles.cardExcerpt}>{post.excerpt}</span> : null}
        </span>
      </Link>
    </article>
  );
}
