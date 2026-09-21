import { readdirSync } from "node:fs";
import { resolve } from "node:path";

const tokenDirectory = resolve("packages/design-system/styles/tokens");
const tokenSources = readdirSync(tokenDirectory)
  .filter((file) => file.endsWith(".css"))
  .map((file) => resolve(tokenDirectory, file));

export default {
  plugins: ["stylelint-declaration-strict-value", "stylelint-value-no-unknown-custom-properties"],
  rules: {
    "scale-unlimited/declaration-strict-value": [
      [
        "/color$/",
        "background",
        "border",
        "font-size",
        "font-family",
        "font-weight",
        "line-height",
        "letter-spacing",
        "gap",
        "/^padding/",
        "/^margin/",
        "z-index"
      ],
      {
        ignoreValues: [
          "0",
          "auto",
          "none",
          "solid",
          "inherit",
          "transparent",
          "currentColor",
          "1px",
          "/^-?(?:\\d*\\.)?\\d+(?:%|fr|ch|em)$/",
          "/^1px solid (?:transparent|currentColor)$/"
        ],
        disableFix: true
      }
    ],
    "csstools/value-no-unknown-custom-properties": [
      true,
      {
        importFrom: [...tokenSources, resolve("docs/design-system/runtime-custom-properties.json")]
      }
    ]
  }
};
