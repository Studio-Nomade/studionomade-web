import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@studionomade/ui";

import { formatPostDate } from "../../lib/blog/format";
import { getBlogPosts } from "../../lib/blog/source";
import styles from "./home-landing.module.css";

/** Últimas 3 notas del blog en la home, con enlace al blog completo. */
export async function HomePosts() {
  const posts = (await getBlogPosts()).slice(0, 3);
  return (
    <>
      {posts.map((post) => (
        <article className={styles.post} key={post.slug}>
          <Reveal preset="mask" direction="left" className={styles.postMedia}>
            {post.cover ? (
              <Image
                src={post.cover.src}
                alt={post.cover.alt}
                fill
                sizes="(min-width: 64em) 55vw, 100vw"
                unoptimized={post.cover.src.startsWith("https://")}
              />
            ) : null}
          </Reveal>
          <Reveal className={styles.postBody} step={2}>
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
            <h3>
              <Link href={`/blog/${post.slug}`} className={styles.postLink}>
                {post.title}
              </Link>
            </h3>
            <ul className={styles.tags} aria-label="Temas">
              {post.tags.slice(0, 4).map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </Reveal>
        </article>
      ))}
      <p className={styles.postsMore}>
        <Link href="/blog" className={styles.textLink}>
          Ver todas las notas
        </Link>
      </p>
    </>
  );
}
