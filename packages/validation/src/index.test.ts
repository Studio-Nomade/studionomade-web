import { describe, expect, it } from "vitest";
import { readPublicEnvironment } from "./index";

describe("readPublicEnvironment", () => {
  it("permite construir sin variables reales usando defaults locales", () => {
    expect(readPublicEnvironment({})).toEqual({
      NEXT_PUBLIC_APP_ENV: "local",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000"
    });
  });

  it("rechaza URLs inválidas", () => {
    expect(() => readPublicEnvironment({ NEXT_PUBLIC_SITE_URL: "no-es-url" })).toThrow();
  });
});
