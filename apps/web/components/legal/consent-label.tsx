import Link from "next/link";

import { leadConsent, type LeadConsentVersion } from "../../content/legal/consentimientos";

/**
 * Texto de consentimiento derivado del registro versionado: lo que se ve es
 * exactamente lo que se registra en `consent_version`.
 *
 * El enlace abre en otra pestaña para no perder lo escrito en el formulario.
 */
export function ConsentLabel({ version }: { version: LeadConsentVersion }) {
  const { text, link } = leadConsent(version);
  if (!link) return <>{text}</>;
  const start = text.indexOf(link.label);
  if (start < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, start)}
      <Link href={link.href} target="_blank" rel="noopener">
        {link.label}
      </Link>
      {text.slice(start + link.label.length)}
    </>
  );
}
