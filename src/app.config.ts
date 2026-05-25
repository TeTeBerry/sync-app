/** 应用配置文件：不要从这里 `import @tarojs/taro`，会连带加载运行时并在构建阶段触发浏览器 API */

export default {
  pages: [
    "pages/index/index",
    "pages/events/index",
    "pages/explore/index",
    "pages/profile/index",
    "pages/settings/index",
    "pages/chat/index",
    "pages/pindan/index",
    "pages/aimatch/index",
    "pages/tickets/index",
    "pages/notifications/index",
  ],
  window: {
    navigationStyle: "custom",
    backgroundTextStyle: "light",
    backgroundColor: "#0f0f0f",
  },
};
