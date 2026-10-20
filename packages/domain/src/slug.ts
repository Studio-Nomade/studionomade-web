/**
 * Generación de slugs.
 *
 * El contenido es en español, así que la normalización de acentos y de la "ñ" no
 * es un detalle cosmético: "Diseño de Marca" tiene que dar `diseno-de-marca` y no
 * `dise-o-de-marca`.
 */

const MAX_SLUG_LENGTH = 96;

export function generateSlug(input: string): string {
  return (
    input
      .normalize("NFD")
      // Elimina los diacríticos que NFD acaba de separar (tildes, diéresis, la
      // virgulilla de la ñ). El resultado de "ñ" es "n", que es lo que se quiere.
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, MAX_SLUG_LENGTH)
      .replace(/-+$/g, "")
  );
}

export function isValidSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= MAX_SLUG_LENGTH;
}

/**
 * Añade un sufijo numérico hasta encontrar un slug libre.
 *
 * `exists` se inyecta para que esta lógica sea pura y testeable sin base de datos.
 */
export async function ensureUniqueSlug(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
  limit = 50
): Promise<string> {
  const slug = generateSlug(base) || "sin-titulo";

  if (!(await exists(slug))) return slug;

  for (let suffix = 2; suffix <= limit; suffix += 1) {
    const candidate = `${slug.slice(0, MAX_SLUG_LENGTH - String(suffix).length - 1)}-${suffix}`;
    if (!(await exists(candidate))) return candidate;
  }

  throw new Error(`No se pudo generar un slug único a partir de "${base}"`);
}
