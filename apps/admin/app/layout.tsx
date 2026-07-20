import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const allowIndexing = process.env.VERCEL_ENV === "production";

export const metadata: Metadata = {
  title: "Studio Nomade Admin",
  description: "Placeholder de fundación del ecosistema web Studio Nomade.",
  robots: allowIndexing ? { index: true, follow: true } : { index: false, follow: false }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
