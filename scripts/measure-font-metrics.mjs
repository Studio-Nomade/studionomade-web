import * as fontkit from "fontkit";
import path from "node:path";

const sanDiegoPath = path.resolve(
  process.argv[2] ?? "packages/design-system/fonts/san-diego-medium.woff2"
);
const arialPath = path.resolve(process.argv[3] ?? "/System/Library/Fonts/Supplemental/Arial.ttf");

function metrics(fontPath) {
  const font = fontkit.openSync(fontPath);
  return {
    unitsPerEm: font.unitsPerEm,
    ascender: font.hhea.ascent,
    descender: font.hhea.descent,
    xAvgCharWidth: font["OS/2"].xAvgCharWidth
  };
}

const target = metrics(sanDiegoPath);
const fallback = metrics(arialPath);
const normalizedTargetWidth = target.xAvgCharWidth / target.unitsPerEm;
const normalizedFallbackWidth = fallback.xAvgCharWidth / fallback.unitsPerEm;
const sizeAdjust = normalizedTargetWidth / normalizedFallbackWidth;
const percent = (value) => `${(value * 100).toFixed(2)}%`;

const output = {
  target,
  fallback,
  overrides: {
    sizeAdjust: percent(sizeAdjust),
    ascentOverride: percent(target.ascender / target.unitsPerEm / sizeAdjust),
    descentOverride: percent(Math.abs(target.descender) / target.unitsPerEm / sizeAdjust)
  }
};

console.log(JSON.stringify(output, null, 2));
