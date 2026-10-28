import { z } from "zod";

export {
  campaignLeadSubmissionSchema,
  clickAttributionSchema,
  consentSchema,
  LEAD_AREAS,
  LEAD_BUDGET_RANGES,
  LEAD_MULTI_VALUE_FIELDS,
  LEAD_NEEDS,
  LEAD_SOURCE_CHANNELS,
  LEAD_TIMELINES,
  leadFormInput,
  leadSubmissionSchema,
  normalizeChileanPhone,
  optionalChileanPhoneSchema,
  PROJECT_STAGES,
  projectStageSchema,
  qualifiedLeadSubmissionSchema,
  utmSchema
} from "./leads";
export type {
  CampaignLeadSubmission,
  LeadArea,
  LeadBudgetRange,
  LeadNeed,
  LeadSourceChannel,
  LeadSubmission,
  LeadSubmissionSchema,
  LeadTimeline,
  ProjectStage,
  QualifiedLeadSubmission
} from "./leads";
export { readServerEnvironment } from "./server-env";
export type { ServerEnvironment } from "./server-env";

export const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z.enum(["local", "preview", "production"]).default("local"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000")
});

export type PublicEnvironment = z.infer<typeof publicEnvironmentSchema>;

export function readPublicEnvironment(input: Record<string, string | undefined>) {
  return publicEnvironmentSchema.parse(input);
}

export {
  changeStatusSchema,
  contentStatusSchema,
  createPageSchema,
  listPagesQuerySchema,
  paginationSchema,
  slugSchema,
  uuidSchema,
  type ChangeStatusInput,
  type ContentStatusInput,
  type CreatePageInput,
  type ListPagesQuery
} from "./content";

export {
  BLOG_INTENTS,
  blogPostInputSchema,
  LEAD_LABELS,
  LEAD_ORIGINS,
  LEAD_PRIORITIES,
  LEAD_STATUSES,
  leadFiltersSchema,
  leadTriageSchema,
  parseLeadFilters,
  slugify,
  type BlogPostInput,
  type LeadFilters,
  type LeadPriority,
  type LeadStatus,
  type LeadTriage
} from "./admin";
