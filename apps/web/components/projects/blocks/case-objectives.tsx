import { Reveal, SplitText } from "@studionomade/ui";
import type { CaseBlock } from "../../../content/projects";
import styles from "./case-objectives.module.css";

type ObjectivesBlock = Extract<CaseBlock, { type: "objectives" }>;

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * Objetivos del proyecto (Kumelen 6:226, Reebok 27:27): titular a la izquierda
 * y lista numerada con círculos de 63px. El círculo se dibuja con el preset
 * `stroke` (el motor de `StrokeNumber`) en el color de acento; el número queda
 * en texto negro para mantener el contraste AA.
 */
export function CaseObjectives({ block }: { block: ObjectivesBlock }) {
  return (
    <section className={styles.objectives} aria-labelledby="objetivos-titulo">
      <SplitText as="h2" by="words" id="objetivos-titulo" className={styles.title}>
        {block.title}
      </SplitText>
      <ol className={styles.list}>
        {block.items.map((item, index) => (
          <li key={item} className={styles.item}>
            <span className={styles.badge}>
              <Reveal preset="stroke" step={index} className={styles.circle} aria-hidden="true">
                <svg viewBox="0 0 64 64" focusable="false">
                  <circle cx="32" cy="32" r="31.5" />
                </svg>
              </Reveal>
              <span className={styles.number}>{pad(index + 1)}</span>
            </span>
            <Reveal as="p" step={index} className={styles.text}>
              {item}
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
