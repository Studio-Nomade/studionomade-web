/**
 * Recetas de animación por preset. Las aplica `MotionRoot` sobre el DOM que
 * emiten los Server Components (`Reveal`, `SplitText`, `Parallax`, `Counter`,
 * `StrokeNumber`). El contrato entre ambos son atributos `data-*`:
 *
 * - `data-motion`        preset (jump, fade, mask, headline, stroke, lines,
 *                        words, chars, lines-auto, counter, parallax)
 * - `data-reveal`        el elemento está pre-ocultado por CSS hasta revelarse
 * - `data-revealed`      lo pone el runtime al empezar la animación
 * - `data-motion-done`   lo pone el runtime al terminarla
 * - `data-motion-delay`  retardo en segundos
 */
import { MOTION } from "@studionomade/design-system";

import type { MotionEngine } from "./runtime";

export type RevealPreset = "jump" | "fade" | "mask" | "headline" | "stroke";
export type SplitBy = "lines" | "words" | "chars";
export type MotionDirection = "up" | "down" | "left" | "right";

export interface CounterFormat {
  pad?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

/** Formatea el valor de un contador: ceros a la izquierda, decimales y afijos. */
export function formatCounter(value: number, format: CounterFormat = {}): string {
  const { pad = 0, decimals = 0, prefix = "", suffix = "" } = format;
  const negative = value < 0;
  const [integer, fraction] = Math.abs(value).toFixed(decimals).split(".");
  const digits = integer.padStart(pad, "0");
  return `${prefix}${negative ? "-" : ""}${digits}${fraction ? `.${fraction}` : ""}${suffix}`;
}

/** Escalonado por tipo de corte, según el sitio de origen. */
export function splitStagger(by: SplitBy, count: number) {
  if (by === "lines") {
    const each =
      count > 1 ? Math.min(MOTION.stagger.lines, MOTION.stagger.linesMax / (count - 1)) : 0;
    return { each };
  }
  return { amount: by === "words" ? MOTION.stagger.words : MOTION.stagger.chars };
}

/** Longitud de trazo de reserva para `<text>`, que no expone getTotalLength. */
const TEXT_STROKE_LENGTH = 640;

const number = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return value !== undefined && value !== "" && Number.isFinite(parsed) ? parsed : fallback;
};

export interface MotionHandle {
  /** Revela en el acto, sin esperar al scroll. `instant` salta al final. */
  reveal?: (instant?: boolean) => void;
  cleanup: () => void;
}

/**
 * Prepara un elemento. Devuelve su manejador o `undefined` si el preset no es
 * conocido. Todo lo que crea vive en un `gsap.context`, así que `cleanup`
 * revierte estilos en línea, tweens y ScrollTriggers de una vez.
 */
export function setupMotion(element: HTMLElement, engine: MotionEngine): MotionHandle | undefined {
  const { gsap, ScrollTrigger, SplitText } = engine;
  const preset = element.dataset.motion;
  if (!preset) return undefined;

  const delay = number(element.dataset.motionDelay, 0);
  const direction = (element.dataset.direction ?? "up") as MotionDirection;
  const ctx = gsap.context(() => {}, element);
  let played = false;
  let reveal: MotionHandle["reveal"];

  const markDone = () => {
    element.dataset.motionDone = "";
  };

  /** Construye la animación de un preset revelable. Corre dentro del contexto. */
  const build = (): gsap.core.Animation | undefined => {
    const base = { duration: MOTION.duration, delay };
    switch (preset) {
      case "jump":
        return gsap.fromTo(
          element,
          { y: MOTION.jumpY, autoAlpha: 0 },
          {
            ...base,
            y: 0,
            autoAlpha: 1,
            ease: MOTION.ease.jump,
            clearProps: "transform,opacity,visibility"
          }
        );
      case "fade":
        return gsap.fromTo(
          element,
          { autoAlpha: 0 },
          { ...base, autoAlpha: 1, ease: MOTION.ease.jump, clearProps: "opacity,visibility" }
        );
      case "headline": {
        const origin =
          direction === "right"
            ? "right center"
            : direction === "left"
              ? "left center"
              : "center center";
        return gsap.fromTo(
          element,
          { scaleX: 0, transformOrigin: origin },
          { ...base, scaleX: 1, ease: MOTION.ease.headline, clearProps: "transform" }
        );
      }
      case "mask": {
        const media = element.querySelector<HTMLElement>("[data-mask-media]");
        // El orden del DOM es [fondo, frente]: el frente se va primero.
        const layers = [...element.querySelectorAll<HTMLElement>("[data-mask-layer]")].reverse();
        const axis = direction === "left" || direction === "right" ? "xPercent" : "yPercent";
        const sign = direction === "up" || direction === "left" ? -1 : 1;
        const timeline = gsap.timeline({ delay });
        if (media)
          timeline.fromTo(
            media,
            { scale: MOTION.maskScale },
            {
              scale: 1,
              duration: MOTION.duration,
              ease: MOTION.ease.mask,
              clearProps: "transform"
            },
            0
          );
        if (layers.length)
          timeline.fromTo(
            layers,
            { [axis]: 0 },
            {
              [axis]: sign * 101,
              duration: MOTION.duration,
              ease: MOTION.ease.mask,
              stagger: 0.12
            },
            0
          );
        return timeline;
      }
      case "stroke": {
        const shapes = [
          ...element.querySelectorAll<SVGElement>(
            "path, line, polyline, polygon, circle, ellipse, rect, text"
          )
        ];
        for (const shape of shapes) {
          const length =
            "getTotalLength" in shape && typeof shape.getTotalLength === "function"
              ? (shape as SVGGeometryElement).getTotalLength()
              : TEXT_STROKE_LENGTH;
          gsap.set(shape, { strokeDasharray: length, strokeDashoffset: length });
        }
        return gsap.to(shapes, {
          ...base,
          strokeDashoffset: 0,
          ease: MOTION.ease.stroke,
          stagger: 0.1,
          clearProps: "strokeDasharray,strokeDashoffset"
        });
      }
      case "lines":
      case "words":
      case "chars": {
        const inners = element.querySelectorAll<HTMLElement>("[data-split-inner]");
        return gsap.fromTo(
          inners,
          { yPercent: MOTION.splitShift },
          {
            ...base,
            yPercent: 0,
            ease: preset === "chars" ? MOTION.ease.splitChars : MOTION.ease.split,
            stagger: splitStagger(preset, inners.length),
            clearProps: "transform"
          }
        );
      }
      default:
        return undefined;
    }
  };

  const trigger = (onEnter: () => void) =>
    ScrollTrigger.create({
      trigger: element,
      start: MOTION.triggerStart,
      once: true,
      onEnter,
      // Un salto de scroll puede cruzar la zona entera de una vez.
      onLeave: onEnter
    });

  ctx.add(() => {
    if (preset === "parallax") {
      const inner = element.querySelector<HTMLElement>("[data-parallax-inner]") ?? element;
      const y = number(element.dataset.parallaxY, MOTION.parallaxY);
      const scaleFrom = number(element.dataset.parallaxScaleFrom, 1);
      gsap.fromTo(
        inner,
        { yPercent: y * 100, scale: scaleFrom },
        {
          yPercent: -y * 100,
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: element, start: "top bottom", end: "bottom top", scrub: true }
        }
      );
      return;
    }

    if (preset === "counter") {
      const format: CounterFormat = {
        pad: number(element.dataset.pad, 0),
        decimals: number(element.dataset.decimals, 0),
        prefix: element.dataset.prefix ?? "",
        suffix: element.dataset.suffix ?? ""
      };
      const from = number(element.dataset.from, 0);
      const to = number(element.dataset.to, 0);
      const duration = number(element.dataset.duration, MOTION.counterDuration);
      const state = { value: from };
      const render = () => {
        element.textContent = formatCounter(state.value, format);
      };
      render();
      let tween: gsap.core.Tween | undefined;
      reveal = (instant) => {
        if (played) {
          if (instant) tween?.progress(1);
          return;
        }
        played = true;
        ctx.add(() => {
          tween = gsap.to(state, {
            value: to,
            duration,
            delay,
            ease: MOTION.ease.counter,
            onUpdate: render,
            onComplete: () => {
              state.value = to;
              render();
              markDone();
            }
          });
          if (instant) tween.progress(1);
        });
      };
      trigger(() => reveal?.());
      return;
    }

    if (preset === "lines-auto") {
      let animation: gsap.core.Tween | undefined;
      SplitText.create(element, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        aria: "auto",
        onSplit(self: { lines: Element[] }) {
          element.dataset.splitReady = "";
          animation = gsap.fromTo(
            self.lines,
            { yPercent: MOTION.splitShift },
            {
              duration: MOTION.duration,
              delay,
              yPercent: 0,
              ease: MOTION.ease.split,
              stagger: splitStagger("lines", self.lines.length),
              paused: !played,
              onComplete: markDone
            }
          );
          // SplitText revierte esta animación y transfiere su progreso al volver a partir.
          return animation;
        }
      });
      reveal = (instant) => {
        played = true;
        element.dataset.revealed = "";
        animation?.play();
        if (instant) animation?.progress(1);
      };
      trigger(() => reveal?.());
      return;
    }

    reveal = (instant) => {
      if (played) return;
      played = true;
      ctx.add(() => {
        // La animación fija su estado inicial en línea ANTES de quitar el
        // pre-ocultado del CSS: no hay ningún frame con el contenido a medias.
        const animation = build();
        element.dataset.revealed = "";
        if (!animation) {
          markDone();
          return;
        }
        animation.eventCallback("onComplete", markDone);
        if (instant) animation.progress(1);
      });
    };
    trigger(() => reveal?.());
  });

  return {
    reveal: (instant) => reveal?.(instant),
    cleanup: () => ctx.revert()
  };
}
