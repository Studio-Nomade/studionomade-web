"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { combineAdapters } from "@studionomade/analytics";

import { classifyClick } from "../../lib/analytics/clicks";
import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_STORAGE_KEY,
  hasPrivacySignal,
  isTrackingAllowed,
  readBrowserPrivacySignals,
  readConsentDecision,
  type AnalyticsConsentMode
} from "../../lib/analytics/consent";
import { createDataLayerAdapter } from "../../lib/analytics/data-layer";
import {
  createMetaPixelAdapter,
  initMetaPixel,
  installFbqStub,
  META_PIXEL_SCRIPT_SRC,
  type Fbq
} from "../../lib/analytics/meta-pixel";
import { configureAnalytics, track } from "../../lib/analytics/track";

export interface SiteAnalyticsProps {
  /** ID numérico ya normalizado. Sin ID no se carga el píxel. */
  metaPixelId?: string;
  consentMode: AnalyticsConsentMode;
}

type FbqWindow = Window & { fbq?: Fbq };

function useTrackingAllowed(mode: AnalyticsConsentMode): boolean {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const evaluate = () =>
      setAllowed(
        isTrackingAllowed({
          mode,
          decision: readConsentDecision(),
          privacySignal: hasPrivacySignal(readBrowserPrivacySignals())
        })
      );
    const onStorage = (event: StorageEvent) => {
      if (event.key === ANALYTICS_CONSENT_STORAGE_KEY) evaluate();
    };
    evaluate();
    window.addEventListener(ANALYTICS_CONSENT_EVENT, evaluate);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, evaluate);
      window.removeEventListener("storage", onStorage);
    };
  }, [mode]);
  return allowed;
}

/** PageView en la carga inicial y en cada navegación del App Router. */
function PageViews({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  useEffect(() => {
    if (enabled) track("page_view", { path: pathname });
  }, [enabled, pathname, search]);
  return null;
}

/**
 * Medición del sitio público: Meta Pixel + dataLayer genérico.
 *
 * Nada se carga ni se emite hasta que `isTrackingAllowed` lo permite (ver
 * lib/analytics/consent.ts). Los eventos de negocio (`cta_click`,
 * `contact_click`, `form_submit`) pasan por `track()`, que reparte al píxel y a
 * `window.dataLayer` para un GTM/GA futuro.
 */
export function SiteAnalytics({ metaPixelId, consentMode }: SiteAnalyticsProps) {
  const allowed = useTrackingAllowed(consentMode);
  // `ready` llega un render después de configurar el adapter: los efectos de los
  // hijos corren antes que los del padre y el primer PageView se perdería.
  const [ready, setReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const target = window as FbqWindow;
    if (!allowed) {
      configureAnalytics(undefined);
      target.fbq?.("consent", "revoke");
      setReady(false);
      return;
    }
    if (metaPixelId) {
      const alreadyInstalled = Boolean(target.fbq);
      const fbq = installFbqStub(target);
      if (alreadyInstalled) fbq("consent", "grant");
      else initMetaPixel(fbq, metaPixelId);
    }
    configureAnalytics(
      combineAdapters(
        createDataLayerAdapter(() => window),
        metaPixelId ? createMetaPixelAdapter(() => (window as FbqWindow).fbq) : undefined
      )
    );
    setReady(true);
  }, [allowed, metaPixelId]);

  useEffect(() => {
    if (!ready) return;
    const onClick = (event: MouseEvent) => {
      const click = classifyClick(event.target, pathname);
      if (click) track(click.event, click.properties);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [ready, pathname]);

  return (
    <>
      <Suspense fallback={null}>
        <PageViews enabled={ready} />
      </Suspense>
      {ready && metaPixelId && (
        <Script id="meta-pixel" src={META_PIXEL_SCRIPT_SRC} strategy="afterInteractive" />
      )}
    </>
  );
}
