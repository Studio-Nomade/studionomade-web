/**
 * Registro de textos de consentimiento por versión.
 *
 * La versión se guarda en `leads.consent_version`; este archivo es la prueba de
 * qué texto vio la persona. Por eso **las versiones publicadas no se editan**:
 * un cambio de redacción es una versión nueva.
 *
 * Si la versión trae `link`, su `label` debe aparecer literalmente dentro de
 * `text`: la UI (`ConsentLabel`) renderiza ese tramo como enlace y el texto
 * visible queda idéntico al registrado.
 */
export interface LeadConsentDefinition {
  text: string;
  link?: { label: string; href: string };
}

export const CURRENT_LEAD_CONSENT_VERSION = "2026-09";

/** Versión vigente para formularios de campaña. */
export const CAMPAIGN_LEAD_CONSENT_VERSION = "2026-10-v1";

export const LEAD_CONSENTS = {
  [CURRENT_LEAD_CONSENT_VERSION]: {
    text: "Autorizo a Studio Nomade a usar mis datos para responder esta solicitud y contactarme sobre sus servicios."
  },
  "2026-09-v1": {
    text: "Autorizo a Studio Nomade a usar mis datos para responder esta solicitud y contactarme sobre sus servicios."
  },
  [CAMPAIGN_LEAD_CONSENT_VERSION]: {
    text: "Autorizo a Studio Nomade SpA a tratar mis datos para responder esta solicitud y contactarme sobre sus servicios, según su política de privacidad.",
    link: { label: "política de privacidad", href: "/privacidad" }
  }
} as const satisfies Record<string, LeadConsentDefinition>;

export type LeadConsentVersion = keyof typeof LEAD_CONSENTS;

export function isLeadConsentVersion(version: string): version is LeadConsentVersion {
  return Object.hasOwn(LEAD_CONSENTS, version);
}

export function leadConsent(version: LeadConsentVersion): LeadConsentDefinition {
  return LEAD_CONSENTS[version];
}
