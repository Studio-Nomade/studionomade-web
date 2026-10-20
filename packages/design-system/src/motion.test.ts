import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { MOTION } from "./motion";
import { TOKENS } from "./tokens";

const css = fs.readFileSync(
  path.resolve(import.meta.dirname, "../styles/tokens/motion.css"),
  "utf8"
);
const value = (name: string) => css.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim();

describe("contrato de movimiento", () => {
  it("espeja las duraciones en segundos", () => {
    expect(value("--motion-dur")).toBe(`${MOTION.duration * 1000}ms`);
    expect(value("--motion-dur-counter")).toBe(`${MOTION.counterDuration * 1000}ms`);
  });

  it("espeja el desplazamiento del jump y la escala del mask", () => {
    expect(value("--motion-jump-y")).toBe(`${MOTION.jumpY}px`);
    expect(value("--motion-mask-scale")?.split(" ")[0]).toBe(String(MOTION.maskScale));
    expect(TOKENS["--motion-jump-y"]).toBe(`${MOTION.jumpY}px`);
    expect(value("--reveal-shift-lines")).toBe(`${MOTION.splitShift}%`);
  });

  it("anula el movimiento CSS con prefers-reduced-motion", () => {
    const reduced = css.slice(css.indexOf("prefers-reduced-motion"));
    for (const name of ["--motion-dur", "--motion-dur-counter", "--motion-jump-y"])
      expect(reduced).toMatch(new RegExp(`${name}:\\s*0(?:ms|px);`));
  });
});
