import { describe, expect, it } from "vitest";

import { santiagoLocalToIso } from "./dates";

describe("santiagoLocalToIso", () => {
  it("convierte hora de Santiago en verano (UTC-3)", () => {
    expect(santiagoLocalToIso("2026-10-21T15:30")).toBe("2026-10-21T18:30:00.000Z");
  });

  it("convierte hora de Santiago en invierno (UTC-4)", () => {
    expect(santiagoLocalToIso("2026-06-10T09:00")).toBe("2026-06-10T13:00:00.000Z");
  });
});
