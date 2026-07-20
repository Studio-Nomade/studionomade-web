import type { NextConfig } from "next";

const isProduction = process.env.VERCEL_ENV === "production";
const baseHeaders = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" }
];

const nextConfig: NextConfig = {
  transpilePackages: ["@studionomade/ui", "@studionomade/types", "@studionomade/validation"],
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
