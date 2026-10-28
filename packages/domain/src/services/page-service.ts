import { type EffectiveAccess, AuthError, hasPermission } from "@studionomade/auth";
import {
  type ContentStatus,
  type ListPagesFilter,
  type Page,
  type PageRepository,
  type Paginated,
  DataError
} from "@studionomade/database";

import type { Logger } from "../logging";
import { canTransition, requiresPublishPermission, resolveStatusChange } from "../publishing";
import { ensureUniqueSlug, generateSlug } from "../slug";

/**
 * Servicio de dominio de páginas.
 *
 * Esta es la capa donde vive la regla de negocio. Es **server-only** y siempre
 * recibe el acceso efectivo ya calculado: no lo deduce ni confía en el cliente.
 *
 * Autorización en profundidad: comprobar aquí NO sustituye a RLS. Si alguien
 * llamara al repositorio saltándose este servicio, la base seguiría denegando.
 * Se comprueba aquí para poder dar un error claro y registrar el intento.
 */

export interface PageServiceDeps {
  readonly repository: PageRepository;
  readonly access: EffectiveAccess;
  readonly logger: Logger;
  readonly now?: () => Date;
}

export interface CreatePageCommand {
  readonly title: string;
  readonly slug?: string;
  readonly status?: ContentStatus;
}

export interface ChangeStatusCommand {
  readonly id: string;
  readonly status: ContentStatus;
}

export function createPageService({ repository, access, logger, now }: PageServiceDeps) {
  function assertPermission(permission: Parameters<typeof hasPermission>[1], action: string) {
    if (!hasPermission(access, permission)) {
      logger.warn("page.forbidden", { action, permission });
      throw new AuthError("forbidden", `falta ${permission} para ${action}`);
    }
  }

  return {
    async list(filter: ListPagesFilter = {}): Promise<Paginated<Page>> {
      assertPermission("content.read", "listar páginas");
      const result = await repository.list(filter);
      logger.info("page.listed", { total: result.total, page: result.page });
      return result;
    },

    async create(command: CreatePageCommand): Promise<Page> {
      assertPermission("content.write", "crear página");

      const status = command.status ?? "borrador";
      if (requiresPublishPermission(status)) {
        assertPermission("content.publish", "publicar página");
      }

      const base = command.slug ? generateSlug(command.slug) : generateSlug(command.title);
      const slug = await ensureUniqueSlug(base, (candidate) => repository.slugExists(candidate));
      const { publishedAt } = resolveStatusChange(status, null, now);

      const page = await repository.create({
        slug,
        title: command.title.trim(),
        status,
        publishedAt
      });

      logger.info("page.created", { pageId: page.id, status: page.status });
      return page;
    },

    async changeStatus(command: ChangeStatusCommand): Promise<Page> {
      assertPermission("content.write", "cambiar estado");

      const current = await repository.getById(command.id);

      if (!canTransition(current.status, command.status)) {
        logger.warn("page.invalid_transition", {
          pageId: current.id,
          from: current.status,
          to: command.status
        });
        throw new DataError(
          "validation",
          `transición no permitida: ${current.status} -> ${command.status}`
        );
      }

      if (requiresPublishPermission(command.status)) {
        assertPermission("content.publish", "publicar página");
      }

      const change = resolveStatusChange(command.status, current.publishedAt, now);
      const page = await repository.update(current.id, {
        status: change.status,
        publishedAt: change.publishedAt
      });

      logger.info("page.status_changed", {
        pageId: page.id,
        from: current.status,
        to: page.status
      });
      return page;
    }
  };
}

export type PageService = ReturnType<typeof createPageService>;
