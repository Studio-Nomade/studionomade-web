import { NextResponse } from "next/server";
import { signFormTimestamp } from "../../../../lib/leads/anti-spam";

// El timestamp se firma por petición para que el formulario estático de la home
// pueda pasar la verificación anti-spam sin volver dinámica la página completa.
export const dynamic = "force-dynamic";

export function GET() {
  const secret = process.env.LEAD_FORM_SECRET;
  if (!secret || secret.length < 16) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const timestamp = Date.now();
  return NextResponse.json(
    { t: String(timestamp), signature: signFormTimestamp(timestamp, secret) },
    { headers: { "cache-control": "no-store" } }
  );
}
