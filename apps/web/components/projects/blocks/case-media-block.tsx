import type { CaseBlock } from "../../../content/projects";
import { CaseMedia } from "../case-parts";
import shared from "../case.module.css";
import styles from "./case-media-block.module.css";

type MediaBlock = Extract<CaseBlock, { type: "media" }>;

const SIZES: Record<MediaBlock["variant"], string> = {
  full: "100vw",
  "full-ruled": "100vw",
  framed: "(max-width: 48em) 100vw, 88vw",
  "bleed-right": "(max-width: 48em) 100vw, 85vw"
};

/**
 * Imagen de bloque: a sangre con parallax de fondo (27:69, 27:149, 29:166),
 * a sangre con filete blanco (6:80), enmarcada con márgenes (6:20, 6:26, 6:29)
 * o pegada al borde derecho sobre negro (27:72).
 */
export function CaseMediaBlock({ block }: { block: MediaBlock }) {
  const full = block.variant === "full" || block.variant === "full-ruled";
  return (
    <section
      className={`${shared.tone} ${styles.block}`}
      data-tone={block.tone}
      data-variant={block.variant}
      aria-label={block.image.alt}
    >
      <CaseMedia
        image={block.image}
        sizes={SIZES[block.variant]}
        className={styles.media}
        parallax={full ? 0.08 : 0.05}
        direction={block.variant === "bleed-right" ? "left" : "up"}
      />
    </section>
  );
}
