import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";

const slug = process.argv[2];
const shouldPackage = process.argv.includes("--package");
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
  throw new Error("Uso: pnpm prototype:prepare <slug> [--package]");
const source = resolve("prototipos", slug);
for (const file of ["index.html", "styles.css", "version.json"])
  await access(resolve(source, file), constants.R_OK);
const html = await readFile(resolve(source, "index.html"), "utf8");
if (
  !html.includes('name="robots" content="noindex, nofollow"') ||
  !html.includes("datos ficticios")
)
  throw new Error("El prototipo debe declarar noindex y datos ficticios");
if (shouldPackage) {
  const output = resolve("artifacts", "prototipos", slug);
  await mkdir(output, { recursive: true });
  await writeFile(resolve(output, "MANIFEST.txt"), `source=prototipos/${slug}\nvalidated=true\n`);
  console.log(
    `Paquete validado en ${output}. La transferencia SFTP no se ejecuta sin credenciales explícitas.`
  );
} else console.log(`${slug}: estructura válida (dry-run)`);
