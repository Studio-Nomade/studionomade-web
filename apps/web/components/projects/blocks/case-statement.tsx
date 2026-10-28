import { Reveal, SplitText } from "@studionomade/ui";
import type { CaseBlock, PublicProject } from "../../../content/projects";
import { BehanceLink, CaseRule, Rich } from "../case-parts";
import shared from "../case.module.css";
import styles from "./case-statement.module.css";

type StatementBlock = Extract<CaseBlock, { type: "statement" }>;

/**
 * Statement centrado bajo la regla corta. `md` sobre blanco (CinnaLove 1:5) o
 * `lg` sobre negro con atribución (cierre de Reebok 27:46).
 */
export function CaseStatement({
  block,
  project
}: {
  block: StatementBlock;
  project: PublicProject;
}) {
  const behance = block.behance ? project.behanceUrl : undefined;
  return (
    <section
      className={`${shared.tone} ${styles.statement}`}
      data-tone={block.tone}
      data-size={block.size}
      aria-label="Enfoque del proyecto"
    >
      <CaseRule />
      {typeof block.text === "string" ? (
        <SplitText as="p" by="lines" className={styles.text}>
          {block.text}
        </SplitText>
      ) : (
        <Reveal as="p" className={styles.text}>
          <Rich text={block.text} />
        </Reveal>
      )}
      {block.attribution ? (
        <Reveal as="p" step={1} className={styles.attribution}>
          {block.attribution}
        </Reveal>
      ) : null}
      {behance ? (
        <Reveal step={2} className={styles.button}>
          <BehanceLink href={behance} project={project.title} />
        </Reveal>
      ) : null}
    </section>
  );
}
