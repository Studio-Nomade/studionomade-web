export { ensureUniqueSlug, generateSlug, isValidSlug } from "./slug";

export {
  CONTENT_STATUSES,
  canTransition,
  requiresPublishPermission,
  resolveStatusChange,
  type StatusChange
} from "./publishing";

export {
  resolveIndexing,
  type AppEnvironment,
  type IndexingDecision,
  type IndexingInput
} from "./indexing";

export {
  createLogger,
  newRequestId,
  type LogContext,
  type LogFields,
  type LogLevel,
  type LogSink,
  type Logger
} from "./logging";

export {
  createPageService,
  type ChangeStatusCommand,
  type CreatePageCommand,
  type PageService,
  type PageServiceDeps
} from "./services/page-service";

export type {
  LeadDraft,
  LeadService,
  MailMessage,
  MailService,
  NotificationService
} from "./services/contracts";

export { toHttpError, type HttpErrorBody } from "./http";
