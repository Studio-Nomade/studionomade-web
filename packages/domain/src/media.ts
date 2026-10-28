import { randomUUID } from "node:crypto";

const BUCKET_RULES = {
  "public-media": {
    maxBytes: 10_485_760,
    mime: ["image/jpeg", "image/png", "image/webp", "image/avif"]
  },
  "project-media": {
    maxBytes: 52_428_800,
    mime: ["image/jpeg", "image/png", "image/webp", "image/avif", "video/mp4", "video/webm"]
  },
  "team-media": {
    maxBytes: 10_485_760,
    mime: ["image/jpeg", "image/png", "image/webp", "image/avif"]
  }
} as const;

export type PublicMediaBucket = keyof typeof BUCKET_RULES;

export function validateMediaUpload(input: {
  bucket: string;
  mimeType: string;
  sizeBytes: number;
}) {
  const rules = BUCKET_RULES[input.bucket as PublicMediaBucket];
  if (!rules) return { ok: false as const, error: "Bucket no permitido." };
  if (!(rules.mime as readonly string[]).includes(input.mimeType)) {
    return { ok: false as const, error: "Tipo de archivo no permitido." };
  }
  if (
    !Number.isSafeInteger(input.sizeBytes) ||
    input.sizeBytes <= 0 ||
    input.sizeBytes > rules.maxBytes
  ) {
    return { ok: false as const, error: "El archivo supera el tamaño permitido." };
  }
  return { ok: true as const };
}

export function createMediaObjectPath(originalName: string, now = new Date()) {
  const extension = originalName.toLowerCase().match(/\.[a-z0-9]{1,8}$/)?.[0] ?? "";
  return `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}${extension}`;
}
