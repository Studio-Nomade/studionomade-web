import { timingSafeEqual } from "node:crypto";

const SENSITIVE_KEYS = /authorization|cookie|password|secret|token|email|phone/i;

export function redactSensitiveFields(fields: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      SENSITIVE_KEYS.test(key) ? "[REDACTED]" : value
    ])
  );
}

export function secureCompare(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
  );
}
