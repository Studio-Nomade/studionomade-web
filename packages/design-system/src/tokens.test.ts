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
});
