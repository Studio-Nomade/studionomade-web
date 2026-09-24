import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const css = fs.readFileSync(
  path.resolve(import.meta.dirname, "../styles/tokens/responsive.css"),
  "utf8"
);
const legacyMaximums = {
  "--fs-display-1": 72,
  "--fs-display-2": 56,
  "--fs-display-3": 44,
  "--fs-campaign-1": 88,
  "--fs-campaign-2": 60,
  "--fs-campaign-3": 40,
  "--fs-stat": 68,
  "--fs-h1": 36,
  "--fs-h2": 30,
  "--fs-h3": 24,
  "--fs-h4": 20,
  "--fs-h5": 17,
  "--fs-lead": 20,
  "--fs-eyebrow": 12
} as const;

/** Escalera grande tomada del sitio vivo. Se blinda igual que la legada. */
const liveMaximums = {
  "--fs-xxxl": 212,
  "--fs-xxl": 126,
  "--fs-xl": 102
} as const;

describe("escala fluida", () => {
  it("mantiene el máximo legado como tercer argumento de cada clamp", () => {
    for (const [token, maximum] of Object.entries(legacyMaximums)) {
      const value = css.match(new RegExp(`${token}:\\s*clamp\\(([^;]+)\\);`))?.[1];
      expect(value).toBeDefined();
      expect(value?.split(",").at(-1)?.trim()).toBe(`${maximum}px`);
    }
  });

  it("mantiene el máximo del sitio vivo en la escalera grande", () => {
    for (const [token, maximum] of Object.entries(liveMaximums)) {
      const value = css.match(new RegExp(`${token}:\\s*clamp\\(([^;]+)\\);`))?.[1];
      expect(value, token).toBeDefined();
      expect(value?.split(",").at(-1)?.trim()).toBe(`${maximum}px`);
    }
  });

  it("no hace fluidos los tamaños de cuerpo", () => {
    expect(css).not.toMatch(/--fs-(body|body-sm|caption)\s*:/);
  });
});
