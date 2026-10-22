import { Reveal, SplitText } from "@studionomade/ui";
import type { CaseBlock, RichText } from "../../../content/projects";
import { Rich } from "../case-parts";
import shared from "../case.module.css";
import styles from "./case-challenge.module.css";

type ChallengeBlock = Extract<CaseBlock, { type: "challenge" }>;

function ChallengeColumn({ label, text, step }: { label: string; text: RichText; step: number }) {
  return (
    <Reveal step={step} className={styles.column}>
      <h3 className={styles.label}>{label}</h3>
      <p className={styles.body}>
        <Rich text={text} />
      </p>
    </Reveal>
  );
}

/** Desafío, solución y resultado (Reebok 36:22 sobre negro, Equifax 27:145 sobre gris). */
export function CaseChallenge({ block }: { block: ChallengeBlock }) {
  return (
    <section className={`${shared.tone} ${styles.challenge}`} data-tone={block.tone}>
      <div className={styles.inner}>
        <h2 className={styles.label}>¿Cuál era el desafío?</h2>
        {typeof block.challenge === "string" ? (
          <SplitText as="p" by="lines" className={styles.headline}>
            {block.challenge}
          </SplitText>
        ) : (
          <Reveal as="p" className={styles.headline}>
            <Rich text={block.challenge} />
          </Reveal>
        )}
        <div className={styles.columns}>
          <ChallengeColumn label="¿Cómo resolvimos?" text={block.solution} step={0} />
          <ChallengeColumn label="¿Cuál fue el resultado final?" text={block.result} step={1} />
        </div>
      </div>
    </section>
  );
}
