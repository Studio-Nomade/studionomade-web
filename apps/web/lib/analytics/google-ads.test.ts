import { describe, expect, it, vi } from "vitest";

import {
  createGoogleAdsAdapter,
  googleTagScriptSrc,
  initGoogleAds,
  installGtagStub,
  normalizeConversionLabel,
  normalizeGoogleAdsId,
  type Gtag
} from "./google-ads";

describe("normalizeGoogleAdsId", () => {
  it("acepta solo IDs AW- numéricos", () => {
    expect(normalizeGoogleAdsId(" aw-123456789 ")).toBe("AW-123456789");
    expect(normalizeGoogleAdsId("G-ABC123")).toBeUndefined();
    expect(normalizeGoogleAdsId("AW-123');alert(1)//")).toBeUndefined();
    expect(normalizeGoogleAdsId(undefined)).toBeUndefined();
  });
});

describe("normalizeConversionLabel", () => {
  it("acepta etiquetas alfanuméricas", () => {
    expect(normalizeConversionLabel("AbC-12_xyZ")).toBe("AbC-12_xyZ");
    expect(normalizeConversionLabel("a b")).toBeUndefined();
    expect(normalizeConversionLabel("")).toBeUndefined();
  });
});

describe("installGtagStub", () => {
  it("encola objetos arguments en dataLayer y no se reinstala", () => {
    const target = {} as Window & { gtag?: Gtag; dataLayer?: unknown[] };
    const gtag = installGtagStub(target);
    initGoogleAds(gtag, "AW-123456789");
    expect(target.dataLayer).toHaveLength(2);
    const [, config] = target.dataLayer as IArguments[];
    expect(Object.prototype.toString.call(config)).toBe("[object Arguments]");
    expect(Array.from(config)).toEqual(["config", "AW-123456789", { send_page_view: false }]);
    expect(installGtagStub(target)).toBe(gtag);
  });

  it("arma la URL de gtag.js con el ID", () => {
    expect(googleTagScriptSrc("AW-123456789")).toBe(
      "https://www.googletagmanager.com/gtag/js?id=AW-123456789"
    );
  });
});

describe("createGoogleAdsAdapter", () => {
  const setup = (label?: string) => {
    const gtag = vi.fn();
    return { gtag, adapter: createGoogleAdsAdapter(() => gtag, "AW-123456789", label) };
  };

  it("conversión con transaction_id igual al id del lead", () => {
    const { gtag, adapter } = setup("leadLabel1");
    adapter.track("form_submit", { status: "success", form: "contacto", event_id: "lead-1" });
    expect(gtag).toHaveBeenCalledWith("event", "conversion", {
      send_to: "AW-123456789/leadLabel1",
      transaction_id: "lead-1"
    });
  });

  it("no convierte envíos con error ni sin etiqueta", () => {
    const withLabel = setup("leadLabel1");
    withLabel.adapter.track("form_submit", { status: "error", form: "contacto" });
    expect(withLabel.gtag).not.toHaveBeenCalled();
    const withoutLabel = setup();
    withoutLabel.adapter.track("form_submit", { status: "success", event_id: "lead-1" });
    expect(withoutLabel.gtag).not.toHaveBeenCalled();
  });

  it("page_view va a la cuenta de Google Ads", () => {
    const { gtag, adapter } = setup("leadLabel1");
    adapter.track("page_view", { path: "/" });
    expect(gtag).toHaveBeenCalledWith("event", "page_view", { send_to: "AW-123456789" });
  });
});
