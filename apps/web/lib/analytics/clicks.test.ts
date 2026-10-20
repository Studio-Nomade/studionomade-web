import { describe, expect, it } from "vitest";

import { classifyClick } from "./clicks";

function element(html: string, selector: string) {
  document.body.innerHTML = html;
  return document.querySelector(selector);
}

describe("classifyClick", () => {
  it("detecta un CTA marcado en su contenedor", () => {
    const target = element(
      '<div data-cta="agendar"><a href="#form"><span id="t">Agendar</span></a><p id="c">Nota</p></div>',
      "#t"
    );
    expect(classifyClick(target, "/campanas/inmobiliarias")).toEqual({
      event: "cta_click",
      properties: { cta: "agendar", path: "/campanas/inmobiliarias" }
    });
  });

  it("ignora clicks dentro del contenedor que no son enlace ni botón", () => {
    expect(classifyClick(element('<div data-cta="x"><p id="c">Nota</p></div>', "#c"), "/")).toBe(
      null
    );
  });

  it("clasifica mailto, tel y WhatsApp como contacto sin exponer el destino", () => {
    expect(classifyClick(element('<a id="m" href="mailto:a@b.cl">a</a>', "#m"), "/")).toEqual({
      event: "contact_click",
      properties: { channel: "email", path: "/" }
    });
    expect(
      classifyClick(element('<a id="p" href="tel:+56900000000">p</a>', "#p"), "/")?.properties
    ).toEqual({ channel: "phone", path: "/" });
    expect(
      classifyClick(element('<a id="w" href="https://wa.me/56900000000">w</a>', "#w"), "/")
        ?.properties.channel
    ).toBe("whatsapp");
  });

  it("ignora enlaces comunes", () => {
    expect(classifyClick(element('<a id="l" href="/proyectos">l</a>', "#l"), "/")).toBe(null);
  });
});
