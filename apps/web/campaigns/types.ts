import type { CampaignContent } from "@studionomade/content-schema";
import type { StaticImageData } from "next/image";
import type { ComponentType } from "react";

export interface CampaignCompositionProps {
  content: CampaignContent;
  slug: string;
  utm: Record<string, string | undefined>;
  timestamp: string;
  signature: string;
  formSlug: string;
  consentVersion: string;
}

export interface CampaignDefinition {
  accent: string;
  formSlug: string;
  consentVersion: string;
  meta: { title: string; description: string; ogImage: StaticImageData };
  content: CampaignContent;
  Composition: ComponentType<CampaignCompositionProps>;
}
