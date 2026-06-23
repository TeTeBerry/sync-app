# 微信小程序包体

主发布端：`npm run build:weapp` → `dist-weapp/`。

## 测量

```bash
npm run build:weapp:size
```

构建后按分包输出大小，超过软阈值则非零退出（见 `scripts/size-weapp.mjs`）。

## 静态检查（无需构建）

```bash
npm run verify:bundle
```

- 禁止在 `src/components/icons` 之外 `import 'lucide-react-taro'`（统一走 `@/components/icons`）
- 禁止主包 Tab 相关目录 import 地图绘制、行程壁纸、分包页面实现等重模块

已并入 `npm run check`。

## 阈值（`scripts/size-weapp.mjs`）

| 项 | 软阈值 |
|----|--------|
| 主包 | 1100 KB |
| 各分包 | 2000 KB |
| 合计（不含 .map） | 4500 KB |

上传时在 `project.config.json` → `packOptions.ignore` 排除 `*.map`。

## 微信「代码质量」扫描

| 项 | 要求 | 本项目 |
|----|------|--------|
| 组件按需注入 | `lazyCodeLoading: "requiredComponents"` | `src/app.config.ts` |
| 主包图片+音频 | ≤ 200 KB | `npm run size:weapp` 会校验 |

若扫描仍报主包图片超限，多为 **`dist-weapp/assets` 旧构建残留**（历史本地图未再引用）。处理：`npm run clean:weapp && npm run build:weapp` 后在开发者工具点「重新扫描」。

## 治理约定

| 主题 | 约定 |
|------|------|
| 图标 | 仅从 `@/components/icons` 引入；新增图标时在 `components/icons/index.ts` 登记 |
| Canvas | 壁纸/攻略用 `@/utils/offscreenCanvas`；活动地图用 `pages/events/components/EventsActivityMapTab` + `hooks/useEventsActivityMap`（**已实现但未接入活动 Tab**，勿被主包误引） |
| 分包 | 独家行程 / 我的行程 / 活动详情等放在 `packageEvent/pages/*`，勿被主包 `pages/*` 直接 import |
| 活动图资源 | `packageEvent/assets/`（如 storm-logo），勿打进主包 `assets/` |

`config/index.ts` 已开启 `usedExports` + `sideEffects` 以利于 tree-shaking。

## CI

`sync-app/.github/workflows/ci.yml`：`check` job 后执行 `npm run build:weapp:size`。

## 基线

| 日期 | 主包 | packageEvent | packageAi | packageProfile | 主包 assets |
|------|------|--------------|-----------|----------------|-------------|
| 2026-06-01 P0 CI | ~971 KB | ~167 KB | ~71 KB | ~40 KB | ~389 KB |
| 2026-06-01 包体优化后参考 | ~582 KB | ~267 KB | ~73 KB | ~41 KB | 0 |

PR 若主包上涨 >50 KB，请在 PR 说明原因并更新上表（可选）。

## 活动详情首屏与弱网请求

常量见 [`src/utils/timing.ts`](../src/utils/timing.ts)，路由编排见 [`useEventDetailRoute.ts`](../src/packageEvent/pages/event-detail/useEventDetailRoute.ts)。

| 阶段 | 延迟（约） | 网络请求 / 行为 |
|------|-----------|-----------------|
| 首屏 | 0ms | `GET /activities/:legacyId`（可命中首页/活动列表 seed 缓存） |
| `secondaryReady` | +120ms | `GET /users/me`（账号风控状态 / 头像） |
| `aiWarmReady` | +400ms | 空闲预加载 AI 分包（`warmAiAssistant`，非 REST） |
| 组队帖列表 | 首屏后 | `GET /posts?activityLegacyId=`（`useEventPostsInfiniteQuery`，窗口化渲染） |

约定：

- 勿在 `useEventDetailBuddyPost` / `useEventDetailTravelGuide` 内重复 `useActivityDetailQuery`；活动元数据由 `useEventDetailPage` 注入。

## 离线观演资料（产品 · US-ARCH-19）

> 代码包预下载见 `app.config.ts` `preloadRule`；以下为 **业务数据** 离线策略。

| 场景 | 策略 |
|------|------|
| 阵容 / 演出时间表 / 专属行程 | **P0 持久化**（按 `activityLegacyId` 资料包） |
| 活动资讯、已生成攻略 | **P1 持久化**（资讯可并入资料包；攻略已有 `travelGuideDetailStorage`） |
| 首页 / 活动 catalog | 现网 `homeCacheStorage` 24h |
| 公开招募帖 / 评论 | **不持久化**（内存 `staleTime` 仅弱网减请求）；无网时招募区提示需联网 |
| 发帖 / 评论 / AI 找队 | 必须在线 |

现场弱网验收（规划）：Wi‑Fi 打开 `activity-lineup` → 飞行模式 → 仍可查看已缓存阵容/时间表。
