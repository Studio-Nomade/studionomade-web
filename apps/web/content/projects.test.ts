import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { AREA_BY_SLUG } from "./area-meta";
import {
  AREA_LABELS,
  CASE_CYCLE,
  getNextProject,
  getPublicProject,
  publicProjects,
  type CaseImage
} from "./projects";

const publicDir = path.resolve(import.meta.dirname, "../public");

function images(): CaseImage[] {
  return publicProjects.flatMap((project) => [
    project.cover,
    ...project.blocks.flatMap((block) => {
      switch (block.type) {
        case "hero":
        case "media":
        case "zones":
          return [block.image];
        case "grid":
          return block.items.map((item) => item.image);
        case "bento":
        case "strip":
        case "phones":
          return block.items;
        case "slider":
          return block.slides.map((slide) => slide.image);
        default:
          return [];
      }
    })
  ]);
}

describe("casos de estudio", () => {
  it("publica los cinco casos del rediseño con código de área", () => {
    for (const slug of CASE_CYCLE) {
      const project = publicProjects.find((item) => item.slug === slug);
      expect(project, slug).toBeDefined();
      expect(project?.areaCode).toBe(project ? AREA_BY_SLUG[project.area].code : undefined);
      expect(project?.blocks[0]?.type, slug).toBe("hero");
      expect(project?.blocks.at(-1)?.type, slug).toBe("credits");
    }
  });

  it("recorre el ciclo del sitio legado en «Siguiente proyecto»", () => {
    const order = ["cinnalove", "kumelen", "equifax", "reebok-x-lollapalooza", "nexa"];
    order.forEach((slug, index) =>
      expect(getNextProject(slug).slug).toBe(order[(index + 1) % order.length])
    );
    expect(getNextProject("jaecoo-7").slug).toBe("cinnalove");
  });

  it("normaliza las inconsistencias del canvas", () => {
    const text = JSON.stringify(publicProjects);
    expect(text).not.toContain('"role":"Client"');
    expect(text).not.toContain("Cameron Stone");
    expect(text).not.toContain("Acceso infinite Tunnel");
    expect(text).not.toContain("Zona temática");
  });

  it("referencia imágenes existentes, con texto alternativo", () => {
    for (const image of images()) {
      expect(image.alt.length, image.src).toBeGreaterThan(3);
      expect(fs.existsSync(path.join(publicDir, image.src)), image.src).toBe(true);
    }
  });

  it("enlaza Behance solo en los casos publicados allí", () => {
    const withBehance = publicProjects
      .filter((project) => project.behanceUrl)
      .map((project) => project.slug)
      .sort();
    expect(withBehance).toEqual(["cinnalove", "kumelen", "nexa"]);
    for (const project of publicProjects) {
      if (project.behanceUrl)
        expect(project.behanceUrl).toMatch(/^https:\/\/www\.behance\.net\/gallery\/\d+\//);
    }
    expect(getPublicProject("nexa")?.behanceUrl).toBe(
      "https://www.behance.net/gallery/217881153/NEXA-BRANDING"
    );
  });

  it("cada caso trae los textos del listado y una sigla de las cuatro áreas", () => {
    for (const project of publicProjects) {
      expect(project.areaCode, project.slug).toBe(AREA_BY_SLUG[project.area].code);
      expect(AREA_LABELS[project.areaCode], project.slug).toBeTruthy();
      expect(project.tagline.startsWith(`${project.displayName} - `), project.slug).toBe(true);
      expect(project.tagline.length, project.slug).toBeLessThan(60);
      expect(project.excerpt.length, project.slug).toBeGreaterThan(20);
      expect(project.excerpt.length, project.slug).toBeLessThanOrEqual(100);
    }
    expect(AREA_LABELS).toEqual({
      "B&D": "Branding & Design",
      "A&D": "Architecture & Design",
      "A&A": "Audiovisual & Animation",
      WD: "Web Design"
    });
  });

  it("normaliza el nombre del listado a solo la primera letra en mayúscula", () => {
    expect(publicProjects.map((project) => project.displayName)).toEqual([
      "Cinnalove",
      "Kumelen",
      "Equifax",
      "Reebok x Lollapalooza",
      "Nexa",
      "Jaecoo 7"
    ]);
    for (const { displayName } of publicProjects) {
      const [first, ...rest] = displayName.split(" ");
      // La primera palabra: inicial mayúscula y el resto en minúscula.
      expect(first.slice(1), displayName).toBe(first.slice(1).toLowerCase());
      expect(first[0], displayName).toBe(first[0].toUpperCase());
      // Las demás solo pueden ser nombres propios (inicial mayúscula), conectores o cifras.
      for (const word of rest)
        expect(word, displayName).toMatch(/^(?:x|\d+|[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)$/);
    }
  });
});
