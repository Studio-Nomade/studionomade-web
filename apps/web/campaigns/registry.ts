import { CAMPAIGN_LEAD_CONSENT_VERSION } from "../content/legal/consentimientos";
import { inmobiliariasAssets } from "./inmobiliarias/assets";
import { InmobiliariasComposition } from "./inmobiliarias/composition";
import { inmobiliariasContent } from "./inmobiliarias/content";
import type { CampaignDefinition } from "./types";

export const CAMPAIGNS = {
  inmobiliarias: {
    accent: "inmobiliarias",
    formSlug: "campana-inmobiliarias",
    consentVersion: CAMPAIGN_LEAD_CONSENT_VERSION,
    meta: {
      title: "Branding para proyectos inmobiliarios | Studio Nomade",
      description:
        "Branding, renders, sala de ventas, web y campañas para proyectos inmobiliarios. Cotiza sin compromiso.",
      ogImage: inmobiliariasAssets.renders
    },
    content: inmobiliariasContent,
    Composition: InmobiliariasComposition
  }
} satisfies Record<string, CampaignDefinition>;

export type CampaignSlug = keyof typeof CAMPAIGNS;
