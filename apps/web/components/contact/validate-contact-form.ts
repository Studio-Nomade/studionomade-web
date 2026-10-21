/**
 * Validación en el navegador del formulario de /contacto, para dar respuesta
 * inmediata sin un viaje al servidor. **No reemplaza** al schema Zod del
 * servidor (`qualifiedLeadSubmissionSchema`), que es la fuente de verdad; los
 * mensajes son los mismos para que la experiencia no cambie según quién valide.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
};

const hasChoice = (formData: FormData, name: string) =>
  formData.getAll(name).some((value) => typeof value === "string" && value !== "");

/** Orden de los campos en pantalla: el primero con error recibe el foco. */
export const CONTACT_FIELD_ORDER = [
  "name",
  "email",
  "phone",
  "company",
  "areas",
  "needs",
  "budget_range",
  "timeline",
  "source_channel",
  "message",
  "consentimiento"
] as const;

export function validateContactForm(formData: FormData): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = text(formData, "name");
  const email = text(formData, "email");

  if (!name) errors.name = "Ingresa tu nombre.";
  else if (name.length < 2) errors.name = "Ingresa tu nombre (mínimo 2 caracteres).";

  if (!email) errors.email = "Ingresa tu email.";
  else if (!EMAIL_PATTERN.test(email))
    errors.email = "Ingresa un email válido, por ejemplo nombre@empresa.cl.";

  if (!text(formData, "company")) errors.company = "Ingresa tu empresa o marca.";
  if (!hasChoice(formData, "areas")) errors.areas = "Selecciona al menos un área de interés.";
  if (!hasChoice(formData, "needs")) errors.needs = "Selecciona al menos una opción.";
  if (!hasChoice(formData, "budget_range"))
    errors.budget_range = "Selecciona un rango de presupuesto.";
  if (!hasChoice(formData, "timeline")) errors.timeline = "Selecciona un plazo.";
  if (text(formData, "message").length > 2_000)
    errors.message = "El mensaje no puede superar 2.000 caracteres.";
  if (formData.get("consentimiento") !== "on")
    errors.consentimiento = "Debes aceptar el consentimiento para continuar.";

  return errors;
}
