import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, SECURITY_HEADERS } from "./security";

describe("security headers", () => {
  it("creates a nonce CSP with the approved embed origins", () => {
    const policy = buildContentSecurityPolicy("abc", "https://example.supabase.co");
    expect(policy).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(policy).toContain("frame-src https://player.vimeo.com https://www.behance.net");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).not.toContain("script-src 'self' 'unsafe-inline'");
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
