"use server";

import { campaignLeadSubmissionSchema } from "@studionomade/validation";

import { prepareLeadRequest } from "../../../lib/leads/request-context";
import { submitLead, type SubmitLeadResult } from "../../../lib/leads/submit-lead";

/**
 * La etapa del proyecto viaja como `project_stage` y se valida contra el enum
 * de `campaignLeadSubmissionSchema`; ya no se pega dentro de `message`.
 */
export async function submitCampaignLead(
  _previousState: SubmitLeadResult | null,
  formData: FormData
): Promise<SubmitLeadResult> {
  const sourcePath = String(formData.get("source_path") ?? "/campanas/inmobiliarias");
  formData.set("landing_path", sourcePath);
  const request = await prepareLeadRequest(formData, { referrerFromHeader: false });
  return submitLead(formData, request, { schema: campaignLeadSubmissionSchema });
}
