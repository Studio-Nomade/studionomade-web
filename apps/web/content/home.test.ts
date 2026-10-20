import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { LEAD_CONSENTS, isLeadConsentVersion } from "./legal/consentimientos";
import {
  AREA_LABELS,
  HOME_CONTACT_CONSENT_VERSION,
  HOME_FEATURED,
  HOME_INSTAGRAM,
  HOME_MEETING,
  HOME_OFFICES,
  HOME_POSTS,
  HOME_REEL,
  HOME_SERVICES,
  reelEmbedUrl
} from "./home";

const publicDir = resolve(__dirname, "../public");

describe("contenido de la home", () => {
  it("el hero muestra los 5 casos del rediseño, en el orden del ciclo", () => {
    expect(HOME_FEATURED.map((project) => project.slug)).toEqual([
      "cinnalove",
      "kumelen",
      "equifax",
      "reebok-x-lollapalooza",
      "nexa"
    ]);
  });

  it("el código de área corresponde al área de negocio", () => {
    for (const project of HOME_FEATURED) {
      expect(project.code).toBe(project.area === "branding" ? "B&D" : "A&D");
      expect(AREA_LABELS[project.code]).toBeTruthy();
      expect(project.year).toMatch(/^20\d{2}$/);
    }
  });

  it("todas las imágenes existen en public/ y son WebP", () => {
    const sources = [
      ...HOME_FEATURED.map((project) => project.image.src),
      ...HOME_SERVICES.map((service) => service.image.src),
      ...HOME_INSTAGRAM.images.map((image) => image.src),
      ...HOME_POSTS.map((post) => post.image.src),
      HOME_MEETING.image.src,
      HOME_REEL.poster.src
    ];
    for (const src of sources) {
      expect(src, src).toMatch(/^\/home\/.+\.webp$/);
      expect(existsSync(resolve(publicDir, `.${src}`)), src).toBe(true);
    }
  });

  it("las imágenes con contenido llevan texto alternativo", () => {
    for (const project of HOME_FEATURED) expect(project.image.alt.length).toBeGreaterThan(10);
    expect(HOME_REEL.poster.alt.length).toBeGreaterThan(10);
  });

  it("solo Branding y Architecture enlazan a su área; el resto lleva al contacto", () => {
    expect(HOME_SERVICES.map((service) => [service.name, service.href])).toEqual([
      ["Branding", "/areas/branding"],
      ["Architecture", "/areas/architecture"],
      ["Audiovisual", "#contacto"],
      ["Web Design", "#contacto"]
    ]);
  });

  it("el formulario usa el consentimiento vigente con enlace a /privacidad", () => {
    expect(isLeadConsentVersion(HOME_CONTACT_CONSENT_VERSION)).toBe(true);
    const consent = LEAD_CONSENTS[HOME_CONTACT_CONSENT_VERSION];
    expect("link" in consent && consent.link.href).toBe("/privacidad");
  });

  it("las oficinas enlazan a Google Maps con su dirección", () => {
    expect(HOME_OFFICES.map((office) => office.name)).toEqual([
      "Oficina Principal",
      "Estudio Fotográfico"
    ]);
    for (const office of HOME_OFFICES) {
      const url = new URL(office.mapsUrl);
      expect(url.origin).toBe("https://www.google.com");
      expect(url.searchParams.get("query")).toContain(office.address.replace("Av.", "Avenida"));
    }
  });
});

describe("reelEmbedUrl", () => {
  it("convierte una URL pública de Vimeo en la del reproductor", () => {
    expect(reelEmbedUrl("https://vimeo.com/123456789")).toBe(
      "https://player.vimeo.com/video/123456789?autoplay=1&dnt=1"
    );
    expect(reelEmbedUrl("https://player.vimeo.com/video/42")).toBe(
      "https://player.vimeo.com/video/42?autoplay=1&dnt=1"
    );
  });

  it("conserva el hash de un video no listado", () => {
    expect(reelEmbedUrl("https://vimeo.com/123/abc123def")).toBe(
      "https://player.vimeo.com/video/123?h=abc123def&autoplay=1&dnt=1"
    );
  });

  it("rechaza lo que el CSP no permite o no es una URL de video", () => {
    expect(reelEmbedUrl("")).toBeNull();
    expect(reelEmbedUrl("no es una url")).toBeNull();
    expect(reelEmbedUrl("http://vimeo.com/123")).toBeNull();
    expect(reelEmbedUrl("https://www.youtube.com/watch?v=abc")).toBeNull();
    expect(reelEmbedUrl("https://vimeo.com/studionomade")).toBeNull();
    expect(reelEmbedUrl("https://evil.example/vimeo.com/123")).toBeNull();
  });

  it("el reel vacío no rompe la home (TODO-contenido)", () => {
    expect(typeof HOME_REEL.reelUrl).toBe("string");
  });
});
