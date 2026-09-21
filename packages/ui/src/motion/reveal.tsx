import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react";

import styles from "./reveal.module.css";

export interface RevealProps extends HTMLAttributes<HTMLElement> {
  /** `rise` sube y aparece · `fade` solo aparece · `mask` recorta y sube. */
  variant?: "rise" | "fade" | "mask";
  /** Posición en una secuencia escalonada. 0 es el primero. */
  step?: number;
  as?: ElementType;
  children?: ReactNode;
}

/**
 * Revela su contenido al entrar en viewport, una sola vez.
 *
 * Es un Server Component: el contrato con el observador es el atributo
 * `data-reveal`, no la clase hasheada del módulo, así que no necesita ref ni
 * contexto. Quien lo activa es `RevealRoot`, montado una vez en el layout.
 *
 * El contenido es visible por defecto y solo se oculta si JavaScript confirmó
 * estar vivo (ver `reveal.module.css`). Sin JS no desaparece nada.
 */
export function Reveal({ variant = "rise", step, as, children, className, ...rest }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;

  return (
    <Tag
      {...rest}
      className={[styles.reveal, className].filter(Boolean).join(" ")}
      data-reveal=""
      data-variant={variant}
      style={step ? ({ "--sn-reveal-step": step } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
