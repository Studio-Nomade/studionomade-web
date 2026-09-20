"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { createAdminServerClient } from "../../lib/supabase-server";

/**
 * Inicia el flujo de Google OAuth.
 *
 * El `redirectTo` apunta a nuestro callback, que es quien aplica la allowlist.
 * El origen se toma de las cabeceras de la petición para que funcione igual en
 * local, en preview y en producción sin configuración extra.
 */
export async function signInWithGoogle(formData: FormData) {
  const next = formData.get("next");
  const headerList = await headers();
  const origin =
    headerList.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3001";

  const callback = new URL("/auth/callback", origin);
  if (typeof next === "string" && next.startsWith("/") && !next.startsWith("//")) {
    callback.searchParams.set("next", next);
  }

  const client = await createAdminServerClient();
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callback.toString(),
      queryParams: { access_type: "offline", prompt: "consent" }
    }
  });

  if (error || !data.url) {
    redirect("/login?error=oauth");
  }

  redirect(data.url);
}

export async function signOut() {
  const client = await createAdminServerClient();
  await client.auth.signOut();
  redirect("/login");
}
