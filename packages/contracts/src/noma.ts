import { z } from "zod";

export const NOMA_CONTRACT_VERSION = "2026-09-01" as const;

export const nomaLeadPayloadSchema = z
  .object({
    schemaVersion: z.literal(NOMA_CONTRACT_VERSION),
    eventId: z.string().uuid(),
    occurredAt: z.string().datetime(),
    lead: z.object({
      id: z.string().uuid(),
      name: z.string().trim().min(1).max(160),
      email: z.string().email().max(254),
      phone: z.string().trim().max(40).optional(),
      company: z.string().trim().max(160).optional(),
      origin: z.string().trim().min(1).max(120)
    })
  })
  .strict();

export const nomaLeadResponseSchema = z
  .object({ accepted: z.boolean(), referenceId: z.string().min(1).max(200).optional() })
  .strict();

export type NomaLeadPayload = z.infer<typeof nomaLeadPayloadSchema>;
export type NomaLeadResponse = z.infer<typeof nomaLeadResponseSchema>;
