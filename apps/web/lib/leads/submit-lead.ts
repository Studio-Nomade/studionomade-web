import "server-only";

import { createServiceDatabaseClient } from "@studionomade/database";
import {
  leadSubmissionSchema,
  readServerEnvironment,
  type LeadSubmissionSchema
} from "@studionomade/validation";

import { isLeadConsentVersion } from "../../content/legal/consentimientos";
import { isHoneypotFilled, verifyFormTimestamp } from "./anti-spam";
import { echoLeadValues } from "./echo-values";
import { hashIpAddress } from "./hash-ip";
import { notifyLeadAndRecordFailures } from "./notify";
import { hasReachedLeadRateLimit } from "./rate-limit";

export interface LeadRequestMetadata {
  ipAddress: string;
  userAgent?: string;
}

export interface SubmitLeadOptions {
  /** Schema del formulario. Los de campaña exigen proyecto y etapa. */
  schema?: LeadSubmissionSchema;
}

export type SubmitLeadResult =
  | { success: true; leadId?: string }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
      /** Lo que escribió la persona, para repoblar el formulario tras un error. */
      values?: Record<string, string>;
    };

export async function submitLead(
  formData: FormData,
  request: LeadRequestMetadata,
  { schema = leadSubmissionSchema }: SubmitLeadOptions = {}
): Promise<SubmitLeadResult> {
  const values = echoLeadValues(formData);
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return {
      success: false,
      message: "Revisa los campos indicados.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      values
    };
  }

  const lead = parsed.data;
  if (isHoneypotFilled(lead.empresa_web)) return { success: true };

  let environment;
  try {
    environment = readServerEnvironment(process.env);
  } catch {
    return { success: false, message: "El formulario no está disponible temporalmente.", values };
  }

  if (!verifyFormTimestamp(lead.t, lead.t_signature, environment.LEAD_FORM_SECRET)) {
    return {
      success: false,
      message: "No fue posible validar el envío. Intenta nuevamente.",
      values
    };
  }

  if (!isLeadConsentVersion(lead.consent_version)) {
    return { success: false, message: "La versión del consentimiento no es válida.", values };
  }

  const ipHash = hashIpAddress(request.ipAddress, environment.LEAD_IP_SALT);
  const database = createServiceDatabaseClient(
    environment.SUPABASE_URL,
    environment.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    if (await hasReachedLeadRateLimit(database, ipHash)) {
      return {
        success: false,
        message: "No fue posible procesar el envío. Intenta más tarde.",
        values
      };
    }

    const { data: leadId, error } = await database.rpc("capture_lead", {
      p: {
        form_slug: lead.form_slug,
        payload: {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          message: lead.message,
          project_stage: lead.project_stage
        },
        source_path: lead.source_path,
        ip_hash: ipHash,
        user_agent: request.userAgent,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        message: lead.message,
        project_stage: lead.project_stage,
        consent_given: true,
        consent_at: new Date().toISOString(),
        consent_purpose: "contacto-comercial",
        consent_version: lead.consent_version,
        utm_source: lead.utm_source,
        utm_medium: lead.utm_medium,
        utm_campaign: lead.utm_campaign,
        utm_term: lead.utm_term,
        utm_content: lead.utm_content,
        gclid: lead.gclid,
        fbclid: lead.fbclid,
        fbp: lead.fbp,
        fbc: lead.fbc,
        referrer: lead.referrer,
        landing_path: lead.landing_path ?? lead.source_path,
        landing_url: lead.landing_url,
        origin_type: lead.origin_type,
        origin_slug: lead.origin_slug
      }
    });

    if (error || !leadId) {
      return { success: false, message: "El formulario no está disponible temporalmente.", values };
    }

    await notifyLeadAndRecordFailures(database, leadId, lead, environment);

    return { success: true, leadId };
  } catch {
    return { success: false, message: "El formulario no está disponible temporalmente.", values };
  }
}
