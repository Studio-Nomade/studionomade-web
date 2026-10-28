import type { ElementType, HTMLAttributes, ReactNode } from "react";

import styles from "./parallax.module.css";

export interface ParallaxProps extends HTMLAttributes<HTMLElement> {
  /**
   * Desplazamiento vertical ligado al scroll, como fracción de la altura del
   * contenido: `0.1` recorre de +10% a −10% mientras el bloque cruza el viewport.
   */
  y?: number;
  /** Escala inicial que vuelve a 1 durante el recorrido (`1.2` o `0.8`). */
  scaleFrom?: number;
  /** Recorta lo que se sale de la caja (imágenes con escala). */
  clip?: boolean;
  as?: ElementType;
  children?: ReactNode;
}

/**
 * Parallax ligado al scroll (scrub) con desplazamiento y/o escala. Server
 * Component; lo anima `MotionRoot`. No pre-oculta nada: sin JS o con movimiento
 * reducido el contenido queda quieto en su sitio.
 */
export function Parallax({
  y = 0.1,
  scaleFrom,
  clip = false,
  as,
  children,
  className,
  ...rest
}: ParallaxProps) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      {...rest}
      className={[styles.parallax, className].filter(Boolean).join(" ")}
      data-motion="parallax"
      data-parallax-y={y}
      data-parallax-scale-from={scaleFrom}
      data-clip={clip || undefined}
    >
      <div className={styles.inner} data-parallax-inner="">
        {children}
      </div>
    </Tag>
  );
}
