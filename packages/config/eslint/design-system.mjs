import fs from "node:fs";

import noHardcodedStyle from "./rules/no-hardcoded-style.mjs";

const reference = JSON.parse(
  fs.readFileSync(new URL("./reference/adherence.oxlintrc.json", import.meta.url), "utf8")
);

const legacySyntax = reference.rules["no-restricted-syntax"].slice(1).map((entry) => ({
  ...entry,
  selector: entry.selector
    .replace("textureSrc|artSrc|onClick", "texture|art|href|onClick")
    .replace("textureSrc|artSrc|height", "texture|art|height")
    .replace(
      "label|id|checked|onChange|invert",
      "label|name|id|checked|defaultChecked|onChange|required|hint|error|invert"
    )
    .replace(
      "label|id|type|placeholder|value|onChange|required|hint|error|invert",
      "label|name|id|type|placeholder|value|defaultValue|onChange|required|hint|error|invert"
    )
    .replace(
      "label|note|onSubmit|variant|invert|accent",
      "label|pendingLabel|note|variant|invert|accent"
    )
    .replace(
      "label|id|rows|placeholder|value|onChange|invert",
      "label|name|id|rows|placeholder|value|defaultValue|onChange|required|hint|error|invert"
    )
    .replace(
      "variant|size|shape|accent|disabled|href|children",
      "variant|size|shape|accent|disabled|href|type|onClick|children"
    )
}));

const files = ["**/*.{js,jsx,ts,tsx}"];
const restrictedImports = [
  "tailwindcss",
  "styled-components",
  "stitches",
  "cva",
  "clsx",
  "next/font"
];

export default [
  {
    files,
    plugins: { "studio-nomade": { rules: { "no-hardcoded-style": noHardcodedStyle } } },
    rules: {
      "studio-nomade/no-hardcoded-style": "error",
      "no-restricted-syntax": ["error", ...legacySyntax],
      "no-restricted-imports": [
        "error",
        {
          paths: restrictedImports.map((name) => ({
            name,
            message: "Use only the Studio Nomade design-system stack."
          })),
          patterns: [
            {
              group: ["@studionomade/ui/src/*", "@studionomade/ui/src/**"],
              message: "Import components from @studionomade/ui only."
            },
            {
              group: ["../../packages/**", "../../../packages/**", "../../../../packages/**"],
              message: "Import workspace packages by package name."
            },
            {
              group: ["@emotion/**", "next/font/**"],
              message: "Use CSS Modules and design-system tokens."
            }
          ]
        }
      ]
    }
  },
  {
    files,
    ignores: ["app/(lab)/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...legacySyntax,
        {
          selector: "Literal[value=/--font-brand-(?:gothic|script)/]",
          message: "Brand specimen fonts are restricted to apps/web/app/(lab)/."
        }
      ]
    }
  }
];
