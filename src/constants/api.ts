/** Taro injects `process.env.TARO_*` at compile time; avoid `typeof process` guards. */
const rawBase =
  process.env.TARO_APP_API_BASE_URL || (process.env.TARO_ENV === 'h5' ? '/api' : '');

/** REST API root, e.g. `https://api.example.com` (weapp) or `/api` (unmaintained H5 dev). */
export const API_BASE_URL = rawBase.replace(/\/$/, '');

export function isApiEnabled(): boolean {
  return Boolean(API_BASE_URL);
}

/** Whether list/profile/chat hooks should fetch from the backend. */
export function isLiveApi(): boolean {
  return isApiEnabled();
}
