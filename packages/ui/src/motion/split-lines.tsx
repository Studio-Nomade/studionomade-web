import type { CSSProperties, ElementType } from "react";

import styles from "./split-lines.module.css";

export interface SplitLinesProps {
  /** Una entrada por línea. El corte es decisión de diseño, no de medición. */
  lines: string[];
  as?: ElementType;
  /** Desplaza el inicio del escalonado, para encadenar con otro bloque. */
  step?: number;
}

/**
 * Titular que se revela línea a línea, cada una subiendo desde detrás de una
 * máscara. Es la firma visual del sitio de Studio Nomade.
 *
 * Deliberadamente NO mide líneas. Medir con Range API obligaría a convertirlo en
 * Client Component, a esperar `document.fonts.ready` y produciría desajuste de
 * hidratación. Además los cortes del diseño de origen son decisiones editoriales
 * —el propio sitio los fija a mano—, así que viajan como dato de contenido.
 *
 * Si una línea envuelve en pantallas estrechas, su caja crece en alto y el
 * conjunto sube junto: no se recorta nada.
 */
export function SplitLines({ lines, as, step = 0 }: SplitLinesProps) {
  const Tag = (as ?? "span") as ElementType;

  return (
    <Tag className={styles.lines} data-reveal="" data-variant="lines">
      {lines.map((line, index) => (
        <span className={styles.line} key={line}>
          <span
            className={styles.inner}
            style={{ "--sn-reveal-step": step + index } as CSSProperties}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
