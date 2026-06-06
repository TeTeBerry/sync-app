import { apiPost } from '../../utils/apiClient';
import { extractCosPostObjectKey, sanitizeRemoteImageUrl } from '../../utils/imageUrl';

export type UploadVerifyStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'submit_failed';

export type UploadVerifyResult = {
  url: string;
  status: UploadVerifyStatus;
  traceId?: string;
  displayUrl?: string;
};

export type SignedUploadUrlResult = {
  inputUrl: string;
  url: string;
  displayUrl?: string;
};

type SignedUrlWaiter = {
  urls: string[];
  resolve: (rows: SignedUploadUrlResult[]) => void;
  reject: (error: unknown) => void;
};

let pendingUrls: string[] = [];
let pendingWaiters: SignedUrlWaiter[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const signedUrlCache = new Map<string, SignedUploadUrlResult>();

function isCosPostUploadPath(url: string): boolean {
  try {
    return new URL(url.trim()).pathname.includes('/uploads/posts/');
  } catch {
    return url.includes('/uploads/posts/');
  }
}

function cacheSignedUrlRow(row: SignedUploadUrlResult): void {
  const inputUrl = row.inputUrl?.trim();
  if (!inputUrl) return;
  if (isCosPostUploadPath(inputUrl) && !row.displayUrl?.trim()) {
    return;
  }
  const keys = new Set<string>([inputUrl]);
  const canonical = row.url?.trim();
  if (canonical) keys.add(canonical);
  const sanitizedInput = sanitizeRemoteImageUrl(inputUrl);
  if (sanitizedInput?.trim()) keys.add(sanitizedInput.trim());
  const sanitizedCanonical = canonical ? sanitizeRemoteImageUrl(canonical) : undefined;
  if (sanitizedCanonical?.trim()) keys.add(sanitizedCanonical.trim());
  const objectKey = extractCosPostObjectKey(inputUrl);
  if (objectKey) keys.add(objectKey);
  for (const key of keys) {
    signedUrlCache.set(key, row);
  }
}

function readCachedSignedUrlRow(url: string): SignedUploadUrlResult | undefined {
  const trimmed = url.trim();
  const candidates = [
    trimmed,
    sanitizeRemoteImageUrl(trimmed),
    extractCosPostObjectKey(trimmed),
  ].filter((value): value is string => Boolean(value?.trim()));

  for (const key of candidates) {
    const row = signedUrlCache.get(key.trim());
    if (!row) continue;
    if (isCosPostUploadPath(trimmed) && !row.displayUrl?.trim()) {
      signedUrlCache.delete(key.trim());
      continue;
    }
    return row;
  }
  return undefined;
}

function flushSignedUrlBatch() {
  flushTimer = null;
  const urls = [...new Set(pendingUrls.map((url) => url.trim()).filter(Boolean))];
  const waiters = pendingWaiters;
  pendingUrls = [];
  pendingWaiters = [];

  if (!urls.length) {
    waiters.forEach((waiter) => waiter.resolve([]));
    return;
  }

  void apiPost<SignedUploadUrlResult[]>('/uploads/signed-urls', { urls })
    .then((rows) => {
      const rowByLookupKey = new Map<string, SignedUploadUrlResult>();
      for (const row of rows) {
        cacheSignedUrlRow(row);
        for (const candidate of [row.inputUrl, row.url]) {
          const trimmed = candidate?.trim();
          if (!trimmed) continue;
          rowByLookupKey.set(trimmed, row);
          const sanitized = sanitizeRemoteImageUrl(trimmed);
          if (sanitized?.trim()) rowByLookupKey.set(sanitized.trim(), row);
          const objectKey = extractCosPostObjectKey(trimmed);
          if (objectKey) rowByLookupKey.set(objectKey, row);
        }
      }
      waiters.forEach((waiter) => {
        waiter.resolve(
          waiter.urls.map((url) => {
            const trimmed = url.trim();
            return (
              readCachedSignedUrlRow(trimmed) ??
              rowByLookupKey.get(trimmed) ??
              rowByLookupKey.get(sanitizeRemoteImageUrl(trimmed) ?? '') ??
              rowByLookupKey.get(extractCosPostObjectKey(trimmed) ?? '') ?? {
                inputUrl: trimmed,
                url: trimmed,
              }
            );
          }),
        );
      });
    })
    .catch((error) => {
      waiters.forEach((waiter) => waiter.reject(error));
    });
}

function scheduleSignedUrlBatch(urls: string[]): Promise<SignedUploadUrlResult[]> {
  const normalized = urls.map((url) => url.trim()).filter(Boolean);
  const uncached = normalized.filter((url) => !readCachedSignedUrlRow(url));
  if (!uncached.length) {
    return Promise.resolve(
      normalized.map(
        (url) =>
          readCachedSignedUrlRow(url) ?? {
            inputUrl: url,
            url,
          },
      ),
    );
  }

  return new Promise((resolve, reject) => {
    pendingUrls.push(...uncached);
    pendingWaiters.push({ urls: normalized, resolve, reject });
    if (flushTimer) {
      clearTimeout(flushTimer);
    }
    flushTimer = setTimeout(flushSignedUrlBatch, 0);
  });
}

export function verifyCosUpload(url: string) {
  return apiPost<UploadVerifyResult>('/uploads/verify', { url });
}

export function checkUploadStatus(urls: string[]) {
  return apiPost<UploadVerifyResult[]>('/uploads/check-status', { urls });
}

export function resolveSignedUploadUrls(urls: string[]) {
  return scheduleSignedUrlBatch(urls);
}

/** Test helper: reset in-memory signed URL batch state. */
export function clearSignedUploadUrlCache(): void {
  pendingUrls = [];
  pendingWaiters = [];
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  signedUrlCache.clear();
}
