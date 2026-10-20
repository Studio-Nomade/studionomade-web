import { describe, expect, it } from "vitest";

import { footerSocialLinks, SOCIAL_LINKS } from "./social";

describe("footerSocialLinks", () => {
  it("no publica enlaces vacíos ni '#'", () => {
    for (const link of footerSocialLinks()) {
      expect(link.href).not.toBe("#");
      expect(link.href).toMatch(/^(https:\/\/|mailto:)/);
    }
  });

  it("oculta los íconos sin URL", () => {
    expect(
      footerSocialLinks({ ...SOCIAL_LINKS, vimeo: "", linkedin: "#" }).map(({ kind }) => kind)
    ).toEqual(["instagram", "email"]);
  });
});
