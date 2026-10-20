import { describe, expect, it } from "vitest";
import { parseSafeEmbed } from "./embeds";
import { createMediaObjectPath, validateMediaUpload } from "./media";
import { projectPublicationIssues } from "./project-publication";

describe("medios y embeds", () => {
  it("acepta MIME permitido y rechaza ejecutables o exceso de tamaño", () => {
    expect(
      validateMediaUpload({ bucket: "project-media", mimeType: "image/webp", sizeBytes: 2000 }).ok
    ).toBe(true);
    expect(
      validateMediaUpload({ bucket: "project-media", mimeType: "text/html", sizeBytes: 2000 }).ok
    ).toBe(false);
    expect(
      validateMediaUpload({ bucket: "team-media", mimeType: "image/png", sizeBytes: 99_000_000 }).ok
    ).toBe(false);
  });

  it("genera nombres no predecibles sin conservar el nombre original", () => {
    const first = createMediaObjectPath("cliente-secreto.webp");
    const second = createMediaObjectPath("cliente-secreto.webp");
    expect(first).not.toBe(second);
    expect(first).not.toContain("cliente-secreto");
    expect(first).toMatch(/\.webp$/);
  });

  it("solo produce embeds desde la whitelist", () => {
    expect(parseSafeEmbed("https://vimeo.com/123456")?.embedUrl).toBe(
      "https://player.vimeo.com/video/123456"
    );
    expect(parseSafeEmbed("https://www.behance.net/gallery/123/proyecto")?.provider).toBe(
      "behance"
    );
    expect(parseSafeEmbed("https://evil.example/script")).toBeNull();
    expect(parseSafeEmbed("javascript:alert(1)")).toBeNull();
  });

  it("bloquea publicación si falta cualquier autorización", () => {
    expect(
      projectPublicationIssues({ authorizationGranted: false, team: [], testimonials: [] })
    ).toHaveLength(1);
    expect(
      projectPublicationIssues({
        authorizationGranted: true,
        team: [{ authorizationGranted: false }],
        testimonials: []
      })
    ).toContain("Hay integrantes del equipo sin autorización.");
  });
});
