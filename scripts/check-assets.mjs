import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const roots = ["apps/web/public", "apps/admin/public"];
const allowed = new Set([".avif", ".jpg", ".png", ".svg", ".webp"]);
const failures = [];

async function walk(directory) {
  try {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(target);
      else {
        const extension = path.extname(entry.name).toLowerCase();
        if (!allowed.has(extension)) failures.push(`${target}: extensión no permitida`);
        if (entry.name !== entry.name.toLowerCase())
          failures.push(`${target}: usa kebab-case minúsculo`);
        if ((await stat(target)).size === 0) failures.push(`${target}: archivo vacío`);
      }
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

for (const root of roots) await walk(root);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Assets OK");
