/// <reference types="@tarojs/taro/types" />

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare namespace NodeJS {
  interface ProcessEnv {
    TARO_APP_API_BASE_URL?: string;
    /** Full WebSocket URL; defaults to ws(s) derived from API_BASE_URL + /ai/chat/ws */
    TARO_APP_WS_URL?: string;
    TARO_APP_AI_CHAT_WS_URL?: string;
    /** 腾讯位置服务 key（地图组件等） */
    TARO_APP_QQ_MAP_KEY?: string;
    TARO_APP_QQ_MAP_LAYER_STYLE?: string;
    /** 为 true 时展示个人页「我的权益」及相关入口；默认不展示 */
    TARO_APP_ENABLE_PROFILE_BENEFITS?: string;
    /** Tencent COS — align with backend COS_BUCKET / COS_REGION */
    TARO_APP_COS_BUCKET?: string;
    TARO_APP_COS_REGION?: string;
    /** Optional CDN origin; align with backend COS_PUBLIC_BASE_URL */
    TARO_APP_COS_PUBLIC_BASE_URL?: string;
    TARO_ENV?:
      | 'weapp'
      | 'swan'
      | 'alipay'
      | 'h5'
      | 'rn'
      | 'tt'
      | 'quickapp'
      | 'qq'
      | 'jd';
  }
}
