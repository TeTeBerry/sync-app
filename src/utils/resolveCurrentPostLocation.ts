import { fetchReverseGeocodeLabel } from '../api/sync/travelGuide';
import { isLiveApi } from '../constants/api';
import { ensureUserLocationAuthorized, getUserGcj02Location } from './tencentMap';

const CACHE_MS = 5 * 60_000;
let cached: { label: string; savedAt: number } | null = null;

/** Resolve a short location label (city/district) from the device GPS. */
export async function resolveCurrentPostLocation(): Promise<string | undefined> {
  if (!isLiveApi()) {
    return undefined;
  }

  if (cached && Date.now() - cached.savedAt < CACHE_MS) {
    return cached.label;
  }

  const authorized = await ensureUserLocationAuthorized('展示发帖位置');
  if (!authorized) {
    return undefined;
  }

  try {
    const { latitude, longitude } = await getUserGcj02Location();
    const { label } = await fetchReverseGeocodeLabel(latitude, longitude);
    const trimmed = label?.trim();
    if (!trimmed) {
      return undefined;
    }
    cached = { label: trimmed, savedAt: Date.now() };
    return trimmed;
  } catch {
    return undefined;
  }
}

/** Test helper — reset in-memory cache between unit tests. */
export function clearCurrentPostLocationCache(): void {
  cached = null;
}
