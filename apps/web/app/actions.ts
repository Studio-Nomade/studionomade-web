"use server";

import { qualifiedLeadSubmissionSchema } from "@studionomade/validation";

import { prepareLeadRequest } from "../lib/leads/request-context";
import { submitLead, type SubmitLeadResult } from "../lib/leads/submit-lead";

export async function submitContactLead(
  _previousState: SubmitLeadResult | null,
  formData: FormData
): Promise<SubmitLeadResult> {
  const sourcePath = String(formData.get("source_path") ?? "/");
  formData.set("landing_path", sourcePath);
  const request = await prepareLeadRequest(formData, { referrerFromHeader: true });
  return submitLead(formData, request);
}

/**
 * Formulario dedicado de /contacto: mismo flujo que `submitContactLead`, pero
 * con el schema de calificación (empresa, áreas, necesidades, presupuesto y
 * plazo obligatorios). El schema se fija aquí, nunca desde el cliente.
 */
export async function submitQualifiedContactLead(
  _previousState: SubmitLeadResult | null,
  formData: FormData
): Promise<SubmitLeadResult> {
  const sourcePath = String(formData.get("source_path") ?? "/contacto");
  formData.set("landing_path", sourcePath);
  const request = await prepareLeadRequest(formData, { referrerFromHeader: true });
  return submitLead(formData, request, { schema: qualifiedLeadSubmissionSchema });
}
