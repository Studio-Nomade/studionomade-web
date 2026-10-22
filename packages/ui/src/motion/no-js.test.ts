import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Garantía transversal: sin JavaScript o con movimiento reducido NADA queda
 * oculto. Todo pre-ocultado (`:not([data-revealed])`, `:not([data-split-ready])`,
 * capas de máscara, preloader) debe vivir dentro del único bloque que arma el
 * movimiento.
 */
const GUARD = "@media (scripting: enabled) and (prefers-reduced-motion: no-preference)";
const directory = import.meta.dirname;
const sheets = fs.readdirSync(directory).filter((file) => file.endsWith(".module.css"));

function outsideGuard(css: string) {
  const start = css.indexOf(GUARD);
  if (start === -1) return css;
  // Recorta el bloque balanceando llaves.
  let depth = 0;
  let index = css.indexOf("{", start);
  for (; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") depth -= 1;
    if (depth === 0) break;
  }
  return css.slice(0, start) + outsideGuard(css.slice(index + 1));
}

describe("pre-ocultado del movimiento", () => {
  it.each(sheets)("%s solo oculta bajo scripting + movimiento permitido", (file) => {
    const css = fs.readFileSync(path.join(directory, file), "utf8");
    const outside = outsideGuard(css);
    expect(outside).not.toMatch(/:not\(\[data-(revealed|split-ready|motion-done)\]\)/);
    expect(outside).not.toMatch(/data-preloaded/);
  });
});
