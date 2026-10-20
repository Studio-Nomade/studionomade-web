"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    /** Lo lee el watchdog del layout para saber si la hidratación llegó. */
    __snRevealReady?: boolean;
  }
}

/**
 * Activa los elementos marcados con `data-reveal`. Se monta UNA vez en el layout.
 *
 * Un solo IntersectionObserver compartido, no uno por elemento: con ~40 objetivos
 * el coste es despreciable, mientras que 40 observadores serían 40 callbacks y 40
 * ciclos de cálculo de intersección.
 *
 * El `rootMargin` negativo reproduce el `start: "top 85%"` de ScrollTrigger que
 * usa el sitio de origen: el elemento se revela cuando ya entró de verdad, no al
 * asomar un píxel.
 */
export function RevealRoot() {
  useEffect(() => {
    // Confirma que el cliente está vivo: desactiva el watchdog del layout.
    window.__snRevealReady = true;

    // `in` no basta: la clave puede existir con un valor inservible. Y sin
    // observador no se puede revelar nada, así que se desarma todo: más vale
    // sin animación que con el contenido atrapado tras su máscara.
    if (typeof window.IntersectionObserver !== "function") {
      document.documentElement.setAttribute("data-reveal-failed", "");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Se revela al entrar en viewport, pero TAMBIÉN si el elemento ya
          // quedó por encima de él: un enlace ancla, un salto de scroll o la
          // restauración de posición del navegador pueden dejar contenido atrás
          // sin que llegue a intersecar nunca, y entonces quedaría oculto para
          // siempre detrás de su máscara.
          const yaPaso = entry.boundingClientRect.bottom < 0;
          if (!entry.isIntersecting && !yaPaso) continue;

          (entry.target as HTMLElement).dataset.revealed = "";
          // once: true — no se vuelve a animar.
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0% 0% -12% 0%" }
    );

    const observe = (scope: ParentNode) => {
      for (const element of scope.querySelectorAll("[data-reveal]:not([data-revealed])")) {
        observer.observe(element);
      }
    };

    observe(document);

    // La home y los formularios son Client Components: parte del contenido
    // aparece después del primer paint.
    /**
     * Red de seguridad para los saltos de scroll.
     *
     * IntersectionObserver solo notifica al CRUZAR un umbral. Un salto de un solo
     * frame —enlace ancla, restauración de posición, scrollTo— lleva al elemento
     * de "por debajo, ratio 0" a "por encima, ratio 0" sin cruzar nada, así que
     * no llega ninguna entrada y el contenido se quedaría oculto tras su máscara.
     *
     * Este barrido recorre solo lo que aún no se ha revelado y se desengancha en
     * cuanto no queda nada, así que no cuesta nada en régimen permanente.
     */
    let scheduled = false;
    const sweep = () => {
      scheduled = false;
      const pending = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])");
      if (pending.length === 0) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("load", onScroll);
        return;
      }
      for (const element of pending) {
        if (element.getBoundingClientRect().bottom < 0) {
          element.dataset.revealed = "";
          observer.unobserve(element);
        }
      }
    };
    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(sweep);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // El scroll no es el único momento en que algo puede quedar atrás: las
    // imágenes siguen cargando después del primer paint y desplazan el layout
    // hacia arriba cuando ya no habrá más eventos de scroll.
    window.addEventListener("load", onScroll);
    onScroll();

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof HTMLElement) {
            if (node.hasAttribute("data-reveal")) observer.observe(node);
            observe(node);
          }
        }
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("load", onScroll);
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);

  return null;
}
