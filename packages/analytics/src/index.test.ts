import { describe, expect, it, vi } from "vitest";
import { combineAdapters, sanitizeAnalyticsProperties, trackSafely } from "./index";

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
  it("no hace nada sin adapter", async () => {
    await expect(trackSafely(undefined, "page_view")).resolves.toBeUndefined();
  });
});

describe("combineAdapters", () => {
  it("reparte el evento sanitizado a todos los proveedores", async () => {
    const first = vi.fn();
    const second = vi.fn();
    await trackSafely(
      combineAdapters({ track: first }, undefined, { track: second }),
      "cta_click",
      {
        cta: "agendar",
        email: "x@y.test"
      }
    );
    expect(first).toHaveBeenCalledWith("cta_click", { cta: "agendar" });
    expect(second).toHaveBeenCalledWith("cta_click", { cta: "agendar" });
  });

  it("un proveedor caído no bloquea a los demás", async () => {
    const healthy = vi.fn();
    const broken = vi.fn(() => {
      throw new Error("down");
    });
    await combineAdapters({ track: broken }, { track: healthy }).track("page_view", {});
    expect(healthy).toHaveBeenCalledOnce();
  });

  it("cada proveedor recibe su propia copia de las propiedades", async () => {
    const mutating = vi.fn((_event: string, properties: Record<string, unknown>) => {
      properties.cta = "mutado";
    });
    const reader = vi.fn();
    await combineAdapters({ track: mutating }, { track: reader }).track("cta_click", {
      cta: "original"
    });
    expect(reader).toHaveBeenCalledWith("cta_click", { cta: "original" });
  });
});
