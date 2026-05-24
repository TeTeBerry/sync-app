/** Set via `.env` → `TARO_APP_AI_CHAT_URL=https://api.example.com/ai/chat` */
export const AI_CHAT_STREAM_URL =
  typeof process !== "undefined" && process.env.TARO_APP_AI_CHAT_URL
    ? process.env.TARO_APP_AI_CHAT_URL
    : "";
