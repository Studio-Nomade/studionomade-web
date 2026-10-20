import { describe, expect, it } from "vitest";

import { buildFbc, resolveMetaBrowserIds } from "./meta-ids";

describe("resolveMetaBrowserIds", () => {
  const now = 1_729_400_000_000;

  it("usa las cookies del píxel cuando existen", () => {
    expect(
      resolveMetaBrowserIds({
        cookieFbp: "fb.1.1729000000000.111",
        cookieFbc: "fb.1.1729000000000.cookie-fbclid",
        fbclid: "url-fbclid",
        now
      })
    ).toEqual({ fbp: "fb.1.1729000000000.111", fbc: "fb.1.1729000000000.cookie-fbclid" });
  });

  it("deriva _fbc desde fbclid si la cookie no existe", () => {
    expect(resolveMetaBrowserIds({ fbclid: "IwAR0abc", now })).toEqual({
      fbp: undefined,
      fbc: buildFbc("IwAR0abc", now)
    });
    expect(buildFbc("IwAR0abc", now)).toBe("fb.1.1729400000000.IwAR0abc");
  });

  it("no inventa nada sin cookies ni fbclid", () => {
    expect(resolveMetaBrowserIds({ cookieFbp: " ", fbclid: "", now })).toEqual({
      fbp: undefined,
      fbc: undefined
    });
  });
});
