import Image from "next/image";
import { Reveal } from "@studionomade/ui";
import { HOME_INSTAGRAM } from "../../content/home";
import { getInstagramPosts } from "../../lib/instagram/feed";
import styles from "./instagram-feed.module.css";

const shortCaption = (caption: string) =>
  caption.length > 90 ? `${caption.slice(0, 88).trimEnd()}…` : caption;

/**
 * Cuadrícula con las últimas 5 publicaciones de @studionomade_ (API de
 * Instagram, cache de una hora) y botón "Ir al perfil". Sin token o si la API
 * falla, muestra la selección fija de `HOME_INSTAGRAM`.
 */
export async function InstagramFeed({ headingId }: { headingId: string }) {
  const posts = await getInstagramPosts(5);
  const tiles = posts
    ? posts.map((post) => ({
        key: post.id,
        src: post.image,
        alt: post.caption
          ? shortCaption(post.caption)
          : "Publicación de Studio Nomade en Instagram",
        href: post.permalink,
        remote: true
      }))
    : HOME_INSTAGRAM.images.map((image) => ({
        key: image.src,
        src: image.src,
        alt: image.alt,
        href: HOME_INSTAGRAM.href,
        remote: false
      }));

  return (
    <div className={styles.feed} data-live={posts ? "" : undefined}>
      <ul className={styles.grid} aria-labelledby={headingId}>
        {tiles.map((tile, index) => (
          <li className={styles.tile} key={tile.key} data-featured={index === 2 || undefined}>
            <a
              href={tile.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
              aria-label={`${tile.alt} (abre Instagram)`}
              data-cursor-label="Ver"
            >
              <Reveal preset="mask" direction="up" step={index} className={styles.mask}>
                <Image
                  src={tile.src}
                  alt=""
                  fill
                  unoptimized={tile.remote}
                  sizes={
                    index === 2 ? "(min-width: 48em) 40vw, 100vw" : "(min-width: 48em) 20vw, 50vw"
                  }
                />
              </Reveal>
            </a>
          </li>
        ))}
      </ul>
      <div className={styles.actions}>
        <a
          className={styles.profile}
          href={HOME_INSTAGRAM.href}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor-magnetic=""
        >
          Ir al perfil
          <span className={styles.handle}>{HOME_INSTAGRAM.handle}</span>
        </a>
      </div>
    </div>
  );
}
