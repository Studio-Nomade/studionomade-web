import { describe, expect, it, vi } from "vitest";
import { sanitizeAnalyticsProperties, trackSafely } from "./index";

describe("analytics wrapper", () => {
  it("drops PII-like properties", () =>
    expect(sanitizeAnalyticsProperties({ slug: "lab", email: "x@y.test", phone: "1" })).toEqual({
      slug: "lab"
    }));
  it("degrades gracefully when the provider fails", async () => {
    const track = vi.fn().mockRejectedValue(new Error("down"));
    await expect(
      trackSafely({ track }, "cta_click", { target: "contact" })
    ).resolves.toBeUndefined();
  });
});
