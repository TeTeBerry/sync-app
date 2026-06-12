import Taro from '@tarojs/taro';
import { isCloudStorageUploadEnabled } from '../constants/cloud';

const CLOUD_FILE_ID_RE = /^cloud:\/\/[^/]+\/.+/;
const TEMP_URL_MAX_AGE_SEC = 3600;

const tempUrlCache = new Map<string, { url: string; expiresAt: number }>();

/** `cloud://` fileID stored in Mongo / returned by API. */
export function isCloudStorageFileId(src: string | undefined): boolean {
  const trimmed = src?.trim();
  return Boolean(trimmed && CLOUD_FILE_ID_RE.test(trimmed));
}

function readCachedTempUrl(fileId: string): string | undefined {
  const cached = tempUrlCache.get(fileId);
  if (!cached) return undefined;
  if (cached.expiresAt <= Date.now()) {
    tempUrlCache.delete(fileId);
    return undefined;
  }
  return cached.url;
}

function cacheTempUrl(fileId: string, url: string): void {
  tempUrlCache.set(fileId, {
    url,
    expiresAt: Date.now() + (TEMP_URL_MAX_AGE_SEC - 60) * 1000,
  });
}

/**
 * Resolve CloudBase fileIDs to HTTPS temp URLs via `wx.cloud.getTempFileURL`.
 * Backend stores fileID only; display happens client-side.
 */
export async function resolveCloudFileIdsToTempUrls(
  fileIds: string[],
): Promise<string[]> {
  const candidates = fileIds.map((id) => id?.trim()).filter(Boolean);
  if (!candidates.length) return [];

  if (!isCloudStorageUploadEnabled() || !Taro.cloud) {
    return candidates.map(() => '');
  }

  const uncached: string[] = [];
  const uncachedIndices: number[] = [];
  const results = candidates.map((fileId, index) => {
    const cached = readCachedTempUrl(fileId);
    if (cached) return cached;
    uncached.push(fileId);
    uncachedIndices.push(index);
    return '';
  });

  if (!uncached.length) {
    return results;
  }

  const request = {
    fileList: uncached.map((fileID) => ({
      fileID,
      maxAge: TEMP_URL_MAX_AGE_SEC,
    })),
  };
  const response = (await Taro.cloud.getTempFileURL(
    request as unknown as Parameters<
      NonNullable<typeof Taro.cloud>['getTempFileURL']
    >[0],
  )) as {
    fileList?: Array<{ fileID?: string; tempFileURL?: string; status?: number }>;
  };

  for (let i = 0; i < uncached.length; i += 1) {
    const fileId = uncached[i]!;
    const row = response.fileList?.[i];
    const tempUrl = row?.tempFileURL?.trim() ?? '';
    if (tempUrl && row?.status === 0) {
      cacheTempUrl(fileId, tempUrl);
      results[uncachedIndices[i]!] = tempUrl;
    }
  }

  return results;
}

/** Test helper */
export function clearCloudTempUrlCacheForTests(): void {
  tempUrlCache.clear();
}
