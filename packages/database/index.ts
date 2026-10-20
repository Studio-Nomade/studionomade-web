export { createBrowserDatabaseClient } from "./clients/browser";
export { createServiceDatabaseClient } from "./clients/service";
export { createServerDatabaseClient } from "./clients/server";
export type { Database, Json } from "./types/database";

export {
  DataError,
  isDataError,
  mapPostgrestError,
  toPublicDataError,
  type DataErrorCode
} from "./errors";

export {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  paginate,
  resolveRange,
  type PageRequest,
  type Paginated,
  type ResolvedRange
} from "./queries/pagination";

export {
  toArea,
  toPage,
  toProject,
  type Area,
  type ContentStatus,
  type Page,
  type Project
} from "./mappers";

export {
  createPageRepository,
  type CreatePageInput,
  type ListPagesFilter,
  type PageRepository,
  type UpdatePageInput
} from "./repositories/pages";

export { createAreaRepository, type AreaRepository } from "./repositories/areas";

export {
  createPageSectionRepository,
  type CreateSectionInput,
  type PageSection,
  type PageSectionRepository,
  type UpdateSectionInput
} from "./repositories/page-sections";
