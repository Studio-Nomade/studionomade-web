import { SplitText } from "@studionomade/ui";
import type { CaseBlock } from "../../../content/projects";
import styles from "./case-narrative.module.css";

type NarrativeBlock = Extract<CaseBlock, { type: "narrative" }>;

/** Titular a la izquierda; lead y cuerpo a la derecha, revelados por líneas (6:82, 6:294). */
export function CaseNarrative({ block }: { block: NarrativeBlock }) {
  return (
    <section className={styles.narrative}>
      <div className={styles.inner}>
        <SplitText as="h2" by="lines" className={styles.title}>
          {block.title}
        </SplitText>
        <div className={styles.copy}>
          <SplitText as="p" by="lines" className={styles.lead}>
            {block.lead}
          </SplitText>
          <div className={styles.body}>
            {block.body.map((paragraph, index) => (
              <SplitText as="p" by="lines" key={paragraph} delay={0.15 * (index + 1)}>
                {paragraph}
              </SplitText>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
