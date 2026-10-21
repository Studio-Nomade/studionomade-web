import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { ABOUT } from "./about";
import { STUDIO_AREAS } from "./area-meta";
import { AREA_TEAMS, TEAM } from "./team";

const publicFile = (src: string) => resolve(__dirname, "../public", src.replace(/^\//, ""));

describe("contenido de /nosotros", () => {
  it("usa imágenes que existen en public/", () => {
    for (const image of [ABOUT.hero.image, ...ABOUT.foundation.images]) {
      expect(existsSync(publicFile(image.src)), image.src).toBe(true);
      expect(image.alt.length).toBeGreaterThan(10);
    }
  });

  it("lista las cuatro bases con zonas horarias válidas", () => {
    expect(ABOUT.locations.items.map((location) => location.city)).toEqual([
      "Santiago",
      "Algarrobo",
      "Madrid",
      "Lisboa"
    ]);
    for (const { timeZone } of ABOUT.locations.items) {
      expect(() => new Intl.DateTimeFormat("es-CL", { timeZone })).not.toThrow();
    }
  });

  it("describe las cuatro áreas y numera cuatro pasos de método", () => {
    for (const area of STUDIO_AREAS) expect(ABOUT.areas.descriptions[area.slug]).toBeTruthy();
    expect(ABOUT.method.steps.map((step) => step.title)).toEqual([
      "Descubrir",
      "Estrategia",
      "Diseño y desarrollo",
      "Implementación y acompañamiento"
    ]);
  });
});

describe("equipo centralizado", () => {
  it("cada persona aparece una vez y pertenece al menos a un área", () => {
    expect(new Set(TEAM.map((member) => member.id)).size).toBe(TEAM.length);
    for (const member of TEAM) expect(member.areas.length).toBeGreaterThan(0);
  });

  it("el equipo de cada área se deriva de TEAM sin perder a nadie", () => {
    const fromAreas = new Set(Object.values(AREA_TEAMS).flatMap((team) => team.map((m) => m.id)));
    expect(fromAreas).toEqual(new Set(TEAM.map((member) => member.id)));
    expect(AREA_TEAMS.branding[0]).not.toHaveProperty("areas");
  });
});
