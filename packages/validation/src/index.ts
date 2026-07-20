import { z } from "zod";

export const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z.enum(["local", "preview", "production"]).default("local"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000")
});

export type PublicEnvironment = z.infer<typeof publicEnvironmentSchema>;

export function readPublicEnvironment(input: Record<string, string | undefined>) {
  return publicEnvironmentSchema.parse(input);
}
