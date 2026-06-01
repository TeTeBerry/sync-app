import { getAccessToken } from '../utils/authStorage';
import { getClientUserId } from '../utils/session';

/** Demo-owner query identity. Empty when Bearer is sent. */
export type OwnerQueryParams = Record<string, string>;

export function hasAuthenticatedRequest(): boolean {
  return Boolean(getAccessToken());
}

/** Demo REST actor: userId only (backend isDemoOwnerClient ignores authorName). */
export function demoActorQueryParams(): { userId: string } {
  return { userId: getClientUserId() };
}

/**
 * Query-string identity for REST.
 * With Bearer: returns `{}` (backend JwtActorMiddleware injects actor from JWT).
 * Without token: demo `userId` only.
 */
export function ownerQueryParams(): OwnerQueryParams {
  if (hasAuthenticatedRequest()) {
    return {};
  }
  return demoActorQueryParams();
}

/** Stable id for React Query keys and notification APIs. */
export function resolveRequestUserId(): string {
  return getClientUserId();
}

/** Notification scope: omit userId query when Bearer (JWT middleware injects actor). */
export function notificationQueryParams(): Record<string, string> | undefined {
  if (hasAuthenticatedRequest()) {
    return undefined;
  }
  return { userId: resolveRequestUserId() };
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
