# 架构重构 User Stories（前后端 · 逐步交付）

> **目标**：在不影响 Q2 产品交付的前提下，降低前后端类型漂移、大文件维护成本与模块耦合。  
> **范围**：`sync-app`（Taro 小程序/H5）+ `sync-app-backend`（NestJS 单体）  
> **策略**：**小步 PR、每 Story 可独立验收**；与 [Q2-USER-STORIES.md](./Q2-USER-STORIES.md) 并行，不挡提审。  
> **关联文档**：[COMPONENT-ARCHITECTURE.md](./COMPONENT-ARCHITECTURE.md) · [DATA-LAYER.md](./DATA-LAYER.md) · [FRONTEND-REFACTOR-CHECKLIST.md](./FRONTEND-REFACTOR-CHECKLIST.md) · `sync-app-backend/docs/ARCHITECTURE.md`

**Story 格式**：`US-ARCH-xx` · 优先级 P0/P1/P2/P3 · 体量 XS/S/M/L · 依赖 · **状态**（✅ / 🚧 / ⏸ / 🔲 / ❌）

**状态图例**：✅ 已完成 · 🚧 进行中 · ⏸ 阻塞/待决策 · 🔲 未开始 · ❌ 已取消 / 暂不排

**体量图例**：XS ≤ 0.5 天 · S = 1 天 · M = 2～3 天 · L = 4～5 天 · XL ≥ 1 周

**域标签**：`[FE]` 前端 · `[BE]` 后端 · `[FULL]` 跨端

---

## 推荐执行顺序（总表）

> 按 **投入产出比** 排序；有依赖的 Story 在详情里注明。可与 Q2 功能开发穿插，建议 **每周至少收口 1 个 P0**。

| 序 | ID | 标题 | 优先级 | 体量 | 域 | 状态 |
|----|-----|------|--------|------|-----|------|
| 1 | US-ARCH-01 | 共享契约：`travel-guide` | P0 | M | FULL | ✅ |
| 2 | US-ARCH-02 | 共享契约：`partner`（posts / comments） | P0 | M | FULL | ✅ |
| 3 | US-ARCH-03 | 迁移脚本移出 `onModuleInit` | P0 | S | BE | ✅ |
| 4 | US-ARCH-04 | `domains/` barrel 补齐 + 主包 import 规范 | P0 | S | FE | ✅ |
| 5 | US-ARCH-05 | 缓存分层职责文档 + 去双写 | P0 | S | FE | ✅ |
| 6 | US-ARCH-19 | 观演资料包离线缓存（阵容/时间表优先） | P1 | M | FE | ✅ |
| 7 | US-ARCH-06 | 拆分 `useEventDetailPage` | P1 | M | FE | ✅ |
| 8 | US-ARCH-07 | 拆分 `itinerary-schedule.service` | P1 | M | BE | ✅ |
| 9 | US-ARCH-08 | 拆分 `travel-guide-generation.service` | P1 | M | BE | ✅ |
| 10 | US-ARCH-09 | 静态 seed / Hot Path 数据外置 | P1 | S | BE | ✅ |
| 11 | US-ARCH-10 | 打破 `ActivityModule` ↔ `ItineraryModule` 循环依赖 | P2 | M | BE | ✅ |
| 12 | US-ARCH-11 | Monorepo + `@sync/contracts` 正式包 | P2 | L | FULL | ✅ |
| 13 | US-ARCH-12 | 共享契约：`activity` + `notification` + `profile` | P2 | L | FULL | ✅ |
| 14 | US-ARCH-13 | Controller 路由风格统一 | P2 | S | BE | ✅ |
| 15 | US-ARCH-14 | AI 模块 port 化（对齐 Partner 模式） | P2 | L | BE | ✅ |
| 16 | US-ARCH-15 | 评估 TanStack Query 迁移 | P3 | M | FE | ✅ |
| 17 | US-ARCH-16 | OpenAPI / JSON Schema | P3 | M | BE | ✅ |
| 18 | US-ARCH-17 | E2E / Smoke 黄金路径进 CI | P3 | M | FULL | ✅ |
| 19 | US-ARCH-18 | AI 可观测性（结构化 trace + APM） | P3 | M | BE | ⏸ |

### Q2 并行时的最小路径

若当前冲刺以 **活动详情 + 攻略 + 组队** 为主，建议顺序：

**必做**：01 → 06 → 08 → 05  
**弱网 / 现场体验**（阵容 · 时间表 · 专属行程）：**05 → 19**（与 Q2 提审不挡，建议 Sprint 6）  
**可延后**：11（monorepo）、15（TanStack Query）、18（APM）

### 完成进度总览

| ID | 标题 | 优先级 | 状态 |
|----|------|--------|------|
| US-ARCH-01 | 共享契约：travel-guide | P0 | ✅ |
| US-ARCH-02 | 共享契约：partner | P0 | ✅ |
| US-ARCH-03 | 迁移移出 onModuleInit | P0 | ✅ |
| US-ARCH-04 | domains barrel | P0 | ✅ |
| US-ARCH-05 | 缓存分层 + 去双写 | P0 | ✅ |
| US-ARCH-19 | 观演资料包离线缓存 | P1 | ✅ |
| US-ARCH-06 | 拆分 useEventDetailPage | P1 | ✅ |
| US-ARCH-07 | 拆分 itinerary-schedule | P1 | ✅ |
| US-ARCH-08 | 拆分 travel-guide-generation | P1 | ✅ |
| US-ARCH-09 | 静态数据外置 | P1 | ✅ |
| US-ARCH-10 | 打破 Activity↔Itinerary 循环 | P2 | ✅ |
| US-ARCH-11 | Monorepo contracts 包 | P2 | ✅ |
| US-ARCH-12 | 契约扩展 activity/notification | P2 | ✅ |
| US-ARCH-13 | 路由风格统一 | P2 | ✅ |
| US-ARCH-14 | AI port 化 | P2 | ✅ |
| US-ARCH-15 | TanStack Query 评估 | P3 | ✅ |
| US-ARCH-16 | OpenAPI | P3 | ✅ |
| US-ARCH-17 | E2E Smoke CI | P3 | ✅ |
| US-ARCH-18 | AI 可观测性 | P3 | ⏸ |

**通用验收（每条 Story）**

- [ ] `npm run check` 通过（前后端各自仓库）
- [ ] 无行为回归（相关单测 / 冒烟通过）
- [ ] 文档或 contract test 已更新（若改契约）
- [ ] PR 说明含「为何拆 / 边界在哪」

---

## Epic A · 共享契约与类型安全（P0）

> 对齐现有 `@sync/chat-contracts` / `itinerary-contracts` 模式。真源在 `sync-app-backend/src/shared/`；前端 `types/*.ts` 仅 re-export。

### US-ARCH-01 · 共享契约：`travel-guide` P0 · M · FULL · ✅

**Story**  
作为全栈开发，我希望出行攻略的 DTO 只有一份真源，以便改攻略字段时前后端不会 silent break。

**背景**  
攻略类型目前分散在 `sync-app/src/types/travelGuide.ts`（手写）与后端 `travel-guide/domain/travel-guide.types.ts`，是 Q2 高频改动域（预算对比、Hot Path、异步生成）。

**验收标准**

- [ ] 后端新增 `src/shared/travel-guide/`（`types.ts` + `index.ts`），导出：
  - `TravelGuidePlan`、`GenerateTravelGuidePayload`、`GenerateTravelGuideResult`
  - `TravelGuideBudgetTier`、酒店/交通/预算相关子类型
- [ ] 后端 module 内改为 `import from '@src/shared/travel-guide'`（或相对路径，与现有 shared 一致）
- [ ] 前端 `types/travelGuide.ts` 改为 **仅 re-export** `@sync/travel-guide-contracts`
- [ ] `tsconfig` / `config/index.ts` / `vitest.config.ts` 增加 `@sync/travel-guide-contracts` alias
- [ ] `test/contract/travel-guide-frontend-reexports.contract.spec.ts`：断言前端无手写 `export interface TravelGuidePlan`
- [ ] `npm run check` 双端通过

**技术提示**

- 参考：`shared/travel-plan/`、`test/contract/travel-plan-frontend-reexports.contract.spec.ts`
- 前端消费方：`api/sync/travelGuide.ts`、`domains/travel-guide/`、`components/ai-chat/AiGuidePlanSheet.tsx`
- 后端消费方：`travel-guide-generation.service.ts`、`travel-guide.controller.ts`

**建议 PR 切分**

1. PR-A：backend `shared/travel-guide` + 后端引用替换  
2. PR-B：frontend alias + re-export + contract test

**依赖**：无

---

### US-ARCH-02 · 共享契约：`partner`（posts / comments） P0 · M · FULL · ✅

**Story**  
作为全栈开发，我希望组队招募帖与评论的 API 类型共享一份契约，以便 US-Q2 招募字段扩展时不重复改两处。

**背景**  
`types/backend.ts` 内含 `EventDetailPost`、`CreatePostPayload`、`PostCommentItem`、`BuddyPostSearchParsed` 等 10+ 类型，与 `modules/partner/` 易漂移。

**验收标准**

- [ ] 后端新增 `src/shared/partner/`（或 `posts/`），导出帖子/评论/AI 搜索相关 DTO
- [ ] 前端新增 `types/partner.ts`（或 `posts.ts`）仅 re-export；`types/backend.ts` 改为 `export type { … } from './partner'`
- [ ] contract test：前端不得手写 `export interface EventDetailPost`
- [ ] 现有 `test/unit/modules/partner/*` 与前端 `eventPostNormalize` 单测仍绿

**技术提示**

- 参考：`modules/partner/README.md`、`domains/partner-feed/utils/eventPostNormalize.ts`
- 可与 US-ARCH-01 并行（不同人），但合并前注意 alias 命名一致

**依赖**：无（与 ARCH-01 可并行）

---

## Epic B · 稳定性与运维（P0）

### US-ARCH-03 · 迁移脚本移出 `PostService.onModuleInit` P0 · S · BE · ✅

**Story**  
作为后端运维，我希望 DB 迁移不在应用启动时自动执行，以便多实例部署安全、启动可预期。

**背景**  
`PostService.onModuleInit` 当前执行 legacy status 迁移、counter 清理、collection purge 等（见 `post.service.ts`）。

**验收标准**

- [ ] 迁移逻辑迁至 `scripts/migrate-partner-legacy.mjs`（或 `src/database/migrations/` + runner）
- [ ] `PostService.onModuleInit` 仅保留必要 cache warm（若有）或删除
- [ ] `package.json` 增加 `db:migrate-partner` 脚本；`README` / `ARCHITECTURE.md` 注明部署前执行一次
- [ ] 单测 mock `onModuleInit` 不再触发 DB 写
- [ ] 本地 `npm run dev` 行为不变（迁移脚本可选 `--dry-run`）

**技术提示**

- 参考：现有 `scripts/reset-test-data.mjs`、`db:clean-dirty` 模式
- 注意：生产需文档说明「首 deploy 跑迁移」

**依赖**：无

---

## Epic C · 前端域收敛（P0～P1）

### US-ARCH-04 · `domains/` barrel 补齐 + 主包 import 规范 P0 · S · FE · ✅

**Story**  
作为前端开发，我希望每个活动域有统一 barrel 出口，以便主包/分包 import 路径一致、避免 deep import。

**背景**  
已有 barrel：`partner-feed`、`travel-guide`、`personality-test` 等。  
缺失：`festival-plan`、`lineup-artist`、`activity-share`。

**验收标准**

- [x] 新增 `domains/festival-plan/index.ts`、`domains/lineup-artist/index.ts`（按需 `activity-share`）
- [x] 主包 `pages/index/*` 改为从 barrel import（如 `@/domains/festival-plan`）
- [x] [COMPONENT-ARCHITECTURE.md](./COMPONENT-ARCHITECTURE.md) 补充：**主包只允许** domain 的 hook/util/轻量组件，禁止 wallpaper/canvas/分包页面实现
- [x] `npm run verify:bundle` 仍通过

**技术提示**

- 参考：`domains/partner-feed/index.ts`
- 主包已引 domain：`pages/index/index.tsx` → `festival-plan`、`activity-scope`

**依赖**：无

---

### US-ARCH-05 · 缓存分层职责文档 + 去双写 P0 · S · FE · ✅

**Story**  
作为前端开发，我希望服务端数据的缓存策略唯一清晰，以便不出现首页/详情各缓存一份导致 stale，且离线观演资料与组队帖分层明确。

**背景**  
并存：`useApiQuery` globalCache、`homeCacheStorage`、`activityDetailCache`、`eventPostsPageCache`、`travelGuideDetailStorage`。  
**产品决策（2026-06）**：现场弱网场景下，**阵容 / 时间表 / 专属行程** 比 **招募帖** 更值得持久化离线；详见 [DATA-LAYER.md §缓存分层](./DATA-LAYER.md#缓存分层) · **US-ARCH-19**。

**验收标准**

- [x] [DATA-LAYER.md](./DATA-LAYER.md) 增加「缓存分层」专节（四层）：
  1. **Server state（内存）** → `useApiQuery` / `useApiInfiniteQuery`（在线请求唯一来源；`staleTime` 见 `queryCache.ts`）
  2. **Prefetch seed（内存）** → `activityDetailCache`、`eventPostsPageCache`（列表/首页预热详情与帖首屏，须可 invalidate）
  3. **Persistent offline** → `homeCacheStorage`（全站 catalog 24h）、`travelGuideDetailStorage`、人格/偏好等；**`activityPerformanceBundleStorage`** 按活动观演资料包
  4. **UI / draft** → Zustand（navigation、overlay、itinerary pending）、发帖草稿等
- [x] 文档写明：**招募帖默认不持久化**（仅内存 + 短 TTL 可选）；组队区无网时降级文案
- [x] 梳理并 **去掉** 至少一处重复：例如 `homeCacheStorage` 与 `useHomeSummary` cache 双写（保留一种）
- [x] `activityDetailCache` 明确为 prefetch 层：写入后必须能 invalidate 到 `useActivityDetailQuery`
- [x] 补 1 条单测或注释说明 invalidate 路径

**技术提示**

- `src/hooks/useApiQuery.ts`、`src/utils/homeCacheStorage.ts`、`src/utils/activityDetailCache.ts`
- `src/utils/appLaunchPrefetch.ts`、`src/domains/travel-guide/utils/travelGuideDetailStorage.ts`
- 弱网分阶段请求：[BUNDLE-SIZE.md §活动详情首屏与弱网请求](./BUNDLE-SIZE.md#活动详情首屏与弱网请求)

**依赖**：无 · **后续**：US-ARCH-19 实现观演资料包

---

### US-ARCH-19 · 观演资料包离线缓存（阵容/时间表优先） P1 · M · FE · ✅

**Story**  
作为已选某场活动的用户，我希望在 **Wi‑Fi 下自动准备好本场观演资料**，在场馆弱网或无网时仍能查看 **阵容、演出时间表、我的专属行程** 与活动资讯，而不依赖实时拉取招募帖。

**产品原则**

| 原则 | 说明 |
|------|------|
| **绑活动** | 资料包按 `activityLegacyId` 存储；非全站离线 App |
| **阵容 > 组队** | 持久化优先级：**专属行程 · timetable · 阵容网格 · 活动资讯 · 攻略** > 招募帖 |
| **招募在线优先** | 招募帖/评论 **默认不写入** 长期 storage；无网时展示「需网络查看最新公开招募」或只读极短 TTL 缓存（可选 P2） |
| **新鲜度明示** | 展示「更新于 {time} · 以现场公告为准」；阵容官宣推送可触发失效 |
| **不叫「离线模式」** | 对用户文案：**「本场观演资料」** / 「已缓存本场资讯」 |

**资料包内容（按优先级）**

| 优先级 | 内容 | 来源 / 页面 | 失效 |
|--------|------|-------------|------|
| P0 | 专属行程（用户已选 set） | `exclusive-itinerary` · itinerary API | 用户改行程 · 新 timetable |
| P0 | 演出时间表（`schedulePublished`） | `activity-lineup` · schedule API | 官宣变更 · 推送 |
| P0 | 阵容艺人网格（`lineupPublished`） | `activity-lineup` · `lineupDjs` | 阵容变更 |
| P1 | 活动详情资讯区 | `event-detail` · `GET /activities/:id` | `infoUpdatedAt` 变 |
| P1 | 已生成出行攻略 | 已有 `travelGuideDetailStorage` | 重新生成 |
| P2 | 艺人 catalog 摘要 | `EventsActivityArtistsTab` | catalog 版本 bump |
| — | 招募帖首屏 | `GET /posts` | **不持久化**（或 TTL ≤30min + stale 提示） |

**验收标准 — 写入与恢复**

- [x] 新模块 `activityPerformanceBundleStorage`（或等价）：`save` / `load` / `clear(activityLegacyId)` · envelope 含 `savedAt` · `activityLegacyId`
- [x] Wi‑Fi 下（`getNetworkType` 或沿用 `preloadRule` 时机）：用户 **bind / 打开活动详情** 且阵容或行程 API 成功后 **静默写入** 资料包
- [x] 冷启动 / 无网：`load` 命中则 `activity-lineup` · `exclusive-itinerary` · 详情资讯区 **可只读展示**，不白屏
- [x] 有网：后台 `refetch` 成功后更新资料包与 `savedAt`
- [ ] 失效：阵容官宣订阅通知落地 · 用户切换活动 · 手动「刷新本场资料」（可选）

**验收标准 — UI 降级**

- [x] 无网且无资料包：阵容/行程页明确错误 + 「请连接网络后重试」
- [x] 无网有资料包：顶栏或页脚 **「本场观演资料 · 更新于 …」**；禁止暗示招募帖为最新
- [x] 活动详情招募区：无网时 **不** 展示过期帖冒充在线；文案「公开招募需联网查看」
- [x] 无「离线模式」全局开关；不挡 Q2 提审合规 grep

**验收标准 — 工程**

- [x] 单测：save/load 往返 · TTL（建议 7 天或随活动 `ended` 清理）· 超 storage 时 LRU 按活动数
- [x] 与 `useApiQuery` 集成：hydrate 时 `setCacheData` 预热对应 queryKey
- [x] [RELEASE-SMOKE.md](./RELEASE-SMOKE.md) 增 1 条：Wi‑Fi 打开阵容 → 飞行模式 → 仍可看缓存
- [x] 不新增主包 >30KB（JSON 数据走 storage，代码放 `packageEvent` 或 `utils/`）

**明确不做**

- ❌ 招募帖/评论离线发帖队列（审核须在线）
- ❌ 全站首页离线 feed
- ❌ 替代微信分包 `preloadRule`（代码包缓存仍靠平台）

**技术提示**

- 新建：`src/utils/activityPerformanceBundleStorage.ts`（或 `src/cache/activityPerformanceBundle.ts`）
- 接入：`useActivityLineupPage` · `useExclusiveItineraryPage`（或等价）· `useActivityDetailQuery` · `app.tsx` hydrate 扩展
- 参考：`homeCacheStorage.ts` · `travelGuideDetailStorage.ts` · `activityDetailCache.ts`
- 可选：`Taro.onNetworkStatusChange` 切换 offline banner

**依赖**：US-ARCH-05 ✅（文档分层）· US-Q2-36 ✅（阵容深页）· 专属行程现网 API

**排期**：**Sprint 6 / 上线后**；**不挡 07-06 提审**

---

### US-ARCH-06 · 拆分 `useEventDetailPage` P1 · M · FE · ✅

**Story**  
作为前端开发，我希望活动详情页编排 hook 保持薄壳，以便改招募墙时不碰攻略/Festival Plan 逻辑。

**背景**  
`packageEvent/pages/event-detail/useEventDetailPage.ts` 约 490 行，编排路由、帖子、攻略、Festival Plan、分享、滚动等。

**验收标准**

- [ ] 抽出子 hook（名称可微调）：
  - `useEventDetailPostsSection`（或复用 `useEventDetailPosts` + 筛选/搜索胶水）
  - `useEventDetailTravelGuideSection`（包装现有 `useEventDetailTravelGuide`）
  - `useEventDetailFestivalPlanSection`（包装 `useEventDetailFestivalPlan`）
  - `useEventDetailPrepNavigation`（阵容/行程/攻略跳转）
- [ ] `useEventDetailPage` **< 150 行**，仅组合上述 hook + sheet 开关
- [ ] `event-detail/index.tsx` 无行为变化；现有相关单测绿
- [ ] [COMPONENT-ARCHITECTURE.md](./COMPONENT-ARCHITECTURE.md) 活动详情小节更新

**技术提示**

- 已有：`useEventDetailRoute`、`useEventDetailActivityHeader`、`useEventDetailScrollPreserve`
- 域逻辑保持在 `domains/partner-feed`、`domains/travel-guide`、`domains/festival-plan`

**依赖**：US-ARCH-04（barrel 就绪后 import 更干净，非硬依赖）

---

## Epic D · 热点 Service 拆分（P1）

### US-ARCH-07 · 拆分 `itinerary-schedule.service` P1 · M · BE · ✅

**Story**  
作为后端开发，我希望行程/catalog 逻辑按职责拆分，以便阵容、冲突检测、艺人 profile 可独立测试与演进。

**背景**  
`itinerary-schedule.service.ts` 1000+ 行，混合 catalog seed、冲突检测、DJ profile、缓存、DTO 映射。

**验收标准**

- [ ] 拆出（类名可微调）：
  - `LineupCatalogService` — seed 查询、`CatalogLineupArtistDto` 构建
  - `ItineraryConflictService` — `detectPerformanceConflicts` 编排
  - `ArtistProfileResolver` — `buildArtistProfileDetailFromCatalog`、locale profile
- [ ] 原 `ItineraryScheduleService` 降为 **facade**，对外 API 不变
- [ ] 每个新类 < 350 行；现有 `itinerary-schedule.service.spec.ts` 绿
- [ ] 为新拆出类各补 ≥1 单元测试（或迁移现有用例）

**技术提示**

- `domain/itinerary-catalog.util.ts`、`utils/artist-profile-detail.util.ts` 已部分抽取
- `ItineraryModule` providers 注册更新

**依赖**：无

---

### US-ARCH-08 · 拆分 `travel-guide-generation.service` P1 · M · BE · ✅

**Story**  
作为后端开发，我希望攻略生成 pipeline（POI → LLM 润色 → 缓存）分层清晰，以便 Q2 境外 Hot Path 与 prompt 迭代互不影响。

**验收标准**

- [ ] 拆出：
  - `TravelGuidePoiPipeline` — `TravelGuidePoiCollector` + `Ranker` + map context
  - `TravelGuideLlmPolishService` — system prompt、JSON 解析、`sanitizeLlmTravelGuidePayload`
  - `TravelGuideGenerationOrchestrator` — cache key、fallback、`generate` 入口编排
- [ ] 原 service 或 controller 注入 facade；REST 行为不变
- [ ] `travel-guide-generation.service.spec.ts` 绿；改 prompt 的 PR 不再 diff POI 文件

**技术提示**

- 与 US-ARCH-01 可同一冲刺做：先拆 service，再抽 shared types

**依赖**：建议 US-ARCH-01 完成后做（类型归位后拆分更顺）

---

### US-ARCH-09 · 静态 seed / Hot Path 数据外置 P1 · S · BE · ✅

**Story**  
作为后端开发，我希望大块静态 POI/场馆数据不在 `src/modules` 业务目录里，以便 IDE 性能与 code review 可聚焦逻辑。

**验收标准**

- [ ] `travel-guide-hot-path.data.ts`、`travel-guide-hot-path-pois.data.ts` 等迁至 `data/travel-guide/` 或 `src/data/`
- [ ] 业务代码通过 `import` 或 lazy load 引用；路径在 `tsconfig` 可解析
- [ ] 单测 `travel-guide-hot-path.spec.ts` 仍绿
- [ ] 可选：`itinerary.seed.ts` 同类处理（若本 Story 有余力）

**技术提示**

- 注意 Nest build 是否包含 `data/`；必要时 `nest-cli.json` `assets` 配置

**依赖**：可与 US-ARCH-08 同 PR 或紧随其后

---

## Epic E · 模块边界与依赖（P2）

### US-ARCH-10 · 打破 `ActivityModule` ↔ `ItineraryModule` 循环依赖 P2 · M · BE · ✅

**Story**  
作为后端开发，我希望活动查询与行程模块无 `forwardRef` 循环，以便新功能依赖方向单一。

**背景**  
`activity.module.ts` ↔ `itinerary.module.ts` 双向 `forwardRef`。

**验收标准**

- [ ] 删除两处 `forwardRef(() => …)`
- [ ] `ItineraryModule` 仅依赖 `ACTIVITY_LOOKUP_PORT`（或扩展现有 port 方法）
- [ ] `ActivityModule` 不再 import `ItineraryModule`（或仅单向依赖）
- [ ] `npm run check` + itinerary 相关单测绿

**技术提示**

- 参考：`modules/activity/ports/activity-lookup.port.ts`、`PartnerModule` 的 port 用法
- 若需共享 catalog：考虑 `CatalogModule` 第三方模块

**依赖**：US-ARCH-07（拆分后边界更清晰）

---

### US-ARCH-13 · Controller 路由风格统一 P2 · S · BE · ✅

**Story**  
作为全栈开发，我希望活动域 REST 路径风格一致，以便查 API 文档和写 `api/sync/*` 时不猜 controller。

**背景**  
多数：`@Controller('posts')`；travel-guide：`@Controller()` + 方法级完整路径。

**验收标准**

- [x] `TravelGuideController` 改为 `@Controller('activities/:legacyId/travel-guide')`（或归入 `ActivityExperience` 子路由文档约定）
- [x] `FestivalPlanController` 改为 `@Controller('activities/:legacyId/festival-plan-progress')` + `@Get()`（URL 不变）
- [x] 路径与 [API.md](./API.md) 一致；**无 breaking change**（或版本说明 + 前端同步）
- [x] `smoke:api` 通过

**技术提示**

- `travel-guide-map.controller.ts` 单独 `@Controller('travel-guide')` 可保留（全局 map 工具）

**依赖**：无（注意与前端 `api/sync/travelGuide.ts` 同步）

---

### US-ARCH-14 · AI 模块 port 化（对齐 Partner 模式） P2 · L · BE · ✅

**Story**  
作为后端开发，我希望 AI agent 工具通过 port 调用业务域，以便 handler 单测可 mock、不拉整条 Partner/TravelGuide 链。

**背景**  
`AiModule` 直接 imports `PartnerModule`、`ItineraryModule`、`TravelGuideModule`；`PostAgentAdaptersModule` 已是良好范例。

**验收标准**

- [x] 定义 port（示例）：
  - `IPostWritePort` / `IPostQueryPort`
  - `ITravelGuidePort`
  - `IItineraryPort`
- [x] `ai/agent/tools/*` 与 `orchestration/handlers/*` 仅注入 port
- [x] adapters module 在 `AppModule` 层绑定实现
- [x] 至少 2 个 handler 单测改为 mock port（如 `agent-turn.handler`、`dj-info-turn.handler`）
- [x] `docs/ARCHITECTURE.md` AI 节更新

**技术提示**

- 参考：`modules/partner/ports/`、`ai/adapters/post-agent-adapters.module.ts`

**依赖**：US-ARCH-08、US-ARCH-10 完成后风险更低

---

## Epic F · Monorepo 与契约扩展（P2）

### US-ARCH-11 · Monorepo + `@sync/contracts` 正式包 P2 · L · FULL · ✅

**Story**  
作为团队，我希望共享契约不依赖「同级目录 tsconfig alias」，以便 CI 分仓、新人 clone 单个 repo 也能 typecheck。

**背景**  
当前 frontend `tsconfig` 指向 `../sync-app-backend/src/shared/`；contract test 无 sibling 时 skip。

**验收标准**

- [ ] 仓库根或 `packages/contracts/`（pnpm workspace）：
  ```
  sync/
  ├── packages/contracts/   # @sync/contracts 或分包 @sync/chat-contracts 等
  ├── sync-app/
  └── sync-app-backend/
  ```
- [ ] 前后端 `package.json` 依赖 workspace 包；删除跨 repo 相对 path alias
- [ ] contract test 对 **npm 包内容** 断言，不再 `fs.existsSync(../sync-app)`
- [ ] CI：单 job 可 `pnpm -r check`
- [ ] [DATA-LAYER.md](./DATA-LAYER.md)、[README.md](../README.md) 更新 clone 说明

**技术提示**

- 可先 **re-export 分包** 保持 `@sync/chat-contracts` 等名称不变，减少 churn
- Taro `config/index.ts` babel alias 需同步

**依赖**：US-ARCH-01、US-ARCH-02 完成后再迁包（迁移时文件已齐）

---

### US-ARCH-12 · 共享契约：`activity` + `notification` + `profile` P2 · L · FULL · ✅

**Story**  
作为全栈开发，我希望 `types/backend.ts` 不再堆积手写 DTO，剩余 API 类型逐步迁入 shared。

**验收标准**

- [x] 分 3 个小 PR（或 3 个子 Story）：
  - `shared/activity/` — `BackendActivity`、registration 等
  - `shared/notification/` — `AppNotification`、meta
  - `shared/profile/` — `ProfileSummary`、`ProfilePostItem` 等
- [x] `types/backend.ts` 仅保留：`ApiResponse<T>`、少量 BFF 聚合、re-export
- [x] 每域 1 个 contract test
- [x] [API.md](./API.md) 交叉引用 shared 类型名

**依赖**：US-ARCH-11（建议在 monorepo 落地后做，避免迁两次）

---

## Epic G · 长期演进（P3）

### US-ARCH-15 · 评估 TanStack Query 迁移 P3 · M · FE · ✅

**Story**  
作为前端负责人，我希望评估自研 `useApiQuery` 与 TanStack Query 的取舍，以便在维护成本与包体之间做数据驱动决策。

**触发条件**：自研缓存 bug 频发；或需要 mutation/devtools/乐观更新标准化。

**验收标准**

- [x] Spike 文档：`docs/spikes/tanstack-query-weapp.md`
- [x] 测量：`build:weapp:size` 前后对比（引入 @tanstack/react-query）
- [x] 试点 1 个低风险域（如 `notifications`）POC
- [x] 决策：**迁移 / 保持自研 / 混合** 之一，团队确认

**依赖**：US-ARCH-05 缓存规范先稳定

---

### US-ARCH-16 · OpenAPI / JSON Schema P3 · M · BE · ✅

**Story**  
作为全栈开发，我希望 REST API 有机器可读契约，以便减少手工维护 API.md 的漂移。

**触发条件**：接口数继续增长；或接入外部客户端。

**验收标准**

- [x] `@nestjs/swagger` 或 hand-written JSON Schema 覆盖 P0 路由（auth、activities、posts、travel-guide）
- [x] CI 校验 schema 与 controller 同步（或 swagger diff）
- [x] [API.md](./API.md) 注明 schema 来源

**依赖**：US-ARCH-12 类型稳定后更易生成

---

### US-ARCH-17 · E2E / Smoke 黄金路径进 CI P3 · M · FULL · ✅

**Story**  
作为发布负责人，我希望 CI 在 merge 前跑通核心用户路径，以便架构重构不 silent break 主流程。

**验收标准**

- [x] 扩展 `sync-app-backend` 现有 `smoke:api`、`smoke:ws` 为套件：
  1. health
  2. 活动列表 / 详情
  3. 帖子列表（种子活动）
  4. travel-guide generate-async 轮询（可 mock LLM）
  5. AI WS 一轮 ping（若 `AI_CHAT_WS_ENABLED`）
- [x] GitHub Actions job：`infra:up` → `smoke:api:wait`（或 testcontainers）
- [x] [RELEASE-SMOKE.md](./RELEASE-SMOKE.md) 对齐

**依赖**：无（可与 P0 并行，越早越好）

---

### US-ARCH-18 · AI 可观测性（结构化 trace + APM） P3 · M · BE · ⏸

**Story**  
作为后端负责人，我希望 AI 每轮对话有结构化 trace，以便排查延迟与成本。

**触发条件**：AI 调用量上升；或 ms_intent / ms_total 需接入监控面板。

**验收标准**

- [ ] `logAiTurn` 输出统一 JSON 字段：`requestId`、`intent`、`ms_*`、`model`、`cacheHit`
- [ ] 可选：对接 Sentry/Datadog/云日志检索
- [ ] 文档：`docs/LLM.md` 增加「排障」节

**依赖**：US-ARCH-14 port 化后 trace 注入点更清晰

---

## 明确暂不排 / 取消

| 事项 | 处理 | 原因 |
|------|------|------|
| 拆微服务 / Gateway 独立部署 | ❌ | 现网单体足够；文档目标架构已逻辑分层 |
| 全量重写 `useApiQuery` → TanStack | ⏸ | 见 US-ARCH-15，先评估 |
| 主包引入重组件域 UI | ❌ | 违反 [BUNDLE-SIZE.md](./BUNDLE-SIZE.md) |
| 为 ARCH 停 Q2 功能开发 | ❌ | 本 backlog 与 Q2 并行，P0 每周 1 项即可 |

---

## 附录 A · 现有架构资产（勿重复造轮）

| 资产 | 路径 | 说明 |
|------|------|------|
| 前端四层 | [COMPONENT-ARCHITECTURE.md](./COMPONENT-ARCHITECTURE.md) | pages → domains → components → ui |
| 数据层 | [DATA-LAYER.md](./DATA-LAYER.md) | apiClient、useApiQuery、Bearer |
| 包体门禁 | [BUNDLE-SIZE.md](./BUNDLE-SIZE.md) | verify:bundle、size:weapp |
| 后端模块图 | `sync-app-backend/docs/ARCHITECTURE.md` | ActivityExperience、AiTurnPipeline |
| Partner 分层范例 | `modules/partner/README.md` | ports + application |
| 已有 shared 契约 | `shared/chat`、`travel-plan`、`itinerary`、`festival-plan`、`activity`、`notification`、`profile` | 迁移模板 |
| 离线观演资料包 | **US-ARCH-19** · [DATA-LAYER.md §缓存分层](./DATA-LAYER.md#缓存分层) | 阵容/时间表/行程优先；招募帖不持久化 |

## 附录 B · PR 命名建议

```text
arch(contracts): add shared travel-guide types [US-ARCH-01]
arch(fe): split useEventDetailPage orchestration [US-ARCH-06]
arch(be): extract TravelGuidePoiPipeline [US-ARCH-08]
arch(be): remove post migrations from onModuleInit [US-ARCH-03]
```

## 附录 C · 更新日志

| 日期 | 说明 |
|------|------|
| 2026-06-23 | 初版：18 条 Story，P0～P3 排序 |
| 2026-06-23 | **+US-ARCH-19** 观演资料包离线缓存；**US-ARCH-05** 扩为四层缓存分层；产品优先级：阵容/时间表 > 招募帖 |
| 2026-06-24 | **US-ARCH-17** 黄金路径 smoke（`smoke:golden` / `smoke:suite`）+ CI `smoke` job + RELEASE-SMOKE 对齐 |

---

**维护**：每完成一条 Story，更新文首 **总表** 与 **完成进度总览** 状态；大改动在附录 C 记一行。
