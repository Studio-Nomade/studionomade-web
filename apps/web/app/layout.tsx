import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "@studionomade/design-system/fonts";
import { RevealRoot } from "@studionomade/ui";
import "@studionomade/design-system/styles.css";
import "./translate.css";
import { SiteAnalytics } from "../components/analytics/site-analytics";
import { MotionShell } from "../components/public/motion-shell";
import { faviconFor } from "../content/area-meta";
import { parseConsentMode } from "../lib/analytics/consent";
import { normalizeConversionLabel, normalizeGoogleAdsId } from "../lib/analytics/google-ads";
import { normalizeMetaPixelId } from "../lib/analytics/meta-pixel";

const allowIndexing = process.env.VERCEL_ENV === "production";

/** Sin `NEXT_PUBLIC_META_PIXEL_ID` válido no se carga nada de Meta. */
const metaPixelId = normalizeMetaPixelId(process.env.NEXT_PUBLIC_META_PIXEL_ID);
const googleAdsId = normalizeGoogleAdsId(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID);
const googleAdsLeadLabel = normalizeConversionLabel(process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL);
const analyticsConsentMode = parseConsentMode(process.env.NEXT_PUBLIC_ANALYTICS_CONSENT_MODE);

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://studionomade.cl"),
  title: "Studio Nomade",
  description:
    "Studio Nomade: estudio creativo de Branding, Architecture, Audiovisual y Web Design en Santiago, Algarrobo, Madrid y Lisboa.",
  icons: faviconFor("studio"),
  robots: allowIndexing ? { index: true, follow: true } : { index: false, follow: false }
};

/**
 * Red de seguridad para un fallo de hidratación.
 *
 * El armado del revelado lo decide el CSS con `@media (scripting: enabled)`, así
 * que sin JavaScript no se oculta nada y no hay desajuste de hidratación. Pero si
 * JavaScript existe y aun así la hidratación falla, `RevealRoot` nunca corre y el
 * contenido se quedaría oculto: este watchdog lo desarma pasados dos segundos.
 */
const REVEAL_WATCHDOG = `setTimeout(function(){if(!window.__snRevealReady){document.documentElement.setAttribute('data-reveal-failed','')}},2000);`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" className={fontVariables}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_WATCHDOG }} />
      </head>
      <body>
        {children}
        {/* Motor de Reveal/SplitText/Parallax/Counter (GSAP, carga diferida). */}
        <RevealRoot />
        {/* Scroll suave, cursor y cortina entre páginas. El Preloader existe en
            @studionomade/ui pero queda apagado: retrasaría el LCP del sitio. */}
        <MotionShell />
        <SiteAnalytics
          metaPixelId={metaPixelId}
          googleAdsId={googleAdsId}
          googleAdsLeadLabel={googleAdsLeadLabel}
          consentMode={analyticsConsentMode}
        />
      </body>
    </html>
  );
}
