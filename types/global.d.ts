/// <reference types="@tarojs/taro/types" />

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

declare namespace NodeJS {
  interface ProcessEnv {
    TARO_APP_API_BASE_URL?: string;
    TARO_APP_AI_CHAT_URL?: string;
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
