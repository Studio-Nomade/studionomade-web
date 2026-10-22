import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

let failures = 0;
const files = execFileSync("git", ["ls-files", "docs/**/*.md", "apps/web/**/*.tsx"], {
  encoding: "utf8"
})
  .trim()
  .split("\n")
  .filter(Boolean);
for (const file of files) {
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(/(?:href=|\]\()["'{`]?([^"'`}\s)]+)/g)) {
    const target = match[1];
    if (target?.startsWith("javascript:")) {
      console.error(`${file}: URL javascript prohibida`);
      failures += 1;
    }
  }
}
if (failures) process.exitCode = 1;
else console.log("Link safety dry-run: sin URLs javascript detectadas");
