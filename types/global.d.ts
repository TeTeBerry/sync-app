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
    /** CloudBase env id for wx.cloud storage upload */
    TARO_APP_CLOUDBASE_ENV_ID?: string;
    /** CloudBase 云托管服务名；本地留空，生产见 `.env.production` */
    TARO_APP_CLOUD_RUN_SERVICE?: string;
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
