import { fetchPersonalityTestMediaUrls } from '@/api/sync/personalityTest';
import { isLiveApi } from '@/constants/api';

const mediaUrlCache = new Map<string, { url: string; expiresAt: number }>();
const TEMP_URL_TTL_MS = (3600 - 60) * 1000;

function readCachedUrl(cacheKey: string): string | undefined {
  const cached = mediaUrlCache.get(cacheKey);
  if (!cached) return undefined;
  if (cached.expiresAt <= Date.now()) {
    mediaUrlCache.delete(cacheKey);
    return undefined;
  }
  if (!cached.url) return undefined;
  return cached.url;
}

function cacheUrl(cacheKey: string, url: string): void {
  mediaUrlCache.set(cacheKey, {
    url,
    expiresAt: Date.now() + TEMP_URL_TTL_MS,
  });
}

function normalizeAssetKey(source: string): string {
  const trimmed = source.trim();
  if (trimmed.startsWith('cloud://')) {
    return trimmed.replace(/^cloud:\/\/[^/]+\//, '');
  }
  return trimmed;
}

let pendingBackendFetch: Promise<Record<string, string>> | null = null;
let pendingBackendKeys: string[] = [];

function buildUrlMap(assetKeys: string[]): Record<string, string> {
  return Object.fromEntries(
    assetKeys
      .map((key) => [key, readCachedUrl(key) ?? ''] as const)
      .filter(([, url]) => url),
  );
}

/** Drain queued keys — concurrent callers may append while a batch is in flight. */
async function drainBackendMediaFetches(): Promise<void> {
  for (;;) {
    if (pendingBackendFetch) {
      await pendingBackendFetch;
      continue;
    }
    if (!pendingBackendKeys.length) {
      break;
    }
    const keysToFetch = [...new Set(pendingBackendKeys)];
    pendingBackendKeys = [];
    pendingBackendFetch = fetchPersonalityTestMediaUrls(keysToFetch)
      .then((response) => {
        for (const [key, url] of Object.entries(response.urls ?? {})) {
          if (url?.trim()) {
            cacheUrl(key, url.trim());
          }
        }
        return response.urls ?? {};
      })
      .catch((error) => {
        console.warn('[personality-media] backend media-urls failed:', error);
        return {};
      })
      .finally(() => {
        pendingBackendFetch = null;
      });
    await pendingBackendFetch;
  }
}

async function fetchBackendUrls(assetKeys: string[]): Promise<Record<string, string>> {
  if (!isLiveApi() || !assetKeys.length) {
    return {};
  }

  const uncached = assetKeys.filter((key) => !readCachedUrl(key));
  if (!uncached.length) {
    return buildUrlMap(assetKeys);
  }

  pendingBackendKeys = [...new Set([...pendingBackendKeys, ...uncached])];
  await drainBackendMediaFetches();

  return buildUrlMap(assetKeys);
}

/** Resolve personality-test media URLs from cloud storage via backend API. */
export async function resolvePersonalityMediaUrl(source?: string): Promise<string> {
  const trimmed = source?.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }

  const assetKey = normalizeAssetKey(trimmed);
  if (!assetKey) return '';

  const cacheKey = trimmed.startsWith('cloud://') ? trimmed : assetKey;
  const cached = readCachedUrl(cacheKey);
  if (cached) {
    return cached;
  }

  const backendUrls = await fetchBackendUrls([assetKey]);
  const backendUrl = backendUrls[assetKey]?.trim() ?? '';
  if (backendUrl) {
    cacheUrl(cacheKey, backendUrl);
    return backendUrl;
  }

  return '';
}

export async function resolvePersonalityMediaUrls(
  sources: Array<string | undefined>,
): Promise<string[]> {
  const assetKeys = sources
    .map((source) => (source ? normalizeAssetKey(source) : ''))
    .filter(Boolean);

  if (assetKeys.length) {
    await fetchBackendUrls([...new Set(assetKeys)]);
  }

  return Promise.all(sources.map((source) => resolvePersonalityMediaUrl(source)));
}

/** Test helper */
export function clearPersonalityMediaUrlCacheForTests(): void {
  mediaUrlCache.clear();
  pendingBackendFetch = null;
  pendingBackendKeys = [];
}
