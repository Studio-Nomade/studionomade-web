import { describe, expect, it } from "vitest";
import {
  buildStaticContentSecurityPolicy,
  buildStrictContentSecurityPolicy,
  GOOGLE_ADS_CSP,
  META_PIXEL_CSP,
  PUBLIC_EMBEDS_CSP,
  SECURITY_HEADERS
} from "./security";

function directive(policy: string, name: string): string[] {
  const entry = policy
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name} `));
  return entry ? entry.split(/\s+/).slice(1) : [];
}

describe("security headers", () => {
  it("la política estricta usa nonce y strict-dynamic", () => {
    const policy = buildStrictContentSecurityPolicy("abc", "https://example.supabase.co");
    expect(policy).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(policy).toContain("connect-src 'self' https://example.supabase.co");
    expect(policy).not.toContain("script-src 'self' 'unsafe-inline'");
  });

  /**
   * Esta es la aserción que evita repetir el fallo que dejó al sitio público sin
   * JavaScript: un nonce en `script-src` hace que el navegador ignore
   * `'unsafe-inline'`, y como el HTML prerenderizado no lleva nonce, se bloquea
   * todo. La política estática no puede contener ninguno de los dos marcadores.
   */
  it("la política estática no lleva nonce ni strict-dynamic", () => {
    const policy = buildStaticContentSecurityPolicy("https://example.supabase.co");
    expect(policy).toContain("script-src 'self' 'unsafe-inline'");
    expect(policy).not.toContain("nonce-");
    expect(policy).not.toContain("strict-dynamic");
  });

  it("sin píxel no abre ningún origen de Meta", () => {
    const policy = buildStaticContentSecurityPolicy("https://example.supabase.co");
    expect(policy).not.toContain("facebook");
  });

  it("con píxel abre solo los orígenes de Meta necesarios", () => {
    const policy = buildStaticContentSecurityPolicy("https://example.supabase.co", {
      metaPixel: true
    });
    expect(directive(policy, "script-src")).toEqual([
      "'self'",
      "'unsafe-inline'",
      "https://connect.facebook.net",
      ...PUBLIC_EMBEDS_CSP.scriptSrc
    ]);
    expect(directive(policy, "connect-src")).toEqual([
      "'self'",
      "https://example.supabase.co",
      "https://www.facebook.com",
      "https://connect.facebook.net",
      ...PUBLIC_EMBEDS_CSP.connectSrc
    ]);
    // El beacon de imagen queda cubierto por `https:` en img-src.
    expect(directive(policy, "img-src")).toContain("https:");
    for (const origin of META_PIXEL_CSP.imgSrc) expect(origin.startsWith("https://")).toBe(true);
    // Nada de comodines ni de otras directivas abiertas a Meta.
    expect(directive(policy, "frame-src")).not.toContain("https://www.facebook.com");
    expect(policy).not.toMatch(/\*\.facebook/);
  });

  it("con píxel sigue sin nonce ni strict-dynamic", () => {
    const policy = buildStaticContentSecurityPolicy(undefined, { metaPixel: true });
    expect(policy).not.toContain("nonce-");
    expect(policy).not.toContain("strict-dynamic");
    expect(directive(policy, "connect-src")).toEqual([
      "'self'",
      "https://www.facebook.com",
      "https://connect.facebook.net",
      ...PUBLIC_EMBEDS_CSP.connectSrc
    ]);
  });

  it("el sitio público abre solo los embeds acordados (mapas, agenda y traductor)", () => {
    const policy = buildStaticContentSecurityPolicy();
    for (const origin of PUBLIC_EMBEDS_CSP.frameSrc)
      expect(directive(policy, "frame-src")).toContain(origin);
    expect(directive(policy, "script-src")).not.toContain("https://calendly.com");
    expect(buildStrictContentSecurityPolicy("abc")).not.toContain("translate.google");
    expect(policy).not.toMatch(/\*\.google/);
  });

  it("con Google Ads abre solo los orígenes de la etiqueta de Google", () => {
    const policy = buildStaticContentSecurityPolicy(undefined, { googleAds: true });
    for (const origin of GOOGLE_ADS_CSP.scriptSrc)
      expect(directive(policy, "script-src")).toContain(origin);
    for (const origin of GOOGLE_ADS_CSP.connectSrc)
      expect(directive(policy, "connect-src")).toContain(origin);
    for (const origin of GOOGLE_ADS_CSP.frameSrc)
      expect(directive(policy, "frame-src")).toContain(origin);
    expect(policy).not.toContain("nonce-");
    expect(policy).not.toMatch(/\*\.google|\*\.doubleclick/);
    expect(directive(buildStaticContentSecurityPolicy(), "script-src")).not.toContain(
      "https://www.googletagmanager.com"
    );
  });

  it("la política estricta del admin no abre Meta", () => {
    expect(buildStrictContentSecurityPolicy("abc")).not.toContain("facebook");
  });

  it("ambas conservan las defensas que no dependen de script-src", () => {
    for (const policy of [
      buildStrictContentSecurityPolicy("abc"),
      buildStaticContentSecurityPolicy(),
      buildStaticContentSecurityPolicy(undefined, { metaPixel: true })
    ]) {
      expect(policy).toContain("object-src 'none'");
      expect(policy).toContain("base-uri 'self'");
      expect(policy).toContain("form-action 'self'");
      expect(policy).toContain("frame-ancestors 'none'");
      expect(directive(policy, "frame-src").slice(0, 2)).toEqual([
        "https://player.vimeo.com",
        "https://www.behance.net"
      ]);
    }
  });

  it("includes transport and capability protections", () => {
    expect(SECURITY_HEADERS.map(({ key }) => key)).toEqual(
      expect.arrayContaining([
        "Strict-Transport-Security",
        "Permissions-Policy",
        "X-Content-Type-Options"
      ])
    );
  });
});
