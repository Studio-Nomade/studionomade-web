import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { faviconFor, STUDIO_AREAS } from "./area-meta";
import { areas, isAreaSlug, plainText, type AreaImage } from "./areas";
import { AREA_TEAMS, initials } from "./team";

const publicDir = path.resolve(import.meta.dirname, "../public");

function allImages(slug: keyof typeof areas): AreaImage[] {
  const area = areas[slug];
  const hero = area.hero.kind === "carousel" ? area.hero.slides : [area.hero.image];
  return [...hero, area.values.image, area.scope.image, ...area.gallery];
}

const ALL_SLUGS = ["branding", "architecture", "audiovisual", "web-design"] as const;

describe("contenido de áreas", () => {
  it("todas las imágenes existen en public y tienen texto alternativo", () => {
    for (const slug of ALL_SLUGS) {
      for (const image of allImages(slug)) {
        expect(existsSync(path.join(publicDir, image.src)), image.src).toBe(true);
        expect(image.alt.length, image.src).toBeGreaterThan(10);
      }
    }
  });

  it("cubre las cuatro áreas de area-meta con su acento y favicon", () => {
    expect(Object.keys(areas).sort()).toEqual(STUDIO_AREAS.map((area) => area.slug).sort());
    for (const meta of STUDIO_AREAS) {
      expect(isAreaSlug(meta.slug)).toBe(true);
      expect(areas[meta.slug].slug).toBe(meta.slug);
      expect(areas[meta.slug].accent).toBe(meta.accent);
      const icons = faviconFor(meta.slug) as { icon: Array<{ url: string }> };
      for (const icon of icons.icon) {
        expect(existsSync(path.join(publicDir, icon.url)), icon.url).toBe(true);
      }
    }
    expect(isAreaSlug("toString")).toBe(false);
    expect(isAreaSlug("motion")).toBe(false);
  });

  it("Audiovisual y Web Design no inventan cifras: usan frentes de trabajo", () => {
    for (const slug of ["audiovisual", "web-design"] as const) {
      expect(areas[slug].scope.stats).toEqual([]);
      expect(areas[slug].scope.points?.length).toBeGreaterThan(0);
      const text = JSON.stringify(areas[slug]);
      expect(text, slug).not.toMatch(/\+\s?\d/);
      expect(AREA_TEAMS[slug]).toEqual([]);
    }
    expect(areas.audiovisual.services).toEqual([
      "Producción Audiovisual",
      "Animación",
      "Reels y contenido para redes",
      "Cápsulas corporativas",
      "Cobertura de eventos"
    ]);
    expect(areas["web-design"].services).toEqual([
      "Diseño UI/UX",
      "Sitios web",
      "Landing pages",
      "E-commerce",
      "Plataformas a medida"
    ]);
  });

  it("la galería alterna pares y filas anchas", () => {
    expect(areas.branding.gallery.map((image) => Boolean(image.wide))).toEqual([
      false,
      false,
      true
    ]);
    expect(areas.audiovisual.gallery.filter((image) => image.wide)).toHaveLength(2);
    expect(areas["web-design"].gallery.every((image) => image.fit === "contain")).toBe(true);
  });

  it("Branding usa Boden en Valores y Berose en Alcance (no cruzadas)", () => {
    expect(areas.branding.values.image.src).toContain("valores-boden");
    expect(areas.branding.scope.image.src).toContain("alcance-berose");
  });

  it("Branding lleva carrusel de 3 mockups y Architecture imagen sobre banda", () => {
    expect(areas.branding.hero.kind).toBe("carousel");
    if (areas.branding.hero.kind === "carousel") expect(areas.branding.hero.slides).toHaveLength(3);
    expect(areas.architecture.hero.kind).toBe("banded");
  });

  it("aplica las decisiones del cliente sobre el texto de Figma", () => {
    expect(plainText(areas.architecture.what).trim().endsWith(".")).toBe(true);
    expect(areas.architecture.scope.stats).toEqual([
      { value: 50, prefix: "+", label: "Experiencias diseñadas" }
    ]);
    expect(areas.branding.method.pills).toHaveLength(0);
    expect(areas.architecture.method.pills).toHaveLength(4);
  });

  it("el equipo de cada área sigue el orden de Figma", () => {
    expect(AREA_TEAMS.branding.map((member) => member.name)).toContain("Fa Casol");
    expect(AREA_TEAMS.branding).toHaveLength(5);
    const architecture = AREA_TEAMS.architecture.map((member) => member.name);
    expect(architecture).toHaveLength(6);
    expect(architecture).not.toContain("Fa Casol");
    expect(architecture.slice(-2)).toEqual(["Ernesto Ojeda", "Nicolás Rebolledo"]);
  });

  it("calcula iniciales de nombre y apellido", () => {
    expect(initials("Nicolás Rebolledo")).toBe("NR");
    expect(initials("Fa Casol")).toBe("FC");
    expect(initials("ana")).toBe("A");
  });
});
