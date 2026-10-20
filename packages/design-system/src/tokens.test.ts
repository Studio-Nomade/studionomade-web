import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import manifest from "../../../docs/design-system/ds-manifest.json";
import { ACCENTS } from "./accents";
import { TOKENS } from "./tokens";

const packageRoot = path.resolve(import.meta.dirname, "..");
const tokenDirectory = path.join(packageRoot, "styles/tokens");
const tokenFiles = fs.readdirSync(tokenDirectory).filter((file) => file.endsWith(".css"));
const css = tokenFiles
  .map((file) => fs.readFileSync(path.join(tokenDirectory, file), "utf8"))
  .join("\n");
const cssTokenNames = new Set(Array.from(css.matchAll(/(--[a-z0-9-]+)\s*:/gi), ([, name]) => name));

describe("contrato de tokens", () => {
  it("mantiene el espejo TypeScript y CSS sincronizado", () => {
    expect(new Set(Object.keys(TOKENS))).toEqual(cssTokenNames);
  });

  it("conserva los 175 tokens declarados por el manifiesto original", () => {
    expect(manifest.tokens).toHaveLength(175);
    for (const token of manifest.tokens) expect(cssTokenNames.has(token.name)).toBe(true);
  });

  it("define las cinco variables para cada acento", () => {
    const accentCss = fs.readFileSync(path.join(tokenDirectory, "accents.css"), "utf8");
    for (const accent of ACCENTS) {
      const block = accentCss.match(
        new RegExp(`\\[data-accent=["']${accent}["']\\]\\s*\\{([^}]+)\\}`)
      )?.[1];
      expect(block).toBeDefined();
      for (const name of [
        "--accent",
        "--accent-contrast",
        "--accent-soft",
        "--accent-line",
        "--accent-2"
      ])
        expect(block).toMatch(new RegExp(`${name}\\s*:`));
    }
  });

  it("aplica los acentos de caso decididos por el cliente", () => {
    const accentCss = fs.readFileSync(path.join(tokenDirectory, "accents.css"), "utf8");
    const expected = {
      cinnalove: "#813408",
      nexa: "#dc5c34",
      kumelen: "#d89840",
      reebok: "#ef1942",
      equifax: "#ef1942"
    } as const;
    for (const [accent, value] of Object.entries(expected)) {
      const block = accentBlock(accentCss, accent);
      expect(block?.match(/--accent:\s*(#[0-9a-f]{6})/i)?.[1]?.toLowerCase(), accent).toBe(value);
    }
  });

  it("garantiza contraste AA entre cada acento y su color de contraste", () => {
    const accentCss = fs.readFileSync(path.join(tokenDirectory, "accents.css"), "utf8");
    for (const accent of ACCENTS) {
      const block = accentBlock(accentCss, accent)!;
      const background = block.match(/--accent:\s*(#[0-9a-f]{6})/i)?.[1];
      const foreground = block.match(/--accent-contrast:\s*(#[0-9a-f]{6})/i)?.[1];
      if (!background || !foreground) continue;
      expect(contrast(background, foreground), accent).toBeGreaterThanOrEqual(4.5);
    }
  });
});

function accentBlock(accentCss: string, accent: string) {
  return accentCss.match(new RegExp(`\\[data-accent=["']${accent}["']\\]\\s*\\{([^}]+)\\}`))?.[1];
}

/** Contraste WCAG 2.x entre dos colores hexadecimales de 6 dígitos. */
function contrast(a: string, b: string) {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((offset) => {
      const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}
