/**
 * Taro 在编译期通过 DefinePlugin 注入 process.env.TARO_*。
 * 不要写 typeof process 判断——H5 浏览器里 process 常不存在，会导致 API 永远未启用。
 */
const rawBase =
  process.env.TARO_APP_API_BASE_URL ||
  (process.env.TARO_ENV === "h5" ? "/api" : "");

/** REST API 根路径，如 `http://localhost:3000/api` 或 H5 开发态 `/api` */
export const API_BASE_URL = rawBase.replace(/\/$/, "");

/** SSE 流式对话；未单独配置时由 API_BASE_URL 推导 */
export const AI_CHAT_STREAM_URL =
  process.env.TARO_APP_AI_CHAT_URL ||
  (API_BASE_URL ? `${API_BASE_URL}/ai/chat` : "");

export function isApiEnabled(): boolean {
  return Boolean(API_BASE_URL);
}
