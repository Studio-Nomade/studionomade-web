import { createHmac } from "node:crypto";

export function hashIpAddress(ipAddress: string, salt: string) {
  if (!ipAddress || salt.length < 16) {
    throw new Error("IP address and a strong salt are required");
  }

  return createHmac("sha256", salt).update(ipAddress).digest("hex");
}
