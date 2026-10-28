import "server-only";

import { parseAllowlist, type Allowlist } from "@studionomade/auth";

/**
 * Entorno de servidor del admin.
 *
 * `AUTH_ALLOWLIST` es obligatoria en la práctica: si falta, la allowlist queda
 * vacía y **nadie puede entrar** (deny by default). Es preferible un panel
 * inaccesible a un panel abierto por un despliegue mal configurado.
 */
export interface AdminServerEnvironment {
  readonly supabaseUrl: string;
  readonly supabasePublishableKey: string;
  readonly allowlist: Allowlist;
}

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

export function readAdminServerEnvironment(): AdminServerEnvironment {
  return {
    supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabasePublishableKey: required(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ),
    allowlist: parseAllowlist(process.env.AUTH_ALLOWLIST)
  };
}
