import Taro from '@tarojs/taro';
import { fetchPersonalityTestMediaUrls } from '@/api/sync/personalityTest';
import { isLiveApi } from '@/constants/api';
import { CLOUDBASE_ENV_ID, isCloudBaseEnabled } from '@/constants/cloud';
import { initCloudBase } from '@/utils/cloudInit';

const mediaUrlCache = new Map<string, { url: string; expiresAt: number }>();
const TEMP_URL_MAX_AGE_SEC = 3600;

function readCachedUrl(assetKey: string): string | undefined {
  const cached = mediaUrlCache.get(assetKey);
  if (!cached) return undefined;
  if (cached.expiresAt <= Date.now()) {
    mediaUrlCache.delete(assetKey);
    return undefined;
  }
  return cached.url;
}

function cacheUrl(assetKey: string, url: string): void {
  mediaUrlCache.set(assetKey, {
    url,
    expiresAt: Date.now() + (TEMP_URL_MAX_AGE_SEC - 60) * 1000,
  });
}

export function buildPersonalityCloudFileId(assetKey: string): string {
  const key = assetKey.trim();
  const envId = CLOUDBASE_ENV_ID.trim();
  if (!key || !envId) return '';
  return `cloud://${envId}/${key}`;
}

async function resolveViaBackend(assetKey: string): Promise<string> {
  if (!isLiveApi()) {
    return '';
  }
  try {
    const response = await fetchPersonalityTestMediaUrls([assetKey]);
    return response.urls[assetKey]?.trim() ?? '';
  } catch (error) {
    console.warn('[personality-media] backend media-urls failed:', error);
    return '';
  }
}

async function resolveViaWxCloud(fileId: string): Promise<string> {
  if (!isCloudBaseEnabled() || !Taro.cloud) {
    return '';
  }

  initCloudBase();

  try {
    const request = {
      fileList: [{ fileID: fileId, maxAge: TEMP_URL_MAX_AGE_SEC }],
    };
    const response = (await Taro.cloud.getTempFileURL(
      request as unknown as Parameters<
        NonNullable<typeof Taro.cloud>['getTempFileURL']
      >[0],
    )) as {
      fileList?: Array<{ tempFileURL?: string; status?: number }>;
    };

    const tempUrl = response.fileList?.[0]?.tempFileURL?.trim() ?? '';
    if (tempUrl && response.fileList?.[0]?.status === 0) {
      return tempUrl;
    }
  } catch (error) {
    console.warn('[personality-media] wx.cloud.getTempFileURL failed:', error);
  }
  return '';
}

/** Resolve personality-test static media from cloud object key or HTTPS URL. */
export async function resolvePersonalityMediaUrl(source?: string): Promise<string> {
  const trimmed = source?.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }

  const assetKey = trimmed.startsWith('cloud://')
    ? trimmed.replace(/^cloud:\/\/[^/]+\//, '')
    : trimmed;
  if (!assetKey) return '';

  const cacheKey = trimmed.startsWith('cloud://') ? trimmed : assetKey;
  const cached = readCachedUrl(cacheKey);
  if (cached) return cached;

  const backendUrl = await resolveViaBackend(assetKey);
  if (backendUrl) {
    cacheUrl(cacheKey, backendUrl);
    return backendUrl;
  }

  const fileId = trimmed.startsWith('cloud://')
    ? trimmed
    : buildPersonalityCloudFileId(assetKey);
  const wxUrl = fileId ? await resolveViaWxCloud(fileId) : '';
  if (wxUrl) {
    cacheUrl(cacheKey, wxUrl);
  }
  return wxUrl;
}

export async function resolvePersonalityMediaUrls(
  sources: Array<string | undefined>,
): Promise<string[]> {
  return Promise.all(sources.map((source) => resolvePersonalityMediaUrl(source)));
}

/** Test helper */
export function clearPersonalityMediaUrlCacheForTests(): void {
  mediaUrlCache.clear();
}
