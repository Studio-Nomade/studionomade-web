import { createHmac } from "node:crypto";
import {
  NOMA_CONTRACT_VERSION,
  nomaLeadPayloadSchema,
  nomaLeadResponseSchema,
  type NomaLeadPayload,
  type NomaLeadResponse
} from "@studionomade/contracts";

export interface NomaDeliveryDependencies {
  endpoint: string;
  secret: string;
  fetch?: typeof globalThis.fetch;
  sleep?: (milliseconds: number) => Promise<void>;
  now?: () => Date;
  maxAttempts?: number;
}

type LeadInput = Omit<NomaLeadPayload["lead"], "phone" | "company"> & {
  phone?: string | null;
  company?: string | null;
};

export async function deliverLeadToNoma(
  input: LeadInput,
  dependencies: NomaDeliveryDependencies
): Promise<NomaLeadResponse> {
  if (!dependencies.endpoint.startsWith("https://"))
    throw new Error("Noma endpoint must use HTTPS");
  const now = dependencies.now?.() ?? new Date();
  const eventId = input.id;
  const payload = nomaLeadPayloadSchema.parse({
    schemaVersion: NOMA_CONTRACT_VERSION,
    eventId,
    occurredAt: now.toISOString(),
    lead: {
      id: input.id,
      name: input.name,
      email: input.email,
      ...(input.phone ? { phone: input.phone } : {}),
      ...(input.company ? { company: input.company } : {}),
      origin: input.origin
    }
  });
  const body = JSON.stringify(payload);
  const signature = createHmac("sha256", dependencies.secret).update(body).digest("hex");
  const fetcher = dependencies.fetch ?? globalThis.fetch;
  const sleep =
    dependencies.sleep ??
    ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)));
  const maxAttempts = dependencies.maxAttempts ?? 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetcher(dependencies.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-studionomade-contract": NOMA_CONTRACT_VERSION,
        "x-studionomade-idempotency-key": eventId,
        "x-studionomade-signature": `sha256=${signature}`
      },
      body
    });
    if (response.ok) return nomaLeadResponseSchema.parse(await response.json());
    if (attempt === maxAttempts || (response.status < 500 && response.status !== 429)) {
      throw new Error(`Noma delivery rejected with status ${response.status}`);
    }
    await sleep(200 * 2 ** (attempt - 1));
  }
  throw new Error("Noma delivery exhausted retries");
}
