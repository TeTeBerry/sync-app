/** Taro injects `process.env.TARO_*` at compile time; avoid `typeof process` guards. */
const rawBase =
  process.env.TARO_APP_API_BASE_URL ||
  (process.env.TARO_ENV === "h5" ? "/api" : "");

/** REST API root, e.g. `https://api.example.com` (weapp) or `/api` (unmaintained H5 dev). */
export const API_BASE_URL = rawBase.replace(/\/$/, "");

/** SSE 流式对话；未单独配置时由 API_BASE_URL 推导 */
export const AI_CHAT_STREAM_URL =
  process.env.TARO_APP_AI_CHAT_URL ||
  (API_BASE_URL ? `${API_BASE_URL}/ai/chat` : "");

export function isApiEnabled(): boolean {
  return Boolean(API_BASE_URL);
}
