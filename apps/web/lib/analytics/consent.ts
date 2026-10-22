/**
 * Decisión de consentimiento para medición publicitaria (Meta Pixel y futuros
 * GA/GTM). Ver docs/analytics-campanas.md.
 *
 * Chile (Ley 19.628) no exige hoy un banner de cookies, pero se aplica un
 * criterio conservador:
 *
 * - Modo `implicit` (por defecto): se mide salvo que el navegador envíe Do Not
 *   Track o Global Privacy Control, o que la persona haya rechazado.
 * - Modo `explicit`: no se mide nada hasta que alguien llame a
 *   `setAnalyticsConsent("granted")` (lo que haría un banner futuro).
 *
 * Una decisión explícita siempre gana sobre la señal del navegador.
 */
export type AnalyticsConsentMode = "implicit" | "explicit";
export type AnalyticsConsentDecision = "granted" | "denied";

export const ANALYTICS_CONSENT_STORAGE_KEY = "sn:analytics-consent";
export const ANALYTICS_CONSENT_EVENT = "sn:analytics-consent-change";

export function parseConsentMode(value: string | undefined): AnalyticsConsentMode {
  return value === "explicit" ? "explicit" : "implicit";
}

interface PrivacySignals {
  doNotTrack?: string | null;
  globalPrivacyControl?: boolean;
}

export function hasPrivacySignal(signals: PrivacySignals | undefined): boolean {
  if (!signals) return false;
  return (
    signals.doNotTrack === "1" ||
    signals.doNotTrack === "yes" ||
    signals.globalPrivacyControl === true
  );
}

export function isTrackingAllowed({
  mode,
  decision,
  privacySignal
}: {
  mode: AnalyticsConsentMode;
  decision: AnalyticsConsentDecision | null;
  privacySignal: boolean;
}): boolean {
  if (decision === "denied") return false;
  if (decision === "granted") return true;
  if (mode === "explicit") return false;
  return !privacySignal;
}

export function readConsentDecision(): AnalyticsConsentDecision | null {
  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

/** API pública para un banner de cookies: guarda la decisión y avisa al sitio. */
export function setAnalyticsConsent(decision: AnalyticsConsentDecision | null): void {
  try {
    if (decision) window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, decision);
    else window.localStorage.removeItem(ANALYTICS_CONSENT_STORAGE_KEY);
  } catch {
    /* Sin almacenamiento la decisión dura lo que la pestaña. */
  }
  window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_EVENT, { detail: decision }));
}

export function readBrowserPrivacySignals(): PrivacySignals {
  const navigatorWithGpc = window.navigator as Navigator & { globalPrivacyControl?: boolean };
  const legacyWindow = window as Window & { doNotTrack?: string };
  return {
    doNotTrack: navigatorWithGpc.doNotTrack ?? legacyWindow.doNotTrack ?? null,
    globalPrivacyControl: navigatorWithGpc.globalPrivacyControl
  };
}
