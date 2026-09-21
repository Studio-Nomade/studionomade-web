import { createHmac, timingSafeEqual } from "node:crypto";

const MINIMUM_AGE_MS = 2_500;
const MAXIMUM_AGE_MS = 6 * 60 * 60 * 1_000;

export function signFormTimestamp(timestamp: number, secret: string) {
  if (secret.length < 16) throw new Error("A strong form secret is required");
  return createHmac("sha256", secret).update(String(timestamp)).digest("hex");
}

export function verifyFormTimestamp(
  timestampValue: string,
  signature: string,
  secret: string,
  now = Date.now()
) {
  const timestamp = Number(timestampValue);
  if (!Number.isSafeInteger(timestamp)) return false;

  const expected = Buffer.from(signFormTimestamp(timestamp, secret), "utf8");
  const received = Buffer.from(signature, "utf8");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return false;

  const age = now - timestamp;
  return age >= MINIMUM_AGE_MS && age <= MAXIMUM_AGE_MS;
}

export function isHoneypotFilled(value?: string) {
  return Boolean(value?.trim());
}
