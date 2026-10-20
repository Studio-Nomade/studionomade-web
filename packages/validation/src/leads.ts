import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalText = (maximum: number, message?: string) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(maximum, message).optional());

/**
 * Campo técnico que llega desde la URL o desde una cookie de terceros. Un valor
 * malformado se descarta en silencio (`catch`): nunca debe bloquear un lead.
 */
const lenientToken = (maximum: number, pattern: RegExp) =>
  z
    .preprocess(emptyToUndefined, z.string().trim().max(maximum).regex(pattern).optional())
    .catch(undefined);

const CLICK_ID_PATTERN = /^[\w.~-]+$/;
/** `_fbp`: `fb.{subdominio}.{creación en ms}.{aleatorio}`. */
const FBP_PATTERN = /^fb\.\d\.\d{10,13}\.\d+$/;
/** `_fbc`: `fb.{subdominio}.{creación en ms}.{fbclid}`. */
const FBC_PATTERN = /^fb\.\d\.\d{10,13}\.[\w.~-]+$/;

const lenientUrl = z
  .preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .max(2_048)
      .url()
      .refine((value) => /^https?:\/\//i.test(value))
      .optional()
  )
  .catch(undefined);

export const utmSchema = z.object({
  utm_source: optionalText(255),
  utm_medium: optionalText(255),
  utm_campaign: optionalText(255),
  utm_term: optionalText(255),
  utm_content: optionalText(255)
});

/** Identificadores de clic y cookies de Meta para atribución y Conversions API. */
export const clickAttributionSchema = z.object({
  gclid: lenientToken(512, CLICK_ID_PATTERN),
  fbclid: lenientToken(512, CLICK_ID_PATTERN),
  fbp: lenientToken(255, FBP_PATTERN),
  fbc: lenientToken(1_024, FBC_PATTERN),
  landing_url: lenientUrl
});

export const consentSchema = z.object({
  consentimiento: z.literal("on", {
    errorMap: () => ({ message: "Debes aceptar el consentimiento para continuar." })
  }),
  consent_version: z.string().trim().min(1).max(50)
});

/** Etapas válidas del proyecto. Deben coincidir con `leads_project_stage_check`. */
export const PROJECT_STAGES = ["idea", "en_desarrollo", "en_venta"] as const;
export type ProjectStage = (typeof PROJECT_STAGES)[number];

export const projectStageSchema = z.enum(PROJECT_STAGES, {
  errorMap: () => ({ message: "Selecciona la etapa del proyecto." })
});

/**
 * Normaliza un teléfono chileno a E.164 (`+56` + 9 dígitos). Acepta espacios,
 * guiones, puntos y paréntesis, con o sin prefijo `+56`/`56`. Devuelve `null` si
 * no es un número chileno válido.
 */
export function normalizeChileanPhone(value: string): string | null {
  const compact = value.replace(/[\s().-]/g, "");
  const match = /^(?:\+?56)?([2-9]\d{8})$/.exec(compact);
  return match ? `+56${match[1]}` : null;
}

const CHILEAN_PHONE_MESSAGE = "Ingresa un teléfono chileno válido, por ejemplo +56 9 1234 5678.";

export const optionalChileanPhoneSchema = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .max(50, CHILEAN_PHONE_MESSAGE)
    .transform((value, context) => {
      const normalized = normalizeChileanPhone(value);
      if (!normalized) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: CHILEAN_PHONE_MESSAGE });
        return z.NEVER;
      }
      return normalized;
    })
    .optional()
);

export const leadSubmissionSchema = z
  .object({
    form_slug: z.string().trim().min(1).max(100),
    name: z
      .string({ required_error: "Ingresa tu nombre.", invalid_type_error: "Ingresa tu nombre." })
      .trim()
      .min(2, "Ingresa tu nombre (mínimo 2 caracteres).")
      .max(120, "El nombre no puede superar 120 caracteres."),
    email: z
      .string({ required_error: "Ingresa tu email.", invalid_type_error: "Ingresa tu email." })
      .trim()
      .min(1, "Ingresa tu email.")
      .email("Ingresa un email válido, por ejemplo nombre@empresa.cl.")
      .max(254, "El email no puede superar 254 caracteres."),
    phone: optionalText(50, "El teléfono no puede superar 50 caracteres."),
    company: optionalText(160, "El nombre no puede superar 160 caracteres."),
    message: optionalText(2_000, "El mensaje no puede superar 2.000 caracteres."),
    project_stage: z.preprocess(emptyToUndefined, projectStageSchema.optional()),
    source_path: z.string().trim().min(1).max(2_048),
    landing_path: optionalText(2_048),
    referrer: optionalText(2_048),
    origin_type: z.enum(["campana", "area", "contacto", "prototipo", "importacion", "referido"]),
    origin_slug: optionalText(255),
    empresa_web: optionalText(500),
    t: z.string().min(1),
    t_signature: z.string().min(1),
    consentimiento: z.string().optional(),
    consent_version: z.string().optional()
  })
  .merge(utmSchema)
  .merge(clickAttributionSchema)
  .merge(consentSchema);

/**
 * Formularios de campaña: el proyecto y su etapa son obligatorios (coherente con
 * la UI) y el teléfono, si viene, debe ser chileno.
 */
export const campaignLeadSubmissionSchema = leadSubmissionSchema.extend({
  company: z
    .string({
      required_error: "Ingresa el nombre del proyecto.",
      invalid_type_error: "Ingresa el nombre del proyecto."
    })
    .trim()
    .min(1, "Ingresa el nombre del proyecto.")
    .max(160, "El nombre del proyecto no puede superar 160 caracteres."),
  project_stage: projectStageSchema,
  phone: optionalChileanPhoneSchema
});

export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;
export type CampaignLeadSubmission = z.infer<typeof campaignLeadSubmissionSchema>;
/** Cualquier schema de formulario cuya salida sea un `LeadSubmission`. */
export type LeadSubmissionSchema = z.ZodType<LeadSubmission, z.ZodTypeDef, unknown>;
