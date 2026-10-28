import { describe, expect, it } from "vitest";

import { footerSocialLinks, SOCIAL_LINKS } from "./social";

describe("footerSocialLinks", () => {
  it("publica las cinco redes oficiales en orden, solo con https", () => {
    const links = footerSocialLinks();
    expect(links.map(({ kind }) => kind)).toEqual([
      "instagram",
      "behance",
      "vimeo",
      "linkedin",
      "threads"
    ]);
    for (const link of links) expect(link.href).toMatch(/^https:\/\//);
  });

  it("oculta los íconos sin URL o con '#'", () => {
    expect(
      footerSocialLinks({ ...SOCIAL_LINKS, vimeo: "", linkedin: "#" }).map(({ kind }) => kind)
    ).toEqual(["instagram", "behance", "threads"]);
  });
});
