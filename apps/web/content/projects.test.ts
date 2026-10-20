import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { CASE_CYCLE, getNextProject, publicProjects, type CaseImage } from "./projects";

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
      expect(project?.areaCode).toBe(project?.area === "branding" ? "B&D" : "A&D");
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

  it("no inventa enlaces de Behance (TODO-contenido)", () => {
    for (const project of publicProjects) {
      if (project.behanceUrl) expect(project.behanceUrl).toMatch(/^https:\/\/www\.behance\.net\//);
    }
  });
});
