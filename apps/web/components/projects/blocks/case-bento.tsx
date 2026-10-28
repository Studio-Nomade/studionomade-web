import type { CaseBlock } from "../../../content/projects";
import { CaseMedia } from "../case-parts";
import styles from "./case-bento.module.css";

type BentoBlock = Extract<CaseBlock, { type: "bento" }>;

/** Una imagen grande a la izquierda y dos apiladas a la derecha (Kumelen 6:230). */
export function CaseBento({ block }: { block: BentoBlock }) {
  const [main, top, bottom] = block.items;
  return (
    <section className={styles.bento} aria-label="Galería">
      <div className={styles.layout}>
        <CaseMedia
          image={main}
          sizes="(max-width: 48em) 100vw, 50vw"
          className={styles.main}
          parallax={0}
          zoom
        />
        <CaseMedia
          image={top}
          sizes="(max-width: 48em) 100vw, 42vw"
          className={styles.side}
          parallax={0}
          zoom
          step={1}
        />
        <CaseMedia
          image={bottom}
          sizes="(max-width: 48em) 100vw, 42vw"
          className={styles.side}
          parallax={0}
          zoom
          step={2}
        />
      </div>
    </section>
  );
}
