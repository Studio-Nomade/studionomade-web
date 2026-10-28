/** "AAAA-MM-DDTHH:mm" en hora de Santiago → ISO UTC (respeta el horario de verano). */
export function santiagoLocalToIso(local: string): string {
  const match = local.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return new Date(local).toISOString();
  const [, y, m, d, h, min] = match.map(Number);
  const guess = Date.UTC(y, m - 1, d, h, min);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Santiago",
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    })
      .formatToParts(new Date(guess))
      .map((part) => [part.type, part.value])
  );
  const asSantiago = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute)
  );
  return new Date(guess - (asSantiago - guess)).toISOString();
}
