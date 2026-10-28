/** Fecha de una nota en español de Chile: "26 de noviembre de 2025". */
export function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Santiago"
  }).format(new Date(iso));
}
