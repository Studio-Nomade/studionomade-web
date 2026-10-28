import type { ElementType } from "react";

import { SplitText } from "./split-text";

export interface SplitLinesProps {
  /** Una entrada por línea. El corte es decisión de diseño, no de medición. */
  lines: string[];
  as?: ElementType;
  /** Desplaza el inicio del escalonado, para encadenar con otro bloque. */
  step?: number;
  className?: string;
}

/**
 * Atajo de `SplitText by="lines"` con líneas fijadas por diseño. Se conserva
 * porque es el nombre que usa la home desde el primer sistema de revelado.
 */
export function SplitLines({ lines, as, step, className }: SplitLinesProps) {
  return <SplitText by="lines" lines={lines} as={as} step={step} className={className} />;
}
