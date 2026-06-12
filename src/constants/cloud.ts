/**
 * WeChat mini program CloudBase storage (wx.cloud).
 * Taro injects `TARO_APP_CLOUDBASE_ENV_ID` at compile time.
 */
const rawCloudEnvId = process.env.TARO_APP_CLOUDBASE_ENV_ID || '';

export const CLOUDBASE_ENV_ID = rawCloudEnvId.trim();

/** UGC object prefix in cloud storage — must match backend `ugc/` validation. */
export const CLOUD_UGC_UPLOAD_PREFIX = 'ugc/posts';

/** Cloud upload when weapp + env id configured. */
export function isCloudStorageUploadEnabled(): boolean {
  return process.env.TARO_ENV === 'weapp' && CLOUDBASE_ENV_ID.length > 0;
}
