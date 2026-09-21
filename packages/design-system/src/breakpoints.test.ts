import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { BREAKPOINTS } from "./breakpoints";

const css = fs.readFileSync(
  path.resolve(import.meta.dirname, "../styles/tokens/responsive.css"),
  "utf8"
);

describe("breakpoints", () => {
  it("mantiene los literales CSS alineados con el contrato TypeScript", () => {
    const widths = Array.from(css.matchAll(/@media \(min-width:\s*(\d+)px\)/g), ([, width]) =>
      Number(width)
    );
    expect(widths).toEqual(Object.values(BREAKPOINTS));
  });
});
