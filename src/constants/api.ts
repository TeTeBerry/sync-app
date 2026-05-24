const rawBase =
  typeof process !== "undefined" && process.env.TARO_APP_API_BASE_URL
    ? process.env.TARO_APP_API_BASE_URL
    : typeof process !== "undefined" && process.env.TARO_ENV === "h5"
      ? "/api"
      : "";

/** REST API 根路径，如 `http://localhost:3000/api` 或 H5 开发态 `/api` */
export const API_BASE_URL = rawBase.replace(/\/$/, "");

/** SSE 流式对话；未单独配置时由 API_BASE_URL 推导 */
export const AI_CHAT_STREAM_URL =
  typeof process !== "undefined" && process.env.TARO_APP_AI_CHAT_URL
    ? process.env.TARO_APP_AI_CHAT_URL
    : API_BASE_URL
      ? `${API_BASE_URL}/ai/chat`
      : "";

export function isApiEnabled(): boolean {
  return Boolean(API_BASE_URL);
}
