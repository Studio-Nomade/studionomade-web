"use client";

import { MOTION } from "@studionomade/design-system";
import { useEffect, useRef, useState } from "react";

import { loadMotion, prefersReducedMotion } from "./runtime";
import styles from "./preloader.module.css";

export interface PreloaderProps {
  /** Clave de `sessionStorage` que marca que la sesión ya lo vio. */
  storageKey?: string;
  /** Tiempo máximo cubriendo la página, en ms, aunque falten recursos. */
  maxDuration?: number;
}

const pad = (value: number) => `${String(Math.round(value)).padStart(2, "0")}%`;

function readSeen(key: string) {
  try {
    return window.sessionStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

function markSeen(key: string) {
  try {
    window.sessionStorage.setItem(key, "1");
  } catch {
    // Navegación privada o almacenamiento bloqueado: se mostrará otra vez.
  }
}

/**
 * Preloader de primera carga: pantalla negra con un contador "00%" → "100%"
 * abajo a la izquierda, que se retira hacia arriba al cargar la página.
 *
 * **Apagado por defecto en el sitio**: tapa el contenido durante la carga, así
 * que el LCP pasa a ser la retirada del preloader. Solo vale la pena para una
 * landing de campaña que lo pida explícitamente.
 *
 * Se renderiza en el servidor para cubrir desde el primer paint, pero el CSS lo
 * oculta sin JavaScript, con movimiento reducido, si la hidratación falla
 * (`data-reveal-failed`) y si `<html data-preloaded>` —que el layout puede fijar
 * con un script en línea leyendo `storageKey`— indica que la sesión ya lo vio.
 */
export function Preloader({ storageKey = "sn-preloaded", maxDuration = 4000 }: PreloaderProps) {
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const count = countRef.current;
    if (!root || !count) return;
    if (prefersReducedMotion() || readSeen(storageKey)) {
      markSeen(storageKey);
      setDone(true);
      return;
    }

    let disposed = false;
    let kill: (() => void) | undefined;
    loadMotion()
      .then(({ gsap }) => {
        if (disposed) return;
        const state = { value: 0 };
        const render = () => {
          count.textContent = pad(state.value);
        };
        const images = Array.from(document.images);
        const progress = () => {
          if (document.readyState === "complete") return 100;
          const loaded = images.filter((image) => image.complete).length;
          return Math.min(95, ((loaded + 1) / (images.length + 1)) * 95);
        };
        const finish = () => {
          markSeen(storageKey);
          gsap.to(root, {
            yPercent: -100,
            duration: MOTION.duration,
            ease: MOTION.ease.curtain,
            onComplete: () => setDone(true)
          });
        };
        const ticker = () => {
          const target = progress();
          gsap.to(state, {
            value: target,
            duration: 0.4,
            ease: "power2.out",
            onUpdate: render,
            overwrite: true,
            onComplete: target >= 100 ? finish : undefined
          });
        };
        const interval = setInterval(ticker, 200);
        const fallback = setTimeout(() => {
          clearInterval(interval);
          gsap.to(state, { value: 100, duration: 0.3, onUpdate: render, onComplete: finish });
        }, maxDuration);
        window.addEventListener("load", ticker);
        ticker();
        kill = () => {
          clearInterval(interval);
          clearTimeout(fallback);
          window.removeEventListener("load", ticker);
          gsap.killTweensOf([state, root]);
        };
      })
      .catch(() => setDone(true));

    return () => {
      disposed = true;
      kill?.();
    };
  }, [maxDuration, storageKey]);

  if (done) return null;

  return (
    <div ref={rootRef} className={styles.preloader} aria-hidden="true">
      <span ref={countRef} className={styles.count}>
        00%
      </span>
    </div>
  );
}
