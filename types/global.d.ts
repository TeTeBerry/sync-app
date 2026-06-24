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
    /** 腾讯位置服务 key（地图组件等） */
    TARO_APP_QQ_MAP_KEY?: string;
    TARO_APP_QQ_MAP_LAYER_STYLE?: string;
    /** CloudBase env id for wx.cloud storage upload */
    TARO_APP_CLOUDBASE_ENV_ID?: string;
    /** CloudBase 云托管服务名；本地留空，生产见 `.env.production` */
    TARO_APP_CLOUD_RUN_SERVICE?: string;
    /** 微信订阅消息：组队帖评论提醒模板 ID */
    TARO_APP_SUBSCRIBE_TMPL_COMMENT?: string;
    /** 微信订阅消息：评论回复提醒模板 ID（可与评论共用） */
    TARO_APP_SUBSCRIBE_TMPL_COMMENT_REPLY?: string;
    /** 微信订阅消息：活动阵容/时间表更新提醒模板 ID */
    TARO_APP_SUBSCRIBE_TMPL_ACTIVITY_UPDATE?: string;
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
