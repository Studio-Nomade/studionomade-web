import type { NextConfig } from "next";
import { buildStaticContentSecurityPolicy, SECURITY_HEADERS } from "@studionomade/config/security";

const isProduction = process.env.VERCEL_ENV === "production";

/**
 * El CSP del sitio público se sirve desde aquí y no desde un middleware.
 *
 * El middleware solo tenía sentido para generar un nonce por petición, y un
 * nonce es incompatible con el prerender: el HTML se genera en build, sale sin
 * nonce, y la cabecera llega con uno distinto en cada respuesta. Sin nonce no
 * hay nada que variar por petición, así que la cabecera es estática y va con el
 * resto — una invocación de edge menos en cada visita.
 *
 * `NEXT_PUBLIC_SUPABASE_URL` se resuelve en build, que es cuando se necesita.
 */
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : undefined;

/**
 * `optimizePackageImports` ahorra ~4 kB de JS compartido reescribiendo el barrel
 * de @studionomade/ui a imports directos, pero su caché de desarrollo se queda
 * obsoleta cada vez que ese barrel cambia y la página revienta con
 * "Element type is invalid". Se mantiene en build y se desactiva en `next dev`.
 */
const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  experimental: isDevelopment ? {} : { optimizePackageImports: ["@studionomade/ui"] },
  transpilePackages: [
    "@studionomade/design-system",
    "@studionomade/ui",
    "@studionomade/types",
    "@studionomade/validation"
  ],
  async headers() {
    const headers = [
      ...SECURITY_HEADERS,
      { key: "Content-Security-Policy", value: buildStaticContentSecurityPolicy(supabaseOrigin) }
    ];
    return [
      {
        source: "/:path*",
        headers: isProduction
          ? headers
          : [...headers, { key: "X-Robots-Tag", value: "noindex, nofollow" }]
      }
    ];
  }
};

export default nextConfig;
