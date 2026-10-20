import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RevealRoot } from "./reveal-root";

/** Doble de IntersectionObserver: jsdom no lo implementa. */
class FakeObserver {
  static instances: FakeObserver[] = [];
  observed: Element[] = [];
  disconnected = false;
  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit
  ) {
    FakeObserver.instances.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  unobserve(el: Element) {
    this.observed = this.observed.filter((candidate) => candidate !== el);
  }
  disconnect() {
    this.disconnected = true;
  }
  takeRecords() {
    return [];
  }
  trigger(el: Element, entry: Partial<IntersectionObserverEntry> = {}) {
    this.callback(
      [
        {
          target: el,
          isIntersecting: true,
          boundingClientRect: { bottom: 100 } as DOMRectReadOnly,
          ...entry
        } as unknown as IntersectionObserverEntry
      ],
      this as unknown as IntersectionObserver
    );
  }
}

beforeEach(() => {
  FakeObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  // rAF síncrono: el componente hace un barrido inicial al montar, así que el
  // doble tiene que estar puesto antes de renderizar.
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
  document.documentElement.removeAttribute("data-reveal-failed");
  delete window.__snRevealReady;
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("RevealRoot", () => {
  it("usa UN solo observador para todos los objetivos", () => {
    document.body.innerHTML = `<i data-reveal></i><i data-reveal></i><i data-reveal></i>`;
    render(<RevealRoot />);
    expect(FakeObserver.instances).toHaveLength(1);
    expect(FakeObserver.instances[0].observed).toHaveLength(3);
  });

  it("reproduce el umbral del sitio de origen", () => {
    render(<RevealRoot />);
    expect(FakeObserver.instances[0].options).toMatchObject({
      threshold: 0.15,
      rootMargin: "0% 0% -12% 0%"
    });
  });

  it("señala que la hidratación llegó, para desactivar el watchdog", () => {
    render(<RevealRoot />);
    expect(window.__snRevealReady).toBe(true);
  });

  it("revela una sola vez y deja de observar", () => {
    document.body.innerHTML = `<i data-reveal></i>`;
    render(<RevealRoot />);
    const observer = FakeObserver.instances[0];
    const target = document.querySelector("i")!;

    observer.trigger(target);

    expect(target).toHaveAttribute("data-revealed");
    expect(observer.observed).not.toContain(target);
  });

  it("revela lo que quedó por encima del viewport sin llegar a intersecar", () => {
    // Un enlace ancla o la restauración de scroll pueden saltarse contenido.
    // Si no se revelara, quedaría oculto tras su máscara de forma permanente.
    document.body.innerHTML = `<i data-reveal></i>`;
    render(<RevealRoot />);
    const target = document.querySelector("i")!;

    FakeObserver.instances[0].trigger(target, {
      isIntersecting: false,
      boundingClientRect: { bottom: -320 } as DOMRectReadOnly
    });

    expect(target).toHaveAttribute("data-revealed");
  });

  it("no revela lo que aún está por debajo del viewport", () => {
    document.body.innerHTML = `<i data-reveal></i>`;
    render(<RevealRoot />);
    const target = document.querySelector("i")!;

    FakeObserver.instances[0].trigger(target, {
      isIntersecting: false,
      boundingClientRect: { bottom: 900 } as DOMRectReadOnly
    });

    expect(target).not.toHaveAttribute("data-revealed");
  });

  it("rescata por scroll lo que un salto dejó atrás sin notificar", () => {
    // IntersectionObserver no dispara si el elemento pasa de ratio 0 a ratio 0
    // en un solo frame. El barrido por scroll es la red de seguridad.
    document.body.innerHTML = `<i data-reveal></i>`;
    render(<RevealRoot />);
    const target = document.querySelector("i")!;
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue({ bottom: -500 } as DOMRect);
    window.dispatchEvent(new Event("scroll"));

    expect(target).toHaveAttribute("data-revealed");
  });

  it("desarma el revelado si el navegador no soporta IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<RevealRoot />);
    // Desarma explícitamente: más vale sin animación que con contenido oculto.
    expect(document.documentElement).toHaveAttribute("data-reveal-failed");
  });

  it("desconecta los observadores al desmontar", () => {
    const { unmount } = render(<RevealRoot />);
    unmount();
    expect(FakeObserver.instances[0].disconnected).toBe(true);
  });
});
