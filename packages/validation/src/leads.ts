import { z } from "zod";

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maximum).optional()
  );

export const utmSchema = z.object({
  utm_source: optionalText(255),
  utm_medium: optionalText(255),
  utm_campaign: optionalText(255),
  utm_term: optionalText(255),
  utm_content: optionalText(255)
});

export const consentSchema = z.object({
  consentimiento: z.literal("on", {
    errorMap: () => ({ message: "Debes aceptar el consentimiento para continuar." })
  }),
  consent_version: z.string().trim().min(1).max(50)
});

export const leadSubmissionSchema = z
  .object({
    form_slug: z.string().trim().min(1).max(100),
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    phone: optionalText(50),
    company: optionalText(160),
    message: optionalText(2_000),
    source_path: z.string().trim().min(1).max(2_048),
    landing_path: optionalText(2_048),
    referrer: optionalText(2_048),
    origin_type: z.enum(["campana", "area", "contacto", "importacion", "referido"]),
    origin_slug: optionalText(255),
    empresa_web: optionalText(500),
    t: z.string().min(1),
    t_signature: z.string().min(1),
    consentimiento: z.string().optional(),
    consent_version: z.string().optional()
  })
  .merge(utmSchema)
  .merge(consentSchema);

export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;
