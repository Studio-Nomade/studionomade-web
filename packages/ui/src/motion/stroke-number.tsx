import { motionDelay } from "./reveal";
import styles from "./stroke-number.module.css";

export interface StrokeNumberProps {
  /** Texto corto a trazar, típicamente el número de un paso: "01" … "04". */
  value: string;
  /** Retardo en segundos. */
  delay?: number;
  className?: string;
}

/** Ancho aproximado de una cifra de Inter, en unidades del viewBox (alto 100). */
const GLYPH_WIDTH = 64;

/**
 * Número de paso en contorno que se dibuja al entrar en viewport (trazo SVG,
 * 1.2s expo.inOut). Hereda el `font-size` y el color del contexto. Sin JS o con
 * movimiento reducido se ve el contorno completo.
 */
export function StrokeNumber({ value, delay, className }: StrokeNumberProps) {
  const width = Math.max(1, value.length) * GLYPH_WIDTH;
  return (
    <span
      className={[styles.stroke, className].filter(Boolean).join(" ")}
      data-reveal=""
      data-motion="stroke"
      data-motion-delay={motionDelay(delay)}
    >
      <svg viewBox={`0 0 ${width} 100`} aria-hidden="true" focusable="false">
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
          {value}
        </text>
      </svg>
      <span className={styles.srOnly}>{value}</span>
    </span>
  );
}
