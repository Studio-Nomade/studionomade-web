import { describe, expect, it } from "vitest";

import { isHoneypotFilled, signFormTimestamp, verifyFormTimestamp } from "./anti-spam";

const secret = "a-development-secret-with-enough-length";

describe("protecciones anti-spam", () => {
  it("detecta el honeypot", () => {
    expect(isHoneypotFilled("bot.example")).toBe(true);
    expect(isHoneypotFilled(" ")).toBe(false);
  });

  it("acepta una firma válida dentro de la ventana", () => {
    const now = 10_000;
    const timestamp = now - 3_000;
    expect(
      verifyFormTimestamp(String(timestamp), signFormTimestamp(timestamp, secret), secret, now)
    ).toBe(true);
  });

  it("rechaza envíos demasiado rápidos, expirados o alterados", () => {
    const now = 30_000_000;
    const recent = now - 1_000;
    const expired = now - 6 * 60 * 60 * 1_000 - 1;
    expect(
      verifyFormTimestamp(String(recent), signFormTimestamp(recent, secret), secret, now)
    ).toBe(false);
    expect(
      verifyFormTimestamp(String(expired), signFormTimestamp(expired, secret), secret, now)
    ).toBe(false);
    expect(verifyFormTimestamp(String(now - 3_000), "alterada", secret, now)).toBe(false);
  });
});
