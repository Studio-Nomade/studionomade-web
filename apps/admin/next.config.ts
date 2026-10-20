import type { NextConfig } from "next";
import { SECURITY_HEADERS } from "@studionomade/config/security";

const isProduction = process.env.VERCEL_ENV === "production";
const nextConfig: NextConfig = {
  experimental: { optimizePackageImports: ["@studionomade/ui"] },
  transpilePackages: [
    "@studionomade/design-system",
    "@studionomade/ui",
    "@studionomade/types",
    "@studionomade/validation",
    "@studionomade/auth",
    "@studionomade/database",
    "@studionomade/domain"
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: isProduction
          ? [...SECURITY_HEADERS]
          : [...SECURITY_HEADERS, { key: "X-Robots-Tag", value: "noindex, nofollow" }]
      }
    ];
  }
};

export default nextConfig;
