import { z } from "zod";

export const campaignContentSchema = z.object({
  hero: z.object({ eyebrow: z.string(), highlight: z.string(), title: z.string() }),
  claims: z.array(
    z.object({ text: z.string(), mark: z.enum(["none", "fill", "circle"]).default("none") })
  ),
  steps: z.array(z.string()).min(3).max(4),
  footline: z.array(z.string()),
  form: z.object({
    heading: z.string(),
    badge: z.string(),
    submitLabel: z.string(),
    successMessage: z.string(),
    consentLabel: z.string(),
    stages: z.array(z.object({ value: z.string(), label: z.string() }))
  })
});

export type CampaignContent = z.infer<typeof campaignContentSchema>;
