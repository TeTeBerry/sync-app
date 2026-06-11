/** 应用配置文件：不要从这里 `import @tarojs/taro`，会连带加载运行时并在构建阶段触发浏览器 API */
export default {
  /** 微信 DarkMode：window / tabBar / 页面背景随系统深浅色切换 */
  darkmode: true,
  themeLocation: 'theme.json',
  requiredPrivateInfos: ['getLocation'] as const,
  /** 微信「代码质量」要求开启按需注入，见开发者工具 → 代码质量 → 组件 */
  lazyCodeLoading: 'requiredComponents',
  /** 主包：仅 3 个 Tab，缩小首包体积 */
  pages: ['pages/index/index', 'pages/events/index', 'pages/profile/index'],
  subPackages: [
    {
      root: 'packageEvent',
      name: 'event',
      pages: [
        'pages/event-detail/index',
        'pages/exclusive-itinerary/index',
        'pages/my-itinerary/index',
      ],
    },
    {
      root: 'packageProfile',
      name: 'profile',
      pages: [
        'pages/profile-activities/index',
        'pages/profile-benefits/index',
        'pages/profile-posts/index',
        'pages/settings/index',
        'pages/legal-document/index',
        'pages/notifications/index',
      ],
    },
    {
      root: 'packageAi',
      name: 'ai',
      pages: ['pages/ai-assistant/index'],
    },
  ],
  tabBar: {
    custom: true,
    color: '@tabFontColor',
    selectedColor: '@tabSelectedColor',
    backgroundColor: '@tabBgColor',
    borderStyle: '@tabBorderStyle',
    list: [
      { pagePath: 'pages/index/index', text: '首页' },
      { pagePath: 'pages/events/index', text: '活动' },
      { pagePath: 'pages/profile/index', text: '我的' },
    ],
  },
  window: {
    navigationStyle: 'custom',
    backgroundTextStyle: '@bgTxtStyle',
    backgroundColor: '@bgColor',
    backgroundColorTop: '@bgColorTop',
    backgroundColorBottom: '@bgColorBottom',
  },
  /** LLM itinerary generation can exceed the default 10s request limit. */
  networkTimeout: {
    request: 60000,
    connectSocket: 60000,
    uploadFile: 60000,
    downloadFile: 60000,
  },
  permission: {
    'scope.userLocation': {
      desc: '你的位置信息将用于活动地图定位',
    },
    'scope.writePhotosAlbum': {
      desc: '保存行程屏保图片到你的相册',
    },
  },
  /** Wi‑Fi only: avoid competing with home API on cellular; AI 分包在首次进入助手时再加载 */
  preloadRule: {
    'pages/index/index': {
      network: 'wifi',
      packages: ['event'],
    },
    'pages/events/index': {
      network: 'wifi',
      packages: ['event'],
    },
    'pages/profile/index': {
      network: 'wifi',
      packages: ['profile'],
    },
  },
};
