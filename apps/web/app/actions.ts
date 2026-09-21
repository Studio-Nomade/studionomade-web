"use server";

import { headers } from "next/headers";
import { submitLead, type SubmitLeadResult } from "../lib/leads/submit-lead";

export async function submitContactLead(
  _previousState: SubmitLeadResult | null,
  formData: FormData
): Promise<SubmitLeadResult> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const sourcePath = String(formData.get("source_path") ?? "/");

  formData.set("landing_path", sourcePath);
  formData.set("referrer", requestHeaders.get("referer") ?? "");

  return submitLead(formData, {
    ipAddress: forwarded || requestHeaders.get("x-real-ip") || "127.0.0.1",
    userAgent: requestHeaders.get("user-agent") ?? undefined
  });
}
