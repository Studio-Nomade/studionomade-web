import { Reveal, SplitText } from "@studionomade/ui";
import type { CaseBlock } from "../../../content/projects";
import styles from "./case-credits.module.css";

type CreditsBlock = Extract<CaseBlock, { type: "credits" }>;

/** Créditos sobre la banda gris: título a la izquierda y pares rol / nombre a la derecha. */
export function CaseCredits({ block }: { block: CreditsBlock }) {
  return (
    <section className={styles.credits} aria-labelledby="creditos-titulo">
      <div className={styles.inner}>
        <SplitText as="h2" by="chars" id="creditos-titulo" className={styles.title}>
          Créditos
        </SplitText>
        <dl className={styles.list}>
          {block.items.map((item, index) => (
            <Reveal key={`${item.role}-${item.name}`} step={index} className={styles.pair}>
              <dt>{item.role}</dt>
              <dd>{item.name}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
