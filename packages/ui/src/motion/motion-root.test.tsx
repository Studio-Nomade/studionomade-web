import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MotionRoot } from "./motion-root";
import { RevealRoot } from "./reveal-root";

/**
 * Motor GSAP falso y determinista: registra cada ScrollTrigger creado para
 * poder dispararlo a mano, y cada animación para saltarla al final.
 */
const triggers: Array<{ trigger: Element; start: string; once: boolean; onEnter: () => void }> = [];
const reverted = vi.fn();
const animation = () => {
  const self = {
    eventCallback: vi.fn((_: string, callback: () => void) => {
      self.complete = callback;
      return self;
    }),
    progress: vi.fn(() => self),
    play: vi.fn(() => self),
    complete: undefined as undefined | (() => void)
  };
  return self;
};
const fakeGsap = {
  context: () => ({ add: (fn: () => void) => fn(), revert: reverted }),
  fromTo: vi.fn(animation),
  to: vi.fn(animation),
  set: vi.fn(),
  timeline: vi.fn(() => ({ ...animation(), fromTo: vi.fn() }))
};
const engine = {
  gsap: fakeGsap,
  ScrollTrigger: {
    create: vi.fn((config) => triggers.push(config)),
    refresh: vi.fn()
  },
  SplitText: { create: vi.fn() }
};

const loadMotion = vi.fn(() => Promise.resolve(engine));
vi.mock("./runtime", async (original) => ({
  ...(await original<typeof import("./runtime")>()),
  loadMotion: () => loadMotion()
}));

function setReducedMotion(reduce: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduce && query.includes("reduce"),
    addEventListener() {},
    removeEventListener() {}
  }));
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  triggers.length = 0;
  vi.clearAllMocks();
  setReducedMotion(false);
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

describe("MotionRoot", () => {
  it("señala que la hidratación llegó, para desactivar el watchdog", () => {
    render(<MotionRoot />);
    expect(window.__snRevealReady).toBe(true);
  });

  it("crea un disparador por elemento al 85% del viewport, una sola vez", async () => {
    document.body.innerHTML = `<i data-reveal data-motion="jump"></i><i data-reveal data-motion="fade"></i>`;
    render(<MotionRoot />);
    await flush();
    expect(triggers).toHaveLength(2);
    for (const trigger of triggers) expect(trigger).toMatchObject({ start: "top 85%", once: true });
  });

  it("marca data-revealed al disparar y data-motion-done al terminar", async () => {
    document.body.innerHTML = `<i data-reveal data-motion="jump"></i>`;
    render(<MotionRoot />);
    await flush();
    const target = document.querySelector("i")!;
    expect(target).not.toHaveAttribute("data-revealed");

    triggers[0].onEnter();
    expect(target).toHaveAttribute("data-revealed");
    // La animación se crea ANTES de quitar el pre-ocultado del CSS.
    expect(fakeGsap.fromTo).toHaveBeenCalledWith(
      target,
      expect.objectContaining({ y: 30, autoAlpha: 0 }),
      expect.objectContaining({ y: 0, autoAlpha: 1, duration: 1.2, ease: "power3.out" })
    );
    fakeGsap.fromTo.mock.results[0].value.complete();
    expect(target).toHaveAttribute("data-motion-done");
  });

  it("revela en el acto lo que un salto de scroll dejó por encima del viewport", async () => {
    document.body.innerHTML = `<i data-reveal data-motion="jump"></i>`;
    const target = document.querySelector("i")!;
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue({ bottom: -500 } as DOMRect);
    render(<MotionRoot />);
    await flush();
    expect(target).toHaveAttribute("data-revealed");
  });

  it("recoge contenido que llega después y limpia el que sale del DOM", async () => {
    render(<MotionRoot />);
    await flush();
    const late = document.createElement("div");
    late.dataset.motion = "jump";
    late.dataset.reveal = "";
    document.body.append(late);
    await flush();
    expect(triggers.some((trigger) => trigger.trigger === late)).toBe(true);

    late.remove();
    await flush();
    expect(reverted).toHaveBeenCalled();
  });

  it("con movimiento reducido no carga GSAP ni toca el contenido", async () => {
    setReducedMotion(true);
    document.body.innerHTML = `<i data-reveal data-motion="jump">visible</i>`;
    render(<MotionRoot />);
    await flush();
    expect(loadMotion).not.toHaveBeenCalled();
    expect(document.querySelector("i")!.getAttribute("style")).toBeNull();
  });

  it("si GSAP no carga, desarma el pre-ocultado", async () => {
    loadMotion.mockReturnValueOnce(Promise.reject(new Error("offline")) as never);
    render(<MotionRoot />);
    await flush();
    expect(document.documentElement).toHaveAttribute("data-reveal-failed");
  });

  it("RevealRoot es el mismo componente", () => {
    expect(RevealRoot).toBe(MotionRoot);
  });
});
