/**
 * React 19 reinicia los formularios no controlados al terminar un action, así
 * que un error de validación vaciaría lo escrito. Se devuelve solo lo visible.
 */
const ECHOED_FIELDS = [
  "name",
  "email",
  "phone",
  "company",
  "project_stage",
  "budget_range",
  "timeline",
  "source_channel",
  "message",
  "consentimiento"
] as const;

/**
 * Selección múltiple: las marcas vuelven unidas por `MULTI_VALUE_SEPARATOR`
 * (los valores son claves sin comas). Ver `splitEchoedValues`.
 */
const ECHOED_MULTI_FIELDS = ["areas", "needs"] as const;
export const MULTI_VALUE_SEPARATOR = ",";

export function echoLeadValues(formData: FormData): Record<string, string> {
  const single = ECHOED_FIELDS.flatMap((field) => {
    const value = formData.get(field);
    return typeof value === "string" && value !== "" ? [[field, value.slice(0, 2_000)]] : [];
  });
  const multiple = ECHOED_MULTI_FIELDS.flatMap((field) => {
    const values = formData
      .getAll(field)
      .filter((value): value is string => typeof value === "string" && value !== "")
      .map((value) => value.slice(0, 100))
      .slice(0, 20);
    return values.length ? [[field, values.join(MULTI_VALUE_SEPARATOR)]] : [];
  });
  return Object.fromEntries([...single, ...multiple]);
}

/** Lista de marcas devuelta por `echoLeadValues` para un campo múltiple. */
export function splitEchoedValues(value: string | undefined): string[] {
  return value ? value.split(MULTI_VALUE_SEPARATOR).filter(Boolean) : [];
}
