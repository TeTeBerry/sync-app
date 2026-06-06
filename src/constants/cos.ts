import { DEFAULT_COS_BUCKET, DEFAULT_COS_REGION } from './cosDefaults';

/**
 * Taro injects `process.env.TARO_*` at compile time; avoid optional chaining on
 * `process.env.*` so weapp does not retain a runtime `process` reference.
 */
const rawCosBucket = process.env.TARO_APP_COS_BUCKET || '';
const rawCosRegion = process.env.TARO_APP_COS_REGION || '';
const rawCosPublicBase = process.env.TARO_APP_COS_PUBLIC_BASE_URL || '';

/** Tencent COS bucket (Taro: `TARO_APP_COS_BUCKET`, align with backend `COS_BUCKET`). */
export const COS_BUCKET = rawCosBucket.trim() || DEFAULT_COS_BUCKET;

/** COS region (Taro: `TARO_APP_COS_REGION`, align with backend `COS_REGION`). */
export const COS_REGION = rawCosRegion.trim() || DEFAULT_COS_REGION;

/** Post image object key prefix — must stay under STS `uploads/posts/*` policy. */
export const COS_POSTS_UPLOAD_PREFIX = 'uploads/posts';

/** Public HTTPS base for objects in this bucket/region. */
export const COS_PUBLIC_BASE_URL = (
  rawCosPublicBase.trim() || `https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com`
).replace(/\/$/, '');
