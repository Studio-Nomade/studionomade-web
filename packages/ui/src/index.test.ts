import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import * as ui from "./index";

const components = [
  "Button",
  "CampaignCTA",
  "CampaignDisplay",
  "CampaignHero",
  "Checkbox",
  "Circled",
  "Eyebrow",
  "Field",
  "Footer",
  "Mark",
  "MenuToggle",
  "Reveal",
  "RevealRoot",
  "Rule",
  "Section",
  "Select",
  "StepFlow",
  "SplitLines",
  "SubmitRow",
  "TextArea"
].sort();

describe("puerta pública de @studionomade/ui", () => {
  it("exporta exactamente el censo declarado", () => {
    expect(Object.keys(ui).sort()).toEqual(components);
  });

  it("mantiene una guía prompt junto a cada componente", () => {
    const source = path.resolve(import.meta.dirname);
    for (const directory of ["core", "layout", "campaign", "forms", "motion"]) {
      for (const file of fs
        .readdirSync(path.join(source, directory))
        .filter((name) => name.endsWith(".tsx") && !name.endsWith(".test.tsx"))) {
        expect(
          fs.existsSync(path.join(source, directory, file.replace(/\.tsx$/, ".prompt.md")))
        ).toBe(true);
      }
    }
  });

  it("rechaza un deep import por exports", () => {
    expect(() =>
      execFileSync(
        process.execPath,
        ["--input-type=module", "-e", "import('@studionomade/ui/src/core/button')"],
        { cwd: path.resolve(import.meta.dirname, "../../../apps/web"), stdio: "pipe" }
      )
    ).toThrow();
  });
});
