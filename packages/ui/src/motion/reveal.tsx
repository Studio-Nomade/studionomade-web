import { MOTION } from "@studionomade/design-system";
import type { ElementType, HTMLAttributes, ReactNode } from "react";

import type { MotionDirection, RevealPreset } from "./presets";
import styles from "./reveal.module.css";

/** Nombres del primer sistema de revelado, mantenidos por compatibilidad. */
type LegacyVariant = "rise" | "fade" | "mask";

export interface RevealProps extends HTMLAttributes<HTMLElement> {
  /**
   * - `jump` (por defecto): sube 30px y aparece · 1.2s power3.out
   * - `fade`: solo aparece
   * - `mask`: dos capas se deslizan en `direction` mientras la imagen escala 1.2 → 1
   * - `headline`: regla o subrayado que crece en scaleX 0 → 1
   * - `stroke`: dibuja el trazo de los SVG que contiene
   */
  preset?: RevealPreset;
  /** Hacia dónde se van las capas de `mask`, o desde dónde crece `headline`. */
  direction?: MotionDirection;
  /** Retardo en segundos. */
  delay?: number;
  /** Posición en una secuencia escalonada: añade `step × 0.09s` de retardo. */
  step?: number;
  /** @deprecated Usa `preset`. `rise` → `jump`, `mask` → `mask` desde la izquierda. */
  variant?: LegacyVariant;
  as?: ElementType;
  children?: ReactNode;
}

const LEGACY: Record<LegacyVariant, RevealPreset> = { rise: "jump", fade: "fade", mask: "mask" };

/** Retardo final en segundos, redondeado para que el atributo sea estable. */
export function motionDelay(delay?: number, step?: number): string | undefined {
  const total = (delay ?? 0) + (step ?? 0) * MOTION.stagger.step;
  return total > 0 ? String(Math.round(total * 1000) / 1000) : undefined;
}

/**
 * Revela su contenido al entrar en viewport (85%), una sola vez.
 *
 * Es un Server Component: emite atributos `data-*` que `MotionRoot` lee para
 * crear la animación con GSAP. Sin JavaScript, o con movimiento reducido, el
 * contenido se ve desde el primer paint.
 */
export function Reveal({
  preset,
  direction,
  delay,
  step,
  variant,
  as,
  children,
  className,
  ...rest
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const resolved = preset ?? (variant ? LEGACY[variant] : "jump");
  const resolvedDirection =
    direction ?? (resolved === "mask" ? (variant === "mask" ? "left" : "up") : undefined);

  return (
    <Tag
      {...rest}
      className={[styles.reveal, className].filter(Boolean).join(" ")}
      data-reveal=""
      data-motion={resolved}
      data-direction={resolvedDirection}
      data-motion-delay={motionDelay(delay, step)}
    >
      {resolved === "mask" ? (
        <>
          <span className={styles.media} data-mask-media="">
            {children}
          </span>
          <span className={styles.layer} data-mask-layer="back" aria-hidden="true" />
          <span className={styles.layer} data-mask-layer="front" aria-hidden="true" />
        </>
      ) : (
        children
      )}
    </Tag>
  );
}
