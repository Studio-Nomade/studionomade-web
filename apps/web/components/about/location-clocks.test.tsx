import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ABOUT } from "../../content/about";
import { handAngles, localClock, LocationClocks } from "./location-clocks";

afterEach(() => vi.useRealTimers());

describe("localClock", () => {
  // 21-10-2026 12:00 UTC: Chile en horario de verano (UTC-3), Madrid UTC+2, Lisboa UTC+1.
  const now = new Date("2026-10-21T12:00:00Z");

  it.each([
    ["America/Santiago", "09:00", "GMT-3"],
    ["Europe/Madrid", "14:00", "GMT+2"],
    ["Europe/Lisbon", "13:00", "GMT+1"]
  ])("%s → %s (%s)", (timeZone, time, offset) => {
    expect(localClock(timeZone, now)).toEqual({ time, offset });
  });
});

describe("LocationClocks", () => {
  it("muestra las tres ciudades y actualiza la hora al cambiar el minuto", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-21T12:00:30Z"));
    render(<LocationClocks locations={ABOUT.locations.items} />);

    expect(
      screen.getAllByRole("listitem").map((item) => item.querySelector("p")?.textContent)
    ).toEqual(["Santiago", "Madrid", "Lisboa"]);
    expect(screen.getByLabelText("Hora local en Madrid: 14:00")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(31_000);
    });
    expect(screen.getByLabelText("Hora local en Madrid: 14:01")).toBeTruthy();
    expect(screen.getByLabelText("Hora local en Santiago: 09:01")).toBeTruthy();
  });
});

describe("handAngles", () => {
  it("ubica las agujas de hora y minuto", () => {
    expect(handAngles("09:00")).toEqual({ hour: 270, minute: 0 });
    expect(handAngles("14:30")).toEqual({ hour: 75, minute: 180 });
  });
});
