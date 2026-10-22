import type { EffectiveAccess } from "@studionomade/auth";
import type { Page, PageRepository } from "@studionomade/database";
import { describe, expect, it, vi } from "vitest";

import { createLogger } from "../logging";
import { createPageService } from "./page-service";

const silentLogger = createLogger({ requestId: "test" }, () => {});

const access = (...permissions: string[]): EffectiveAccess =>
  ({ roles: ["editor"], permissions }) as unknown as EffectiveAccess;

const READER = access("content.read");
const WRITER = access("content.read", "content.write");
const PUBLISHER = access("content.read", "content.write", "content.publish");

function page(overrides: Partial<Page> = {}): Page {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    slug: "mi-pagina",
    title: "Mi página",
    status: "borrador",
    publishedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides
  };
}

function fakeRepository(overrides: Partial<PageRepository> = {}): PageRepository {
  return {
    list: vi.fn(async () => ({ items: [page()], page: 1, pageSize: 20, total: 1, totalPages: 1 })),
    findBySlug: vi.fn(async () => null),
    getById: vi.fn(async () => page()),
    create: vi.fn(async (input) => page({ slug: input.slug, status: input.status })),
    update: vi.fn(async (_id, input) => page({ ...input })),
    remove: vi.fn(async () => {}),
    slugExists: vi.fn(async () => false),
    ...overrides
  } as unknown as PageRepository;
}

describe("createPageService — autorización", () => {
  it("exige content.read para listar", async () => {
    const service = createPageService({
      repository: fakeRepository(),
      access: access(),
      logger: silentLogger
    });
    await expect(service.list()).rejects.toMatchObject({ code: "forbidden", status: 403 });
  });

  it("exige content.write para crear", async () => {
    const service = createPageService({
      repository: fakeRepository(),
      access: READER,
      logger: silentLogger
    });
    await expect(service.create({ title: "Nueva" })).rejects.toMatchObject({ code: "forbidden" });
  });

  it("exige content.publish para crear ya publicada", async () => {
    const service = createPageService({
      repository: fakeRepository(),
      access: WRITER,
      logger: silentLogger
    });
    await expect(service.create({ title: "Nueva", status: "publicado" })).rejects.toMatchObject({
      code: "forbidden"
    });
  });

  it("un writer sí puede crear un borrador", async () => {
    const repository = fakeRepository();
    const service = createPageService({ repository, access: WRITER, logger: silentLogger });

    const result = await service.create({ title: "Diseño de Marca" });

    expect(result.slug).toBe("diseno-de-marca");
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "diseno-de-marca", status: "borrador", publishedAt: null })
    );
  });
});

describe("createPageService — slugs y estados", () => {
  it("resuelve colisiones de slug antes de insertar", async () => {
    const tomados = new Set(["diseno-de-marca"]);
    const repository = fakeRepository({
      slugExists: vi.fn(async (candidate: string) => tomados.has(candidate))
    });
    const service = createPageService({ repository, access: WRITER, logger: silentLogger });

    const result = await service.create({ title: "Diseño de Marca" });
    expect(result.slug).toBe("diseno-de-marca-2");
  });

  it("rechaza una transición no permitida sin tocar la base", async () => {
    const repository = fakeRepository({
      getById: vi.fn(async () => page({ status: "archivado" }))
    });
    const service = createPageService({ repository, access: PUBLISHER, logger: silentLogger });

    await expect(
      service.changeStatus({ id: page().id, status: "publicado" })
    ).rejects.toMatchObject({ code: "validation", status: 422 });

    expect(repository.update).not.toHaveBeenCalled();
  });

  it("al publicar fija published_at", async () => {
    const repository = fakeRepository();
    const service = createPageService({
      repository,
      access: PUBLISHER,
      logger: silentLogger,
      now: () => new Date("2026-09-20T12:00:00.000Z")
    });

    await service.changeStatus({ id: page().id, status: "publicado" });

    expect(repository.update).toHaveBeenCalledWith(
      page().id,
      expect.objectContaining({ status: "publicado", publishedAt: "2026-09-20T12:00:00.000Z" })
    );
  });

  it("despublicar conserva el published_at original", async () => {
    const original = "2026-02-02T00:00:00.000Z";
    const repository = fakeRepository({
      getById: vi.fn(async () => page({ status: "publicado", publishedAt: original }))
    });
    const service = createPageService({ repository, access: PUBLISHER, logger: silentLogger });

    await service.changeStatus({ id: page().id, status: "borrador" });

    expect(repository.update).toHaveBeenCalledWith(
      page().id,
      expect.objectContaining({ status: "borrador", publishedAt: original })
    );
  });
});

describe("createPageService — observabilidad", () => {
  it("registra el rechazo por permisos sin filtrar PII", async () => {
    const lines: string[] = [];
    const logger = createLogger({ requestId: "req-9", userId: "u-1" }, (l) => lines.push(l));
    const service = createPageService({ repository: fakeRepository(), access: READER, logger });

    await expect(service.create({ title: "x" })).rejects.toThrow();

    const entry = JSON.parse(lines[0]);
    expect(entry).toMatchObject({
      level: "warn",
      event: "page.forbidden",
      permission: "content.write",
      requestId: "req-9"
    });
  });
});
