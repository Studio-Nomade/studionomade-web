import type { CampaignContent } from "@studionomade/content-schema";
import type { StaticImageData } from "next/image";
import type { ComponentType } from "react";
import type { LeadConsentVersion } from "../content/legal/consentimientos";

export interface CampaignCompositionProps {
  content: CampaignContent;
  slug: string;
  /** UTM, gclid/fbclid, landing_url y referrer vistos por el servidor al renderizar. */
  utm: Record<string, string | undefined>;
  timestamp: string;
  signature: string;
  formSlug: string;
  consentVersion: LeadConsentVersion;
}

export interface CampaignDefinition {
  accent: string;
  formSlug: string;
  consentVersion: LeadConsentVersion;
  meta: { title: string; description: string; ogImage: StaticImageData };
  content: CampaignContent;
  Composition: ComponentType<CampaignCompositionProps>;
}
