/** 应用配置文件：不要从这里 `import @tarojs/taro`，会连带加载运行时并在构建阶段触发浏览器 API */

export default {
  /** 主包：仅 3 个 Tab，缩小首包体积 */
  pages: ["pages/index/index", "pages/events/index", "pages/profile/index"],
  subPackages: [
    {
      root: "packageEvent",
      name: "event",
      pages: [
        "pages/event-detail/index",
        "pages/event-map/index",
        "pages/posts/index",
      ],
    },
    {
      root: "packageProfile",
      name: "profile",
      pages: [
        "pages/profile-activities/index",
        "pages/profile-posts/index",
        "pages/settings/index",
        "pages/notifications/index",
      ],
    },
    {
      root: "packageAi",
      name: "ai",
      pages: ["pages/ai-assistant/index"],
    },
  ],
  tabBar: {
    custom: true,
    color: "#888888",
    selectedColor: "#ffffff",
    backgroundColor: "#000000",
    borderStyle: "black",
    list: [
      { pagePath: "pages/index/index", text: "首页" },
      { pagePath: "pages/events/index", text: "活动" },
      { pagePath: "pages/profile/index", text: "我的" },
    ],
  },
  window: {
    navigationStyle: "custom",
    backgroundTextStyle: "light",
    backgroundColor: "#000000",
  },
};
