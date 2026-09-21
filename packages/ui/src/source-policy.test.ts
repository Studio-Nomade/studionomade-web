import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
const root = dirname(fileURLToPath(import.meta.url));
function sources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? sources(join(directory, entry.name))
      : entry.name.endsWith(".tsx") && !entry.name.endsWith(".test.tsx")
        ? [join(directory, entry.name)]
        : []
  );
}
it("solo permite style inline para variables CSS", () => {
  for (const file of sources(root)) {
    const content = readFileSync(file, "utf8");
    for (const match of content.matchAll(/style=\{\{([\s\S]*?)\}\}/g))
      expect(match[1]).toMatch(/^\s*"--/);
  }
});
