import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ANALYTICS_CONSENT_EVENT,
  hasPrivacySignal,
  isTrackingAllowed,
  parseConsentMode,
  readConsentDecision,
  setAnalyticsConsent
} from "./consent";

afterEach(() => window.localStorage.clear());

describe("isTrackingAllowed", () => {
  it("modo implícito: mide salvo DNT/GPC", () => {
    expect(isTrackingAllowed({ mode: "implicit", decision: null, privacySignal: false })).toBe(
      true
    );
    expect(isTrackingAllowed({ mode: "implicit", decision: null, privacySignal: true })).toBe(
      false
    );
  });

  it("modo explícito: exige consentimiento", () => {
    expect(isTrackingAllowed({ mode: "explicit", decision: null, privacySignal: false })).toBe(
      false
    );
    expect(isTrackingAllowed({ mode: "explicit", decision: "granted", privacySignal: false })).toBe(
      true
    );
  });

  it("la decisión explícita gana sobre la señal del navegador", () => {
    expect(isTrackingAllowed({ mode: "implicit", decision: "denied", privacySignal: false })).toBe(
      false
    );
    expect(isTrackingAllowed({ mode: "implicit", decision: "granted", privacySignal: true })).toBe(
      true
    );
  });
});

describe("señales y almacenamiento", () => {
  it("reconoce Do Not Track y Global Privacy Control", () => {
    expect(hasPrivacySignal({ doNotTrack: "1" })).toBe(true);
    expect(hasPrivacySignal({ globalPrivacyControl: true })).toBe(true);
    expect(hasPrivacySignal({ doNotTrack: "0", globalPrivacyControl: false })).toBe(false);
    expect(hasPrivacySignal(undefined)).toBe(false);
  });

  it("parseConsentMode usa implícito por defecto", () => {
    expect(parseConsentMode(undefined)).toBe("implicit");
    expect(parseConsentMode("explicit")).toBe("explicit");
    expect(parseConsentMode("otro")).toBe("implicit");
  });

  it("guarda la decisión y avisa al sitio", () => {
    const listener = vi.fn();
    window.addEventListener(ANALYTICS_CONSENT_EVENT, listener);
    setAnalyticsConsent("denied");
    expect(readConsentDecision()).toBe("denied");
    expect(listener).toHaveBeenCalledOnce();
    setAnalyticsConsent(null);
    expect(readConsentDecision()).toBeNull();
    window.removeEventListener(ANALYTICS_CONSENT_EVENT, listener);
  });

  it("sobrevive a un localStorage bloqueado", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readConsentDecision()).toBeNull();
    spy.mockRestore();
  });
});
