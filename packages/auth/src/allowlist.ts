/**
 * Allowlist explícita de correos autorizados.
 *
 * Regla central: **deny by default**. Una allowlist vacía o ausente no deja entrar
 * a nadie. Nunca se interpreta "sin configurar" como "todo permitido".
 *
 * Formato de `AUTH_ALLOWLIST` (separado por comas, espacios o saltos de línea):
 *   - `persona@studionomade.cl`  → un correo concreto
 *   - `@studionomade.cl`         → un dominio completo
 * Cualquier otra entrada se descarta por malformada.
 */

export interface Allowlist {
  readonly emails: ReadonlySet<string>;
  readonly domains: ReadonlySet<string>;
}

export const EMPTY_ALLOWLIST: Allowlist = {
  emails: new Set<string>(),
  domains: new Set<string>()
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function parseAllowlist(raw: string | undefined | null): Allowlist {
  const emails = new Set<string>();
  const domains = new Set<string>();

  if (!raw) {
    return { emails, domains };
  }

  for (const entry of raw.split(/[\s,;]+/)) {
    const value = normalize(entry);
    if (!value) continue;

    if (value.startsWith("@")) {
      const domain = value.slice(1);
      // Un dominio debe tener al menos un punto y nada de arrobas extra.
      if (domain.includes(".") && !domain.includes("@")) {
        domains.add(domain);
      }
      continue;
    }

    const at = value.indexOf("@");
    if (at > 0 && at === value.lastIndexOf("@") && value.slice(at + 1).includes(".")) {
      emails.add(value);
    }
    // Entradas sin "@" se descartan: un dominio debe escribirse como "@dominio.cl"
    // para que nunca se confunda con un correo mal escrito.
  }

  return { emails, domains };
}

export function isAllowed(email: string | null | undefined, allowlist: Allowlist): boolean {
  if (!email) return false;

  const value = normalize(email);
  const at = value.indexOf("@");
  if (at <= 0 || at !== value.lastIndexOf("@")) return false;

  if (allowlist.emails.has(value)) return true;

  const domain = value.slice(at + 1);
  return allowlist.domains.has(domain);
}

export function isAllowlistConfigured(allowlist: Allowlist): boolean {
  return allowlist.emails.size > 0 || allowlist.domains.size > 0;
}
