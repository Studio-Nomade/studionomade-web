import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BOOKING_URL } from "../../content/contact";
import { BookingEmbed } from "./booking-embed";

describe("BookingEmbed", () => {
  it("incrusta la agenda en diferido, con título y enlace a pestaña nueva", () => {
    const { container } = render(<BookingEmbed bookingUrl={BOOKING_URL} />);
    const frame = container.querySelector("iframe")!;
    expect(frame.getAttribute("src")).toBe(BOOKING_URL);
    expect(frame.getAttribute("loading")).toBe("lazy");
    expect(frame.getAttribute("title")).toBe("Agenda una videollamada con Studio Nomade");
    const link = screen.getByRole("link", { name: /Abrir en una pestaña nueva/ });
    expect(link.getAttribute("href")).toBe(BOOKING_URL);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("funciona con una página de citas de Google Calendar", () => {
    const url = "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0abc?gv=true";
    const { container } = render(<BookingEmbed bookingUrl={url} />);
    expect(container.querySelector("iframe")?.getAttribute("src")).toBe(url);
  });

  it("sin un proveedor conocido deja solo el enlace", () => {
    const { container } = render(<BookingEmbed bookingUrl="https://example.com/agenda" />);
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.getByRole("link", { name: /Abrir en una pestaña nueva/ })).toBeTruthy();
  });
});
