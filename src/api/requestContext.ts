import { getAccessToken } from '../utils/authStorage';
import { getClientUserId } from '../utils/session';

/** Query-string identity for REST. With Bearer: `{}`. Without token: no demo query. */
export type OwnerQueryParams = Record<string, string>;

export function hasAuthenticatedRequest(): boolean {
  return Boolean(getAccessToken());
}

/**
 * Query-string identity for REST.
 * With Bearer: returns `{}` (backend JwtAuthGuard sets req.actor from JWT).
 * Without token: returns `{}` (protected routes require login).
 */
export function ownerQueryParams(): OwnerQueryParams {
  return {};
}

/** Stable id for React Query keys and notification APIs. */
export function resolveRequestUserId(): string {
  return getClientUserId();
}

/** Notification scope: omit userId query when Bearer (JWT middleware injects actor). */
export function notificationQueryParams(): Record<string, string> | undefined {
  return undefined;
}

export function mergeOwnerQueryParams(
  extra?: Record<string, string | undefined>,
): Record<string, string> {
  const merged: Record<string, string | undefined> = {
    ...ownerQueryParams(),
    ...extra,
  };
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(merged)) {
    if (value !== undefined && value !== '') {
      out[key] = value;
    }
  }
  return out;
}

export function ownerQueryParamsWithActivity(
  activityLegacyId?: number,
): Record<string, string> {
  const params = mergeOwnerQueryParams();
  if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
    params.activityLegacyId = String(activityLegacyId);
  }
  return params;
}
