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
  "message",
  "consentimiento"
] as const;

export function echoLeadValues(formData: FormData): Record<string, string> {
  return Object.fromEntries(
    ECHOED_FIELDS.flatMap((field) => {
      const value = formData.get(field);
      return typeof value === "string" && value !== "" ? [[field, value.slice(0, 2_000)]] : [];
    })
  );
}
