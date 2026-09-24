import { type NextRequest, NextResponse } from "next/server";

import { createServerDatabaseClient } from "@studionomade/database";
import { buildStrictContentSecurityPolicy } from "@studionomade/config/security";

/**
 * Primera capa de la autorización en profundidad: middleware → servidor → RLS.
 *
 * Aquí solo se resuelve **si hay sesión válida** y se refresca la cookie. La
 * comprobación de rol y permiso se hace server-side en cada página/acción (ver
 * `requireAdminAccess`) y, como última palabra, en las políticas RLS de Postgres.
 *
 * Deliberadamente NO se consultan roles en el middleware: obligaría a un viaje a
 * la base de datos en cada request, incluidos los estáticos, y el middleware no
 * es la frontera de seguridad real — RLS lo es.
 */

const PUBLIC_PATHS = ["/login", "/auth/callback", "/auth/signout", "/auth/denegado"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  const connectOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
    : undefined;
  const policy = buildStrictContentSecurityPolicy(nonce, connectOrigin);
  requestHeaders.set("Content-Security-Policy", policy);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", policy);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Sin configuración de Supabase no se puede verificar nada: se deniega el acceso
  // a las rutas protegidas en vez de dejarlas pasar.
  if (!url || !key) {
    if (isPublicPath(request.nextUrl.pathname)) return response;
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "config");
    return NextResponse.redirect(loginUrl);
  }

  const client = createServerDatabaseClient(url, key, {
    getAll: () => request.cookies.getAll().map(({ name, value }) => ({ name, value })),
    setAll: (values) => {
      for (const { name, value, options } of values) {
        response.cookies.set(name, value, options);
      }
    }
  });

  // getUser() valida el JWT contra el servidor de Supabase. getSession() solo leería
  // la cookie y confiaría en ella, que es precisamente lo que no se puede hacer aquí.
  const {
    data: { user }
  } = await client.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  // Se excluyen estáticos e imágenes: no hay nada que proteger ahí y evita
  // un getUser() por cada recurso.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)"
  ]
};
