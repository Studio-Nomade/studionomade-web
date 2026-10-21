import { Fragment, type CSSProperties } from "react";
import styles from "./home-hero.module.css";

/**
 * Parte un título en palabras y letras EN EL SERVIDOR para animarlo cada vez
 * que su diapositiva se activa.
 *
 * No usa `SplitText` de @studionomade/ui porque ese revela una sola vez al
 * entrar en viewport; aquí el disparo es `data-active` del carrusel y la
 * animación es CSS (cada letra recibe su índice en `--sn-reveal-step`).
 * Los lectores de pantalla leen la copia íntegra, no letra a letra.
 */
export function splitTitle(title: string) {
  let index = 0;
  return title
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => Array.from(word).map((char) => ({ char, index: index++ })));
}

export function HeroTitle({ title, as: Tag = "h2" }: { title: string; as?: "h2" | "p" }) {
  const words = splitTitle(title);
  return (
    <Tag className={styles.title} data-long={title.length > 12 || undefined}>
      <span data-split-plain="" className={styles.srOnly}>
        {title}
      </span>
      <span aria-hidden="true" translate="no" data-split-visual="">
        {words.map((chars, wordIndex) => (
          <Fragment key={`${wordIndex}-${chars.map(({ char }) => char).join("")}`}>
            {wordIndex > 0 ? " " : null}
            <span className={styles.word}>
              {chars.map(({ char, index }) => (
                <span className={styles.charMask} key={index}>
                  <span
                    className={styles.char}
                    style={{ "--sn-reveal-step": index } as CSSProperties}
                  >
                    {char}
                  </span>
                </span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
