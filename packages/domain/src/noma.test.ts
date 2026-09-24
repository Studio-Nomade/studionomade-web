import { describe, expect, it, vi } from "vitest";
import { deliverLeadToNoma } from "./noma";

const lead = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Ada Lovelace",
  email: "ada@example.test",
  phone: null,
  company: null,
  origin: "contacto-general"
};

describe("deliverLeadToNoma", () => {
  it("sends a minimal signed payload with stable idempotency", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ accepted: true }), { status: 200 }));
    await deliverLeadToNoma(lead, {
      endpoint: "https://noma.example.test/leads",
      secret: "test-only-secret",
      fetch: fetcher,
      now: () => new Date("2026-09-21T12:00:00.000Z")
    });
    const [, request] = fetcher.mock.calls[0] as [string, RequestInit];
    expect(request.headers).toMatchObject({
      "x-studionomade-idempotency-key": "11111111-1111-4111-8111-111111111111"
    });
    expect(JSON.parse(String(request.body))).not.toHaveProperty("lead.message");
  });

  it("retries transient failures and not permanent failures", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response("temporary", { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true }), { status: 200 }));
    await deliverLeadToNoma(lead, {
      endpoint: "https://noma.example.test/leads",
      secret: "test-only-secret",
      fetch: fetcher,
      sleep: async () => undefined
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
