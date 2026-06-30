/** 应用配置文件：不要从这里 `import @tarojs/taro`，会连带加载运行时并在构建阶段触发浏览器 API */

/** P3 微信 AI SKILL 分包：仅在 AI 构建时启用（WECHAT_AI_SKILLS=1）。 */
const wechatAiSkills = process.env.WECHAT_AI_SKILLS === '1';

/**
 * 生产包开启按需注入；微信 AI 开发模式也要求 lazyCodeLoading（见官方接入文档）。
 * 非 AI 的 dev 构建仍关闭，避免 custom tabBar + comp 竞态黑屏。
 */
const lazyCodeLoading =
  wechatAiSkills || process.env.NODE_ENV === 'production'
    ? ('requiredComponents' as const)
    : undefined;

const agentSkillsSubPackage = wechatAiSkills
  ? [
      {
        root: 'packageAgentSkills',
        name: 'agentSkills',
        independent: true,
        pages: ['pages/placeholder/index'],
      },
    ]
  : [];

const agentConfig = wechatAiSkills
  ? {
      agent: {
        instruction: 'docs/wechat-ai/AGENTS.md',
        pageMetadata: 'docs/wechat-ai/page-meta.json',
        skills: [
          {
            name: 'festival-search',
            description: '查询电音节资讯、阵容与活动详情（免费信息检索，非票务）',
            path: 'packageAgentSkills/festival-search-skill',
          },
          {
            name: 'recruit-discovery',
            description: '检索某场活动的公开组队招募帖（非配对撮合）',
            path: 'packageAgentSkills/recruit-discovery-skill',
          },
          {
            name: 'recruit-draft',
            description: '生成招募帖草稿，须进入小程序确认后发布（非自动发帖）',
            path: 'packageAgentSkills/recruit-draft-skill',
          },
          {
            name: 'festival-prep',
            description: '订阅阵容更新、生成出行攻略（AI 内容仅供参考）',
            path: 'packageAgentSkills/festival-prep-skill',
          },
        ],
      },
    }
  : {};

export default {
  /** 微信 DarkMode：window / tabBar / 页面背景随系统深浅色切换 */
  darkmode: true,
  themeLocation: 'theme.json',
  /** 主包：3 个 Tab */
  pages: ['pages/index/index', 'pages/events/index', 'pages/profile/index'],
  subPackages: [
    {
      root: 'packageEvent',
      name: 'event',
      pages: [
        'pages/event-detail/index',
        'pages/exclusive-itinerary/index',
        'pages/activity-lineup/index',
        'pages/my-itinerary/index',
        'pages/personality-test/index',
        'pages/set-vote/index',
        'pages/ai-travel-guide/index',
      ],
    },
    {
      root: 'packageProfile',
      name: 'profile',
      pages: [
        'pages/profile-activities/index',
        'pages/profile-posts/index',
        'pages/settings/index',
        'pages/legal-document/index',
        'pages/plur-film-webview/index',
        'pages/notifications/index',
      ],
    },
    {
      root: 'packageAi',
      name: 'ai',
      pages: ['pages/ai-assistant/index'],
    },
    ...agentSkillsSubPackage,
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
  },
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
  ...(lazyCodeLoading ? { lazyCodeLoading } : {}),
  ...agentConfig,
};
