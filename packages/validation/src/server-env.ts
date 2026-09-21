import { z } from "zod";

const serverEnvironmentSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  LEAD_IP_SALT: z.string().min(16),
  LEAD_FORM_SECRET: z.string().min(16),
  SLACK_LEADS_WEBHOOK_URL: z.string().url().optional().or(z.literal("")),
  GOOGLE_SMTP_USER: z.string().email().optional().or(z.literal("")),
  GOOGLE_SMTP_APP_PASSWORD: z.string().optional().default(""),
  LEADS_NOTIFY_TO: z.string().email().optional().or(z.literal(""))
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function readServerEnvironment(input: Record<string, string | undefined>) {
  return serverEnvironmentSchema.parse(input);
}
