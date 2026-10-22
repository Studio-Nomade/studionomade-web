import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setAnalyticsConsent } from "../../lib/analytics/consent";
import type { Fbq } from "../../lib/analytics/meta-pixel";
import { SiteAnalytics } from "./site-analytics";

const navigation = vi.hoisted(() => ({ pathname: "/campanas/inmobiliarias" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams()
}));

vi.mock("next/script", () => ({
  default: ({ id, src }: { id: string; src: string }) => <script data-testid={id} data-src={src} />
}));

type TestWindow = Window & {
  fbq?: Fbq;
  _fbq?: Fbq;
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
};

function setDoNotTrack(value: string | null) {
  Object.defineProperty(window.navigator, "doNotTrack", { value, configurable: true });
}

beforeEach(() => {
  setDoNotTrack(null);
  window.localStorage.clear();
  const target = window as TestWindow;
  delete target.fbq;
  delete target._fbq;
  delete target.dataLayer;
  delete target.gtag;
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("SiteAnalytics", () => {
  it("carga el píxel, lo inicializa y emite PageView", async () => {
    const { container } = render(<SiteAnalytics metaPixelId="123456" consentMode="implicit" />);
    await act(async () => {});
    const fbq = (window as TestWindow).fbq;
    expect(fbq?.queue).toEqual([
      ["set", "autoConfig", false, "123456"],
      ["init", "123456"],
      ["track", "PageView"]
    ]);
    expect(container.querySelector('[data-testid="meta-pixel"]')?.getAttribute("data-src")).toBe(
      "https://connect.facebook.net/en_US/fbevents.js"
    );
    expect((window as TestWindow).dataLayer).toEqual([
      { event: "page_view", path: "/campanas/inmobiliarias" }
    ]);
  });

  it("sin ID de píxel no carga nada de Meta", async () => {
    const { container } = render(<SiteAnalytics consentMode="implicit" />);
    await act(async () => {});
    expect((window as TestWindow).fbq).toBeUndefined();
    expect(container.querySelector('[data-testid="meta-pixel"]')).toBeNull();
  });

  it("respeta Do Not Track", async () => {
    setDoNotTrack("1");
    const { container } = render(<SiteAnalytics metaPixelId="123456" consentMode="implicit" />);
    await act(async () => {});
    expect((window as TestWindow).fbq).toBeUndefined();
    expect(container.querySelector('[data-testid="meta-pixel"]')).toBeNull();
  });

  it("en modo explícito espera el consentimiento", async () => {
    render(<SiteAnalytics metaPixelId="123456" consentMode="explicit" />);
    await act(async () => {});
    expect((window as TestWindow).fbq).toBeUndefined();
    await act(async () => setAnalyticsConsent("granted"));
    expect((window as TestWindow).fbq?.queue).toContainEqual(["track", "PageView"]);
  });

  it("emite cta_click al hacer click en un CTA marcado", async () => {
    render(<SiteAnalytics metaPixelId="123456" consentMode="implicit" />);
    await act(async () => {});
    document.body.insertAdjacentHTML(
      "beforeend",
      '<div data-cta="agendar-conversacion"><a id="cta" href="#form">Agendar</a></div>'
    );
    await act(async () => document.getElementById("cta")?.click());
    expect((window as TestWindow).fbq?.queue).toContainEqual([
      "trackCustom",
      "cta_click",
      { cta: "agendar-conversacion", path: "/campanas/inmobiliarias" }
    ]);
  });

  it("carga la etiqueta de Google Ads y registra la página vista", async () => {
    const { container } = render(
      <SiteAnalytics
        googleAdsId="AW-123456789"
        googleAdsLeadLabel="leadLabel1"
        consentMode="implicit"
      />
    );
    await act(async () => {});
    expect(container.querySelector('[data-testid="google-tag"]')?.getAttribute("data-src")).toBe(
      "https://www.googletagmanager.com/gtag/js?id=AW-123456789"
    );
    const calls = ((window as TestWindow).dataLayer ?? []).map((entry) =>
      Object.prototype.toString.call(entry) === "[object Arguments]"
        ? Array.from(entry as IArguments)
        : entry
    );
    expect(calls).toContainEqual(["config", "AW-123456789", { send_page_view: false }]);
    expect(calls).toContainEqual(["event", "page_view", { send_to: "AW-123456789" }]);
  });

  it("sin ID de Google Ads no carga la etiqueta", async () => {
    const { container } = render(<SiteAnalytics consentMode="implicit" />);
    await act(async () => {});
    expect((window as TestWindow).gtag).toBeUndefined();
    expect(container.querySelector('[data-testid="google-tag"]')).toBeNull();
  });
});
