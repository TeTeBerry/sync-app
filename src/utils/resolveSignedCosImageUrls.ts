import { resolveSignedUploadUrls } from '../api/sync/uploads';
import type { SignedUploadUrlResult } from '../api/sync/uploads';
import {
  extractCosPostObjectKey,
  isCosPostImageUrl,
  sanitizeRemoteImageUrl,
} from './imageUrl';

/** Hide unsigned COS post URLs until signing completes. */
export function blankCosPostUrlsForDisplay(urls: string[]): string[] {
  return urls.map((url) => {
    const trimmed = url?.trim();
    if (!trimmed) return '';
    return isCosPostImageUrl(trimmed) ? '' : trimmed;
  });
}

function normalizeCosImageRequestUrl(url: string): string {
  return (sanitizeRemoteImageUrl(url) ?? url).trim();
}

function addSignedCosLookupKey(
  byKey: Map<string, string>,
  lookupKey: string | undefined,
  signed: string,
): void {
  const trimmed = lookupKey?.trim();
  if (!trimmed) return;
  byKey.set(trimmed, signed);
  const objectKey = extractCosPostObjectKey(trimmed);
  if (objectKey) byKey.set(objectKey, signed);
}

/** Build lookup keys for signed URL rows (inputUrl, url, sanitized variants, object key). */
export function buildSignedCosUrlLookup(
  rows: SignedUploadUrlResult[],
): Map<string, string> {
  const byKey = new Map<string, string>();
  for (const row of rows) {
    const signed = row.displayUrl?.trim();
    if (!signed) continue;
    for (const candidate of [row.inputUrl, row.url, row.displayUrl]) {
      addSignedCosLookupKey(byKey, candidate, signed);
      const sanitized = sanitizeRemoteImageUrl(candidate);
      addSignedCosLookupKey(byKey, sanitized, signed);
    }
  }
  return byKey;
}

function lookupSignedDisplayUrl(
  byKey: Map<string, string>,
  url: string,
): string | undefined {
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  return (
    byKey.get(trimmed) ||
    byKey.get(normalizeCosImageRequestUrl(trimmed)) ||
    byKey.get(extractCosPostObjectKey(trimmed) ?? '') ||
    undefined
  );
}

/** Resolve private COS post image URLs to signed display URLs (batch API). */
export async function resolveSignedCosImageUrls(urls: string[]): Promise<string[]> {
  const candidates = urls.map((url) => url?.trim()).filter(Boolean);
  if (!candidates.length) return [];

  const cosIndices: number[] = [];
  const cosUrls: string[] = [];
  candidates.forEach((url, index) => {
    const normalized = normalizeCosImageRequestUrl(url);
    if (isCosPostImageUrl(normalized)) {
      cosIndices.push(index);
      cosUrls.push(normalized);
    }
  });

  if (!cosUrls.length) return candidates;

  const rows = await resolveSignedUploadUrls(cosUrls);
  const byKey = buildSignedCosUrlLookup(rows);

  return candidates.map((url, index) => {
    const cosIndex = cosIndices.indexOf(index);
    if (cosIndex < 0) return url;
    const cosUrl = cosUrls[cosIndex];
    return (
      lookupSignedDisplayUrl(byKey, cosUrl) || lookupSignedDisplayUrl(byKey, url) || ''
    );
  });
}
