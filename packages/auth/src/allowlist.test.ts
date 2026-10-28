import { describe, expect, it } from "vitest";

import { isAllowed, isAllowlistConfigured, parseAllowlist } from "./allowlist";

describe("parseAllowlist", () => {
  it("acepta correos y dominios separados por comas, espacios o saltos de línea", () => {
    const list = parseAllowlist("a@studionomade.cl, @studionomade.cl\n b@otro.cl;c@otro.cl");
    expect(list.emails).toEqual(new Set(["a@studionomade.cl", "b@otro.cl", "c@otro.cl"]));
    expect(list.domains).toEqual(new Set(["studionomade.cl"]));
  });

  it("normaliza mayúsculas y espacios", () => {
    const list = parseAllowlist("  SEBASTIAN@StudioNomade.CL  ");
    expect(list.emails.has("sebastian@studionomade.cl")).toBe(true);
  });

  it("descarta entradas malformadas", () => {
    const list = parseAllowlist("studionomade.cl, @sinpunto, a@@b.cl, @, sinArroba");
    expect(list.emails.size).toBe(0);
    expect(list.domains.size).toBe(0);
  });

  it("una allowlist vacía o ausente no configura nada", () => {
    expect(isAllowlistConfigured(parseAllowlist(undefined))).toBe(false);
    expect(isAllowlistConfigured(parseAllowlist(""))).toBe(false);
    expect(isAllowlistConfigured(parseAllowlist("   "))).toBe(false);
  });
});

describe("isAllowed — deny by default", () => {
  it("rechaza TODO cuando la allowlist está vacía", () => {
    const empty = parseAllowlist(undefined);
    expect(isAllowed("sebastian@studionomade.cl", empty)).toBe(false);
    expect(isAllowed("cualquiera@dominio.cl", empty)).toBe(false);
  });

  it("acepta un correo listado explícitamente", () => {
    const list = parseAllowlist("sebastian@studionomade.cl");
    expect(isAllowed("sebastian@studionomade.cl", list)).toBe(true);
    expect(isAllowed("SEBASTIAN@STUDIONOMADE.CL", list)).toBe(true);
    expect(isAllowed("otra@studionomade.cl", list)).toBe(false);
  });

  it("acepta cualquier correo de un dominio listado", () => {
    const list = parseAllowlist("@studionomade.cl");
    expect(isAllowed("quien.sea@studionomade.cl", list)).toBe(true);
    expect(isAllowed("quien.sea@otrodominio.cl", list)).toBe(false);
  });

  it("no se deja engañar por dominios que contienen al permitido", () => {
    const list = parseAllowlist("@studionomade.cl");
    expect(isAllowed("atacante@studionomade.cl.evil.com", list)).toBe(false);
    expect(isAllowed("atacante@notstudionomade.cl", list)).toBe(false);
  });

  it("rechaza entradas sin correo o malformadas", () => {
    const list = parseAllowlist("@studionomade.cl");
    expect(isAllowed(null, list)).toBe(false);
    expect(isAllowed(undefined, list)).toBe(false);
    expect(isAllowed("", list)).toBe(false);
    expect(isAllowed("sinArroba", list)).toBe(false);
    expect(isAllowed("@studionomade.cl", list)).toBe(false);
    expect(isAllowed("a@@studionomade.cl", list)).toBe(false);
  });
});
