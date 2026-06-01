import { getAccessToken } from '../utils/authStorage';
import { getClientUserId, getClientUserName } from '../utils/session';

/** Demo-owner query identity (`userId` + `authorName`). Empty when Bearer is sent. */
export type OwnerQueryParams = Record<string, string>;

/**
 * Query-string identity for REST.
 * With Bearer: returns `{}` (backend JwtActorMiddleware injects actor from JWT).
 * Without token: demo `userId` / `authorName` for legacy Query flow.
 */
export function ownerQueryParams(): OwnerQueryParams {
  if (getAccessToken()) {
    return {};
  }
  return {
    userId: getClientUserId(),
    authorName: getClientUserName(),
  };
}

/** Stable id for React Query keys and notification APIs. */
export function resolveRequestUserId(): string {
  return getClientUserId();
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
