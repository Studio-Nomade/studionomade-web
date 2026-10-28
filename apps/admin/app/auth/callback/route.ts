import { NextResponse, type NextRequest } from "next/server";

import { isAllowed, isAllowlistConfigured } from "@studionomade/auth";

import { readAdminServerEnvironment } from "../../../lib/env";
import { createAdminServerClient } from "../../../lib/supabase-server";

/**
 * Callback de Google OAuth.
 *
 * Supabase Auth crea la cuenta en cuanto Google devuelve un código válido, así que
 * **esta es la puerta**: si el correo no está en la allowlist se cierra la sesión
 * inmediatamente y se registra el rechazo. Aunque alguien lograra saltarse este
 * punto, seguiría sin poder hacer nada: un usuario nuevo no recibe ningún rol y
 * RLS deniega por defecto.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth", origin));
  }

  const client = await createAdminServerClient();
  const { error } = await client.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=oauth", origin));
  }

  const { data } = await client.auth.getUser();
  const email = data.user?.email ?? null;
  const { allowlist } = readAdminServerEnvironment();

  if (!isAllowlistConfigured(allowlist) || !isAllowed(email, allowlist)) {
    await client.auth.signOut();

    // Sin PII en el log: el identificador basta para rastrear el intento.
    console.warn(
      JSON.stringify({
        event: "auth.allowlist_rejected",
        userId: data.user?.id ?? null,
        allowlistConfigured: isAllowlistConfigured(allowlist)
      })
    );

    return NextResponse.redirect(new URL("/auth/denegado", origin));
  }

  // Solo se aceptan destinos internos: evita redirecciones abiertas.
  const destination = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return NextResponse.redirect(new URL(destination, origin));
}
