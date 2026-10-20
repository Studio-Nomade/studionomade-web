import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PageTransition, shouldTransition } from "./page-transition";

vi.mock("./runtime", async (original) => ({
  ...(await original<typeof import("./runtime")>()),
  loadMotion: () => new Promise(() => {})
}));

const location = new URL("/proyectos", window.location.origin) as unknown as Location;

function click(html: string, init: MouseEventInit = {}) {
  document.body.innerHTML = html;
  const target = document.querySelector("a")!;
  const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init });
  Object.defineProperty(event, "target", { value: target });
  return event;
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("shouldTransition", () => {
  it("intercepta enlaces internos a otra ruta", () => {
    expect(shouldTransition(click(`<a href="/contacto?x=1#f">c</a>`), location)).toBe(
      "/contacto?x=1#f"
    );
  });

  it("deja pasar lo que no es una navegación interna a otra página", () => {
    const cases: Array<[string, MouseEventInit?]> = [
      [`<a href="https://otro.cl/">externo</a>`],
      [`<a href="/proyectos#galeria">ancla</a>`],
      [`<a href="/contacto" target="_blank">pestaña</a>`],
      [`<a href="/brief.pdf" download>descarga</a>`],
      [`<a href="/contacto" data-transition="off">excluido</a>`],
      [`<a href="/contacto">meta</a>`, { metaKey: true }],
      [`<a href="/contacto">medio</a>`, { button: 1 }]
    ];
    for (const [html, init] of cases)
      expect(shouldTransition(click(html, init), location), html).toBeNull();
  });
});

describe("PageTransition", () => {
  it("renderiza una cortina decorativa inactiva", () => {
    const { container } = render(<PageTransition pathname="/" navigate={() => {}} />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstElementChild).not.toHaveAttribute("data-active");
  });

  it("con movimiento reducido no intercepta: el enlace navega normal", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce") }));
    const navigate = vi.fn();
    render(<PageTransition pathname="/" navigate={navigate} />);
    document.body.insertAdjacentHTML("beforeend", `<a id="l" href="/contacto">c</a>`);
    let preventedByTransition: boolean | undefined;
    const observe = (event: MouseEvent) => {
      preventedByTransition = event.defaultPrevented;
      event.preventDefault(); // jsdom no implementa la navegación
    };
    document.addEventListener("click", observe);
    document.getElementById("l")!.click();
    document.removeEventListener("click", observe);
    expect(preventedByTransition).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });
});
