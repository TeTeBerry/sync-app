/** 应用配置文件：不要从这里 `import @tarojs/taro`，会连带加载运行时并在构建阶段触发浏览器 API */

export default {
  pages: [
    "pages/index/index",
    "pages/events/index",
    "pages/profile/index",
    "pages/settings/index",
    "pages/ai-assistant/index",
    "pages/event-detail/index",
    "pages/notifications/index",
    "pages/posts/index",
  ],
  window: {
    navigationStyle: "custom",
    backgroundTextStyle: "light",
    backgroundColor: "#000000",
  },
};
