import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { STUDIO_AREAS } from "./area-meta";
import {
  HOME_AREAS,
  HOME_CONTACT,
  HOME_HERO_SLIDES,
  HOME_INSTAGRAM,
  HOME_MANIFESTO,
  HOME_MEETING,
  HOME_OFFICES,
  HOME_POSTS,
  HOME_REEL,
  reelEmbedUrl
} from "./home";
import { publicProjects } from "./projects";

const publicDir = resolve(__dirname, "../public");

describe("contenido de la home", () => {
  it("el hero muestra los casos publicados, en su orden", () => {
    expect(HOME_HERO_SLIDES.map((slide) => slide.slug)).toEqual(
      publicProjects.map((project) => project.slug)
    );
    expect(HOME_HERO_SLIDES).toHaveLength(6);
  });

  it("cada diapositiva enlaza a su caso con la sigla y el año del área", () => {
    for (const slide of HOME_HERO_SLIDES) {
      const project = publicProjects.find((item) => item.slug === slide.slug)!;
      expect(slide.href).toBe(`/proyectos/${slide.slug}`);
      expect(slide.code).toBe(project.areaCode);
      expect(slide.code).toBe(STUDIO_AREAS.find((area) => area.slug === slide.area)?.code);
      expect(slide.year).toMatch(/^20\d{2}$/);
    }
  });

  it("todas las imágenes existen en public/ y son WebP", () => {
    const sources = [
      ...HOME_HERO_SLIDES.map((slide) => slide.image.src),
      ...HOME_AREAS.flatMap((area) => area.images.map((image) => image.src)),
      ...HOME_INSTAGRAM.images.map((image) => image.src),
      ...HOME_POSTS.map((post) => post.image.src),
      HOME_MEETING.image.src,
      HOME_REEL.poster.src
    ];
    for (const src of sources) {
      expect(src, src).toMatch(/^\/(home|areas|proyectos)\/.+\.webp$/);
      expect(existsSync(resolve(publicDir, `.${src}`)), src).toBe(true);
    }
  });

  it("las imágenes con contenido llevan texto alternativo", () => {
    for (const slide of HOME_HERO_SLIDES) expect(slide.image.alt.length).toBeGreaterThan(10);
    for (const area of HOME_AREAS) {
      for (const image of area.images) expect(image.alt.length).toBeGreaterThan(10);
    }
    expect(HOME_REEL.poster.alt.length).toBeGreaterThan(10);
  });

  it("las cuatro áreas enlazan a su página con dos imágenes distintas e isologo", () => {
    expect(HOME_AREAS.map((area) => [area.code, area.href])).toEqual([
      ["B&D", "/areas/branding"],
      ["A&D", "/areas/architecture"],
      ["A&A", "/areas/audiovisual"],
      ["WD", "/areas/web-design"]
    ]);
    for (const area of HOME_AREAS) {
      expect(area.images[0].src).not.toBe(area.images[1].src);
      expect(existsSync(resolve(publicDir, `.${area.symbol}`)), area.symbol).toBe(true);
      expect(area.description.length).toBeGreaterThan(20);
    }
  });

  it("el equipo y el contacto viven en sus páginas", () => {
    expect(HOME_MANIFESTO.cta.href).toBe("/nosotros");
    expect(HOME_CONTACT.primary.href).toBe("/contacto");
    expect(HOME_CONTACT.secondary.href).toBe("/contacto#agenda");
    expect(HOME_MEETING.href).toBe("/contacto#agenda");
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
