"use server";

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
