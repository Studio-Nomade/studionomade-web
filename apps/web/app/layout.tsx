import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "@studionomade/design-system/fonts";
import { RevealRoot } from "@studionomade/ui";
import "@studionomade/design-system/styles.css";
import { SiteAnalytics } from "../components/analytics/site-analytics";
import { parseConsentMode } from "../lib/analytics/consent";
import { normalizeMetaPixelId } from "../lib/analytics/meta-pixel";

const allowIndexing = process.env.VERCEL_ENV === "production";

/** Sin `NEXT_PUBLIC_META_PIXEL_ID` válido no se carga nada de Meta. */
const metaPixelId = normalizeMetaPixelId(process.env.NEXT_PUBLIC_META_PIXEL_ID);
const analyticsConsentMode = parseConsentMode(process.env.NEXT_PUBLIC_ANALYTICS_CONSENT_MODE);

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://studionomade.cl"),
  title: "Studio Nomade",
  description: "Placeholder de fundación del ecosistema web Studio Nomade.",
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
        <RevealRoot />
        <SiteAnalytics metaPixelId={metaPixelId} consentMode={analyticsConsentMode} />
      </body>
    </html>
  );
}
