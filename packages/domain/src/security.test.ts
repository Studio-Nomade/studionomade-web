import { describe, expect, it } from "vitest";
import { redactSensitiveFields, secureCompare } from "./security";

describe("security helpers", () => {
  it("redacts credentials and personal contact fields", () => {
    expect(
      redactSensitiveFields({
        requestId: "r1",
        email: "person@example.test",
        authorization: "Bearer x"
      })
    ).toEqual({
      requestId: "r1",
      email: "[REDACTED]",
      authorization: "[REDACTED]"
    });
  });
  it("compares signatures without early character comparison", () => {
    expect(secureCompare("same", "same")).toBe(true);
    expect(secureCompare("same", "diff")).toBe(false);
    expect(secureCompare("short", "longer")).toBe(false);
  });
});
