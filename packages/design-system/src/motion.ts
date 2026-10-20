/**
 * Contrato de movimiento del rediseño, en las unidades que consume GSAP
 * (segundos, nombres de ease). Es el espejo de los tokens `--motion-*` de
 * `styles/tokens/motion.css`; `motion.test.ts` blinda que coincidan.
 */
export const MOTION = {
  /** Duración base de todo revelado (1.2 s). */
  duration: 1.2,
  /** Duración del contador numérico (2.4 s). */
  counterDuration: 2.4,
  /** Disparo al entrar el borde superior al 85% del viewport, una sola vez. */
  triggerStart: "top 85%",
  ease: {
    jump: "power3.out",
    split: "power3.out",
    splitChars: "expo.out",
    mask: "expo.inOut",
    headline: "expo.inOut",
    stroke: "expo.inOut",
    counter: "power4.out",
    curtain: "expo.inOut"
  },
  stagger: {
    /** Cada línea, con tope total de `linesMax`. */
    lines: 0.08,
    linesMax: 0.3,
    /** Total repartido entre todas las palabras / letras. */
    words: 0.2,
    chars: 0.3,
    /** Retardo por unidad de `step` en secuencias manuales. */
    step: 0.09
  },
  /** Desplazamiento inicial del preset `jump`, en px. */
  jumpY: 30,
  /** Escala inicial de la imagen en el preset `mask`. */
  maskScale: 1.2,
  /** Factor de parallax por defecto. */
  parallaxY: 0.1,
  /** Interpolación de Lenis equivalente al damping 0.12 del sitio de origen. */
  smoothLerp: 0.12
} as const;

export type MotionEase = (typeof MOTION.ease)[keyof typeof MOTION.ease];
