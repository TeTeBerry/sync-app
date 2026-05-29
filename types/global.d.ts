/// <reference types="@tarojs/taro/types" />

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare namespace NodeJS {
  interface ProcessEnv {
    TARO_APP_API_BASE_URL?: string;
    /** Full WebSocket URL; defaults to ws(s) derived from API_BASE_URL + /ai/chat/ws */
    TARO_APP_WS_URL?: string;
    TARO_APP_AI_CHAT_WS_URL?: string;
    TARO_ENV?:
      | "weapp"
      | "swan"
      | "alipay"
      | "h5"
      | "rn"
      | "tt"
      | "quickapp"
      | "qq"
      | "jd";
  }
}
