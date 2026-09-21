import { inmobiliariasAssets } from "./inmobiliarias/assets";
import { InmobiliariasComposition } from "./inmobiliarias/composition";
import { inmobiliariasContent } from "./inmobiliarias/content";
import type { CampaignDefinition } from "./types";

export const CAMPAIGNS = {
  inmobiliarias: {
    accent: "inmobiliarias",
    formSlug: "campana-inmobiliarias",
    consentVersion: "2026-09-v1",
    meta: {
      title: "Branding para proyectos inmobiliarios | Studio Nomade",
      description:
        "Construimos marcas inmobiliarias diferentes, coherentes y difíciles de confundir.",
      ogImage: inmobiliariasAssets.renders
    },
    content: inmobiliariasContent,
    Composition: InmobiliariasComposition
  }
} satisfies Record<string, CampaignDefinition>;

export type CampaignSlug = keyof typeof CAMPAIGNS;
