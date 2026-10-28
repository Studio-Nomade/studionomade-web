import type { ElementType } from "react";

import { formatCounter } from "./presets";
import styles from "./counter.module.css";

export interface CounterProps {
  /** Valor final. Es lo que se renderiza en el servidor y lo que se ve sin JS. */
  to: number;
  from?: number;
  /** Cantidad mínima de dígitos enteros (ceros a la izquierda). */
  pad?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Duración en segundos. Por defecto 2.4s, power4.out. */
  duration?: number;
  as?: ElementType;
  className?: string;
}

/**
 * Contador que corre de `from` a `to` al entrar en viewport, una sola vez. El
 * HTML trae el valor final: sin JS, con movimiento reducido o para buscadores,
 * se lee la cifra real.
 */
export function Counter({
  to,
  from = 0,
  pad = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration,
  as,
  className
}: CounterProps) {
  const Tag = (as ?? "span") as ElementType;
  return (
    <Tag
      className={[styles.counter, className].filter(Boolean).join(" ")}
      data-motion="counter"
      data-to={to}
      data-from={from}
      data-pad={pad || undefined}
      data-decimals={decimals || undefined}
      data-prefix={prefix || undefined}
      data-suffix={suffix || undefined}
      data-duration={duration}
    >
      {formatCounter(to, { pad, decimals, prefix, suffix })}
    </Tag>
  );
}
