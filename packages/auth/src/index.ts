export {
  EMPTY_ALLOWLIST,
  isAllowed,
  isAllowlistConfigured,
  parseAllowlist,
  type Allowlist
} from "./allowlist";

export { AuthError, isAuthError, toPublicError, type AuthErrorCode } from "./errors";

export {
  NO_ACCESS,
  PERMISSION_CODES,
  ROLE_SLUGS,
  canAccessAdmin,
  hasAnyRole,
  hasPermission,
  hasRole,
  readEffectiveAccess,
  type EffectiveAccess,
  type PermissionCode,
  type RoleSlug
} from "./roles";

export { readSessionUser, requireAllowlistedSession, type SessionUser } from "./session";

export {
  requireAdminAccess,
  requireAnyRole,
  requirePermission,
  type AuthorizedContext
} from "./guards";
