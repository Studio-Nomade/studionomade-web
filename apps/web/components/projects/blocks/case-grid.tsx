import { Reveal } from "@studionomade/ui";
import type { CaseBlock } from "../../../content/projects";
import { CaseMedia } from "../case-parts";
import shared from "../case.module.css";
import styles from "./case-grid.module.css";

type GridBlock = Extract<CaseBlock, { type: "grid" }>;

/**
 * Grilla 2×2 de celdas 587 × 708 (Reebok 27:81, NEXA 6:84, Equifax 27:152), con
 * máscara escalonada, zoom al hover y caption opcional alineado a la derecha.
 */
export function CaseGrid({ block }: { block: GridBlock }) {
  const captions = block.items.some((item) => item.caption);
  return (
    <section
      className={`${shared.tone} ${styles.grid}`}
      data-tone={block.tone}
      data-captions={captions || undefined}
      aria-label="Galería"
    >
      <ul className={styles.list}>
        {block.items.map((item, index) => (
          <li key={item.image.src}>
            <figure className={styles.figure}>
              <CaseMedia
                image={item.image}
                sizes="(max-width: 48em) 100vw, 43vw"
                className={styles.media}
                parallax={0}
                zoom
                step={index % 2}
              />
              {item.caption ? (
                <Reveal as="figcaption" step={index % 2} className={styles.caption}>
                  {item.caption}
                </Reveal>
              ) : null}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
