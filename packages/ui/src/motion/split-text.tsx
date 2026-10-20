import { Fragment, type ElementType, type ReactNode } from "react";

import type { SplitBy } from "./presets";
import { motionDelay } from "./reveal";
import styles from "./split-text.module.css";

export interface SplitTextProps {
  /** Texto a partir. Con `by="lines"` y sin `lines`, el corte se mide en el navegador. */
  children?: string;
  /** Líneas fijadas por diseño. Tiene prioridad sobre `children` y no necesita medir. */
  lines?: string[];
  /** Unidad que se anima. */
  by?: SplitBy;
  as?: ElementType;
  /** Retardo en segundos. */
  delay?: number;
  /** Posición en una secuencia escalonada: añade `step × 0.09s` de retardo. */
  step?: number;
  className?: string;
  id?: string;
}

function Mask({ children, block }: { children: ReactNode; block?: boolean }) {
  return (
    <span className={block ? styles.line : styles.mask}>
      <span className={styles.inner} data-split-inner="">
        {children}
      </span>
    </span>
  );
}

/**
 * Titular que se revela por líneas, palabras o letras, cada unidad subiendo
 * desde detrás de una máscara (y 100% → 0). Es la firma visual del sitio.
 *
 * Palabras, letras y líneas explícitas se parten EN EL SERVIDOR: no hay
 * mutación del DOM tras hidratar ni desajuste de hidratación, y el texto se lee
 * entero sin JavaScript. Solo `by="lines"` con un texto libre necesita medir: lo
 * hace `SplitText` de GSAP en el navegador, con re-partido automático al cambiar
 * el ancho o al cargar la fuente.
 *
 * Escalonado: líneas 0.08s (máx. 0.3s en total) · palabras 0.2s y letras 0.3s
 * repartidos entre todas las unidades.
 */
export function SplitText({
  children = "",
  lines,
  by = "lines",
  as,
  delay,
  step,
  className,
  id
}: SplitTextProps) {
  const Tag = (as ?? "span") as ElementType;
  const common = {
    id,
    className: [styles.split, className].filter(Boolean).join(" "),
    "data-reveal": "",
    "data-motion-delay": motionDelay(delay, step)
  };

  if (by === "lines" && !lines) {
    return (
      <Tag {...common} data-motion="lines-auto">
        {children}
      </Tag>
    );
  }

  if (by === "lines") {
    return (
      <Tag {...common} data-motion="lines">
        {lines!.map((line, index) => (
          // El espacio entre líneas mantiene el texto y el nombre accesible
          // ("Agendemos una reunión", no "Agendemosuna reunión").
          <Fragment key={`${index}-${line}`}>
            {index > 0 ? " " : null}
            <Mask block>{line}</Mask>
          </Fragment>
        ))}
      </Tag>
    );
  }

  const words = children.split(/\s+/).filter(Boolean);

  if (by === "words") {
    return (
      <Tag {...common} data-motion="words">
        {words.map((word, index) => (
          <Fragment key={`${index}-${word}`}>
            {index > 0 ? " " : null}
            <Mask>{word}</Mask>
          </Fragment>
        ))}
      </Tag>
    );
  }

  // Letras: cada palabra es una caja sin corte para que el navegador no parta
  // dentro de ella. Los lectores de pantalla deletrearían letra a letra, así
  // que la versión partida se oculta y se expone una copia legible.
  return (
    <Tag {...common} data-motion="chars">
      <span className={styles.srOnly}>{children}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <Fragment key={`${index}-${word}`}>
            {index > 0 ? " " : null}
            <span className={styles.word}>
              {Array.from(word).map((char, charIndex) => (
                <Mask key={charIndex}>{char}</Mask>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
