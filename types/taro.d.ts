import "@tarojs/taro";

declare module "@tarojs/taro" {
  interface TaroStatic {
    /** WeChat mini program page preload (optional at runtime). */
    preloadPage?: (options: { url: string }) => Promise<void>;
  }
}

declare module "@tarojs/cli" {
  interface IMiniAppConfig<T = string> {
    outputRoot?: string;
  }

  interface IH5Config<T = string> {
    outputRoot?: string;
  }
}
