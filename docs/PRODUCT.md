# SYNC 小程序 · 产品功能说明

> 与代码实现对齐的**当前功能**文档。用户故事与排期见 [Q1-USER-STORIES.md](./Q1-USER-STORIES.md)；REST/WS 契约见 [API.md](./API.md)。

**最后更新**：2026-06-21

## 产品定位

| 项 | 说明 |
|----|------|
| **一句话** | 免费电音节资讯 + 观演准备工具 + 用户自发结伴信息展示 |
| **品牌副标题** | 发现电音节 · 找同好结伴 |
| **合规边界** | 不收费、不卖票、不撮合交易、不提供站内联系/私信（见 `src/legal/`、`constants/platformDisclaimer.ts`） |
| **主体资质** | OPC · ICP 备案（非经营性） |

## 信息架构

### 主包 Tab（4 个）

| Tab | 路由 | 文案 | 职责 |
|-----|------|------|------|
| 首页 | `pages/index/index` | 首页 | 精选活动、我的下一场、倒计时、快捷入口 |
| 准备 | `pages/ai/index` | 准备 | AI 对话 + Festival Plan + 攻略/行程/组队能力 Sheet |
| 活动 | `pages/events/index` | 活动 | 活动列表 / 日历 / 艺人目录 |
| 我的 | `pages/profile/index` | 我的 | 资料、已选活动、帖子、设置 |

底栏为自定义 TabBar（`components/navigation/BottomNav`）。`packageAi/pages/ai-assistant` 为遗留深链，重定向至准备 Tab。

### 分包页面

| 分包 | 页面 | 说明 |
|------|------|------|
| `packageEvent` | `event-detail` | 活动详情：阵容、组队帖流、出行攻略卡片、Festival Plan |
| | `exclusive-itinerary` | 专属时间表：DJ 筛选、冲突检测、生成行程 |
| | `my-itinerary` | 已生成行程查看 |
| | `personality-test` | Raver 人格测试（Soul DJ） |
| | `ai-travel-guide` | 出行攻略详情 |
| `packageProfile` | `profile-activities` | 已选活动列表 |
| | `profile-posts` | 我的组队帖 |
| | `settings` | 设置、隐私、帮助反馈、账号注销指引 |
| | `legal-document` | 用户协议 / 隐私政策 |
| | `notifications` | 站内通知 |

Wi‑Fi 下 `preloadRule` 预加载 `event` / `profile` 分包（见 `app.config.ts`）。

## 核心闭环：Festival Plan

用户选择活动后，产品引导完成三项**个人准备记录**（非平台承诺）：

| 任务 key | 用户价值 | 完成判定 | 入口 |
|----------|----------|----------|------|
| `travel_guide` | AI 出行攻略（出发地、人数、预算等） | 已生成攻略 | 准备 Tab Sheet / AI 对话 |
| `itinerary` | 专属 DJ 时间表 | 已选 DJ 并生成行程 | `exclusive-itinerary` |
| `buddy_post` | 公开组队帖 | 已发帖 | 活动详情 / 准备 Tab Sheet |

进度在以下位置**统一展示**（`domains/festival-plan/`）：

- 首页 `HomeMyNextEvent`（`2/3` + 下一项 CTA）
- 活动详情 `FestivalPlanSummaryBar`
- 准备 Tab `AiTabContextCard` 内嵌进度条

数据：`GET festival-plan-progress` + 本地 chat / 攻略缓存合并（`useFestivalPlanSummary`）。

## 按 Tab 功能

### 首页

- **我的下一场**：已登录且已选活动时展示；含 Festival Plan 进度、组队帖新回复深链（`postId` + `openComments`）
- **精选活动轮播** + 倒计时卡片
- **快捷入口**：浏览活动、人格测试、打开准备 Tab
- **社会证明**：`近 N 人已选择近期活动`（`home.summary.heat`）
- **新用户引导**：首次登录轻量 Sheet（选活动 → 生成攻略 → 发帖，可跳过）
- **平台免责声明**：底部固定 `PlatformDisclaimer`

### 准备（原 AI Tab）

- 绑定活动上下文卡片；未绑定时引导选活动
- WebSocket AI 对话（`useAiChatStream`）
- 能力 Sheet：**出行攻略**、**专属时间表**、**组队帖**（可从攻略预填）
- 快捷操作：阵容、时间表入口（`AiQuickActions`）
- 按用户性别切换主题色（`s-ai-assistant--female/male`）

### 活动

三个子 Tab（`EventsViewTabs`）：

| 子 Tab | 说明 |
|--------|------|
| **列表** | 全部未结束活动，按日期排序 |
| **日历** | 月历 + 选中日活动列表 |
| **艺人** | 全站阵容艺人目录（`useCatalogLineupArtists`） |

> **地图**：`EventsActivityMapTab` 与 `useEventsActivityMap` 已实现，但**尚未挂载**到活动 Tab UI；`app.config.ts` 仍声明 `getLocation` 权限供未来启用。勿在对外文档中写「活动页含地图 Tab」。

### 我的

- 登录 / 游客态
- 已选活动、组队帖入口
- 设置：隐私（`public` / `private`）、通知偏好、帮助反馈、法律文档、账号注销指引
- 账号风险横幅（发帖受限时）

## 活动详情

- 进入详情或绑定活动 → 静默 `POST /activities/:legacyId/register`（无独立「报名」按钮）
- 阵容、活动信息、合规免责声明
- **出行攻略卡片**：未生成显示「生成」；已生成显示「查看」（本地 + 服务端持久化）
- **组队帖流**：出发城市 chip 筛选、关键词搜索（含日期）；AI 搜索失败降级本地过滤
- 发帖成功合规提示；禁止帖内联系方式（UGC 审核）
- `schedulePublished === false` 时：阵容空状态 + 微信订阅「活动更新」（模板 #624）

## 专属时间表（`exclusive-itinerary`）

- 按舞台、曲风（House / Techno / Trance 等）、风格搜索筛选 DJ
- 多选 DJ、时间冲突提示、排序
- 阵容未官宣时展示 `ExclusiveItineraryUnpublishedBanner`
- 筛选逻辑：`exclusiveItineraryFilters.ts`

## 人格测试

- 问卷 → Soul DJ 类型结果 → 可生成分享海报（Canvas）
- 好友分享落地页展示 teaser（`shareTeaser`）
- **待优化**：微信分享卡片文案/配图（US-Q1-16）

## 微信能力

| 能力 | 用途 |
|------|------|
| 订阅消息 | 活动更新 #624、评论回复（见 `WECHAT-E2E.md`） |
| `wx.cloud.callContainer` | 生产环境 REST |
| `wx.cloud.connectContainer` | 生产环境 AI WebSocket |
| DarkMode | `darkmode: true` + `theme.json` |
| 定位 | 预留活动地图（未上线 Tab） |

## 工程特性（影响体验）

- 活动详情种子缓存 + 分包预加载（`activityDetailCache`、`preloadHotRoutes`）
- AI 请求超时 60s（攻略/行程生成）
- 主包仅 4 Tab，重组件在分包（见 [BUNDLE-SIZE.md](./BUNDLE-SIZE.md)）
- 中英文 i18n（`src/i18n/`，默认 zh-CN）

## 已知缺口（产品待办）

与 [Q1-USER-STORIES.md](./Q1-USER-STORIES.md) 一致：

| ID | 功能 | 状态 |
|----|------|------|
| US-Q1-04 | 活动信息来源标注 | 未开始 |
| US-Q1-05 | 官方购票外链 | 暂缓 |
| US-Q1-16 | 人格测试分享卡片优化 | 未开始 |
| — | 活动 Tab 地图视图上线 | 代码已有，UI 未接入 |

## 代码索引

| 领域 | 路径 |
|------|------|
| Festival Plan | `src/domains/festival-plan/` |
| 出行攻略 | `src/domains/travel-guide/` |
| 组队帖 | `src/domains/partner-feed/` |
| 人格测试 | `src/domains/personality-test/` |
| 活动绑定 | `src/domains/activity-scope/` |
| 路由 | `src/utils/route.ts` |
| 静默选活动 | `src/utils/registerActivityOnSelect.ts` |
| 页面配置 | `src/app.config.ts` |
