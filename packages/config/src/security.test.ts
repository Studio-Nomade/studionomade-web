import { describe, expect, it } from "vitest";
import {
  buildStaticContentSecurityPolicy,
  buildStrictContentSecurityPolicy,
  SECURITY_HEADERS
} from "./security";

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

  it("ambas conservan las defensas que no dependen de script-src", () => {
    for (const policy of [
      buildStrictContentSecurityPolicy("abc"),
      buildStaticContentSecurityPolicy()
    ]) {
      expect(policy).toContain("object-src 'none'");
      expect(policy).toContain("base-uri 'self'");
      expect(policy).toContain("form-action 'self'");
      expect(policy).toContain("frame-ancestors 'none'");
      expect(policy).toContain("frame-src https://player.vimeo.com https://www.behance.net");
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
