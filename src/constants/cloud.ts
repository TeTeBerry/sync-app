/**
 * WeChat mini program CloudBase storage (wx.cloud).
 * Taro injects `TARO_APP_CLOUDBASE_ENV_ID` at compile time.
 */
const rawCloudEnvId = process.env.TARO_APP_CLOUDBASE_ENV_ID || '';

export const CLOUDBASE_ENV_ID = rawCloudEnvId.trim();

function readApiBaseUrl(): string {
  const raw =
    process.env.TARO_APP_API_BASE_URL || (process.env.TARO_ENV === 'h5' ? '/api' : '');
  return raw.replace(/\/$/, '');
}

/** CloudBase 云托管服务名（callContainer / connectContainer 的 `service`）。 */
export function resolveCloudRunService(): string {
  const explicit = (process.env.TARO_APP_CLOUD_RUN_SERVICE || '').trim();
  if (explicit) return explicit;

  const apiBase = readApiBaseUrl();
  if (!apiBase.startsWith('http')) return '';
  try {
    const host = new URL(apiBase).hostname;
    const match = host.match(/^(.+)-\d+\.sh\.run\.tcloudbase\.com$/);
    return match?.[1] ?? '';
  } catch {
    return '';
  }
}

export const CLOUD_RUN_SERVICE = resolveCloudRunService();

/** UGC object prefix in cloud storage — must match backend `ugc/` validation. */
export const CLOUD_UGC_UPLOAD_PREFIX = 'ugc/posts';

/** wx.cloud available when weapp + env id configured. */
export function isCloudBaseEnabled(): boolean {
  return process.env.TARO_ENV === 'weapp' && CLOUDBASE_ENV_ID.length > 0;
}

/** Cloud upload when weapp + env id configured. */
export function isCloudStorageUploadEnabled(): boolean {
  return isCloudBaseEnabled();
}

/** Mini program API/WS via wx.cloud.callContainer + connectContainer (no request 合法域名). */
export function isWeappCloudRunTransportEnabled(): boolean {
  return isCloudBaseEnabled() && CLOUD_RUN_SERVICE.length > 0;
}
