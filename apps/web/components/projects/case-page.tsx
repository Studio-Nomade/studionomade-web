import type { PublicProject } from "../../content/projects";
import { CaseBlockView } from "./case-blocks";
import { CaseNext } from "./blocks/case-next";
import styles from "./case.module.css";

/**
 * Página de caso: el acento del caso (o el de su área) se activa con
 * `data-accent` en el envoltorio y todos los bloques lo heredan.
 */
export function CasePage({ project, next }: { project: PublicProject; next: PublicProject }) {
  return (
    <article className={styles.page} data-accent={project.accent ?? project.area}>
      {project.blocks.map((block, index) => (
        <CaseBlockView key={`${block.type}-${index}`} block={block} project={project} />
      ))}
      <CaseNext project={next} />
    </article>
  );
}
