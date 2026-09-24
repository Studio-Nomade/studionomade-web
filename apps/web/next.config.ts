import type { NextConfig } from "next";

const isProduction = process.env.VERCEL_ENV === "production";
const baseHeaders = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" }
];

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
    return [
      {
        source: "/:path*",
        headers: isProduction
          ? baseHeaders
          : [...baseHeaders, { key: "X-Robots-Tag", value: "noindex, nofollow" }]
      }
    ];
  }
};

export default nextConfig;
