import { resolveCloudFileIdsToTempUrls, isCloudStorageFileId } from './cloudImage';

/** Hide unresolved cloud fileIDs until getTempFileURL completes. */
export function blankUnresolvedImageUrls(urls: string[]): string[] {
  return urls.map((url) => {
    const trimmed = url?.trim();
    if (!trimmed) return '';
    if (isCloudStorageFileId(trimmed)) return '';
    return trimmed;
  });
}

/** Resolve `cloud://` fileIDs to HTTPS temp URLs; pass through other refs. */
export async function resolveDisplayImageUrls(urls: string[]): Promise<string[]> {
  const candidates = urls.map((url) => url?.trim()).filter(Boolean);
  if (!candidates.length) return [];

  const cloudIndices: number[] = [];
  const cloudIds: string[] = [];

  candidates.forEach((url, index) => {
    if (isCloudStorageFileId(url)) {
      cloudIndices.push(index);
      cloudIds.push(url);
    }
  });

  const cloudResolved = cloudIds.length
    ? await resolveCloudFileIdsToTempUrls(cloudIds)
    : [];

  return candidates.map((original, index) => {
    const cloudPos = cloudIndices.indexOf(index);
    if (cloudPos >= 0) {
      return cloudResolved[cloudPos]?.trim() || '';
    }
    return original;
  });
}
