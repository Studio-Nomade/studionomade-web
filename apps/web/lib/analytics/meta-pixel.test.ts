import { describe, expect, it, vi } from "vitest";

import {
  createMetaPixelAdapter,
  initMetaPixel,
  installFbqStub,
  normalizeMetaPixelId,
  type Fbq
} from "./meta-pixel";

describe("normalizeMetaPixelId", () => {
  it("acepta solo IDs numéricos", () => {
    expect(normalizeMetaPixelId(" 1234567890123456 ")).toBe("1234567890123456");
    expect(normalizeMetaPixelId("")).toBeUndefined();
    expect(normalizeMetaPixelId(undefined)).toBeUndefined();
    expect(normalizeMetaPixelId("123');alert(1);//")).toBeUndefined();
  });
});

describe("installFbqStub", () => {
  it("encola llamadas hasta que carga fbevents.js y desactiva el PageView por pushState", () => {
    const target = {} as Window & { fbq?: Fbq };
    const fbq = installFbqStub(target);
    initMetaPixel(fbq, "123456");
    expect(fbq.queue).toEqual([
      ["set", "autoConfig", false, "123456"],
      ["init", "123456"]
    ]);
    expect(fbq.disablePushState).toBe(true);
    expect(installFbqStub(target)).toBe(fbq);
  });
});

describe("createMetaPixelAdapter", () => {
  const setup = () => {
    const fbq = vi.fn() as unknown as Fbq & ReturnType<typeof vi.fn>;
    return { fbq, adapter: createMetaPixelAdapter(() => fbq) };
  };

  it("PageView en cada page_view", () => {
    const { fbq, adapter } = setup();
    adapter.track("page_view", { path: "/" });
    expect(fbq).toHaveBeenCalledWith("track", "PageView");
  });

  it("Lead con eventID igual al id del lead", () => {
    const { fbq, adapter } = setup();
    adapter.track("form_submit", {
      status: "success",
      form: "campana-inmobiliarias",
      origin: "inmobiliarias",
      event_id: "3f1c0e9a-0000-4000-8000-000000000000"
    });
    expect(fbq).toHaveBeenCalledWith(
      "track",
      "Lead",
      { content_name: "campana-inmobiliarias", content_category: "inmobiliarias" },
      { eventID: "3f1c0e9a-0000-4000-8000-000000000000" }
    );
  });

  it("no emite Lead para envíos fallidos", () => {
    const { fbq, adapter } = setup();
    adapter.track("form_submit", { status: "error", form: "campana-inmobiliarias" });
    expect(fbq).not.toHaveBeenCalled();
  });

  it("cta_click personalizado y Contact estándar", () => {
    const { fbq, adapter } = setup();
    adapter.track("cta_click", { cta: "agendar", path: "/campanas/inmobiliarias" });
    adapter.track("contact_click", { channel: "email", path: "/" });
    expect(fbq).toHaveBeenCalledWith("trackCustom", "cta_click", {
      cta: "agendar",
      path: "/campanas/inmobiliarias"
    });
    expect(fbq).toHaveBeenCalledWith("track", "Contact", { channel: "email" });
  });

  it("no falla si el píxel no está", () => {
    expect(() => createMetaPixelAdapter(() => undefined).track("page_view", {})).not.toThrow();
  });
});
