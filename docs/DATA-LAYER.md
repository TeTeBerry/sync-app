# 数据层

REST 与自定义 `useApiQuery` 缓存的分层约定；身份为 **JWT Bearer**（见 [`API.md`](./API.md)）。

## 请求身份

| 模块                                                    | 职责                                                                                                         |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [`api/requestContext.ts`](../src/api/requestContext.ts) | **`ownerQueryParams()`** — 恒为 `{}`（身份仅走 `Authorization` Header） |
| [`api/handleApiUnauthorized.ts`](../src/api/handleApiUnauthorized.ts) | 401 清 storage + toast（仅当请求前已有 token） |
| [`utils/apiClient.ts`](../src/utils/apiClient.ts)       | **`getAuthHeaders()`** + 解析 envelope 401 |
| [`utils/session.ts`](../src/utils/session.ts)           | `getClientUserId()` / `getClientUserName()` — JWT-aware 展示名 |
| [`utils/auth.ts`](../src/utils/auth.ts)                 | `loginWithWechat` / `ensureAuth` / `logout`（`POST /auth/logout` 吊销 JWT） |

### REST vs WebSocket

| 通道 | 有 Bearer | 无 token |
|------|-----------|----------|
| **REST** | `JwtAuthGuard` 设置 `req.actor` | 受保护路由 401；`@Public()` 可访问 |
| **AI WebSocket** | Upgrade `Authorization: Bearer`；`send` body **可不传** `userId`/`userName` | body 须 `userId`；可选 `userName` / `userPhone` |

无效 JWT：请求头含 **非空 Bearer** 但校验失败 → REST **401**（`登录已过期，请重新登录`）；WS 在 `connect`/`send` 时返回同文案 `error` 帧并关闭连接。

辅助函数：

- `hasAuthenticatedRequest()` — `!!getAccessToken()`
- `mergeOwnerQueryParams(extra)` — 合并 limit/cursor 等业务 Query
- `resolveRequestUserId()` — React Query `queryKey` 中的用户维度
- `notificationQueryParams()` — 通知 API：恒为 `undefined`（身份走 Bearer）
- `buildAiChatWsSendActor()` — [`api/requestActor.ts`](../src/api/requestActor.ts)：已登录 WS `send` 仅传 `userPhone`（如有）；未登录传 `userId`/`userName`
- `getClientSessionIdentity()` / `useClientSessionIdentity()` — 前端会话身份（勿与后端 `RequestActor` 混用）

### AI WebSocket 可靠性

| 层级 | 模块 | 说明 |
|------|------|------|
| 连接重试 | `utils/aiChatWs/pool.ts` | 建连失败最多 2 次，指数退避 |
| 整轮重试 | `utils/aiChatWs/stream.ts` | 零事件传输失败再试 1 轮；有部分 `delta` 不自动重发 |
| 历史恢复 | `api/sync/chat.ts` + `useChatSession` | `GET /chat/sessions/:id`；`sessionId` 持久化 |

## REST 按域拆分

实现目录 [`src/api/sync/`](../src/api/sync/)：

| 文件               | 路径前缀               |
| ------------------ | ---------------------- |
| `activities.ts`    | `/activities`, `/home` |
| `users.ts`         | `/users`, `/reports`   |
| `posts.ts`         | `/posts`               |
| `profile.ts`       | `/profile`             |
| `notifications.ts` | `/notifications`       |
| `chat.ts`          | `/chat/sessions`       |
| `itinerary.ts`     | `.../itinerary`        |
| `travelPlan.ts`    | `.../travel-plan`      |
| `travelGuide.ts`   | `.../travel-guide`（生成攻略、出发地 inputtips；POI/路线由后端 **高德** API 提供） |
| `personalityTest.ts` | `/personality-test` |
| `festivalPlanProgress.ts` | `.../festival-plan-progress` |
| `reports.ts`       | `/reports`             |
| `feedback.ts`      | `/feedback`            |

对外仍可从 [`api/syncApi.ts`](../src/api/syncApi.ts) barrel 导入（`import { fetchX } from '../api/syncApi'`）。

## React Query hooks

实现目录 [`src/hooks/sync/`](../src/hooks/sync/)：

| 文件               | 内容                                        |
| ------------------ | ------------------------------------------- |
| `activities.ts`    | 活动列表、首页 summary、详情、活动选择同步    |
| `posts.ts`         | 活动帖无限滚动、评论分页、删帖 mutation |
| `profile.ts`       | 个人摘要、活动列表              |
| `notifications.ts` | 通知列表与已读                              |

对外仍从 [`hooks/useSyncApi.ts`](../src/hooks/useSyncApi.ts) 导出。

## 鉴权（前端已实现）

- [x] `ownerQueryParams()` — 恒为 `{}`；身份仅走 Bearer Header
- [x] `apiClient` / `uploadImage`（`wx.cloud.uploadFile` → `cloud://` fileID）— 401 清 session + 后端 `message` toast
- [x] `logout()` — `POST /auth/logout` + 清本地 session
- [x] AI WebSocket JWT actor（upgrade Bearer；`buildAiChatWsSendActor`）
- [x] 无效 Bearer → REST 401 + WS error；`api/requestActor.ts` + `useClientSessionIdentity`

后续（可选）：地图他人帖 `GET /profile/posts`（需后端 actor/owner 分离，前端暂不排）。

## 共享契约（与后端 `@sync/*-contracts`）

类型**不得**在 `types/backend.ts` 手写重复定义；从薄 re-export 文件导入。

| Alias | 后端真源 | 前端 re-export |
|-------|----------|----------------|
| `@sync/chat-contracts` | `shared/chat/` | `types/aiChat.ts`, `types/conversationState.ts` |
| `@sync/travel-plan-contracts` | `shared/travel-plan/` | `types/travelPlan.ts` |
| `@sync/travel-guide-contracts` | `shared/travel-guide/` | `types/travelGuide.ts` |
| `@sync/partner-contracts` | `shared/partner/` | `types/partner.ts` |
| `@sync/itinerary-contracts` | `shared/itinerary/` | `types/itinerary.ts` |
| `@sync/festival-plan-contracts` | `shared/festival-plan/` | `types/festivalPlan.ts` |

### Chat 契约

`ConversationState`、`AiStreamEvent`、`ChatMessage`、推荐卡片类型：

- 后端真源：`sync-app-backend/src/shared/chat/`（`index.ts` 统一导出）
- 前端：`import … from '@sync/chat-contracts'`（`conversationState.ts` / `aiChat.ts` 仅 re-export）
- 契约测试（`sync-app-backend/test/contract/`）：
  - `chat-conversation-state.contract.spec.ts` — `ConversationState` 各 flow
  - `chat-ai-stream-event.contract.spec.ts` — `AiStreamEvent` 各帧类型
  - `chat-frontend-reexports.contract.spec.ts` — 前端仅 re-export（需同级 `sync-app` 目录，否则 skip）

## 身份命名对照

| 后端 `RequestActor` | 前端 `ClientSessionIdentity`（`api/requestActor.ts`） |
| ------------------- | ----------------------------------------------------- |
| `source` (`jwt` \| `anonymous`) | `isAuthenticated` |
| `clientUserId` | `userId` |
| `displayName` | `displayName` |
| `resolvedUserId` | （无，由后端 JWT 解析） |

REST/WS 发请求用 `getAuthHeaders()` / `buildAiChatWsSendActor()`；勿与后端 actor 类型混用。

## 活动上下文 Header

`X-Activity-Id: <legacyId>`：REST 由 `ActivityContextMiddleware` 写入 `req.scopedActivityLegacyId`；AI WebSocket 在 upgrade 与 `send` body 合并。Profile 等接口 Query `activityLegacyId` 可与 Header 并存，Query 优先。

## 依赖方向

```text
pages / components  →  hooks/sync  →  api/sync  →  apiClient
                                    ↘ requestContext → session / authStorage
types/conversationState  →  @sync/chat-contracts  →  sync-app-backend/shared/chat
```

`hooks/sync` **不得** import `pages/**`。

## 缓存分层

> **产品优先级（2026-06）**：现场弱网时，**阵容 / 演出时间表 / 专属行程** 比 **公开招募帖** 更值得持久化离线。实现 Story：**US-ARCH-19**；职责收口：**US-ARCH-05**。

### 四层职责

| 层 | 机制 | 典型数据 | 持久化 | 无网可读 |
|----|------|----------|--------|----------|
| **1 · Server state** | `useApiQuery` / `useApiInfiniteQuery` 内存 `globalCache` | 活动详情、帖列表、通知 | 否（进程内） | 仅当内存仍有且上次请求成功 |
| **2 · Prefetch seed** | `activityDetailCache` · `eventPostsPageCache` · `prefetchToCache` | 列表→详情 header、帖首屏 | 否 | 同层 1 |
| **3 · Persistent offline** | `Taro.setStorageSync` + envelope（`savedAt`） | 见下表 | 是 | 是（在 TTL 内） |
| **4 · UI / draft** | Zustand · 表单草稿 | 导航 intent、overlay、发帖草稿 | 部分 | 不适用 |

`staleTime` 常量：[`constants/queryCache.ts`](../src/constants/queryCache.ts)（90～120s，减少弱网重复请求，**不**等于离线包）。

### 层 3 现网与规划

| 数据 | 模块 | TTL / 说明 |
|------|------|------------|
| 首页 summary | `homeCacheStorage` | 24h · 启动 `hydrateAppCachesFromStorage` |
| 活动列表 catalog | `homeCacheStorage` | 24h · 同上 |
| 个人摘要 | `homeCacheStorage` | 24h · 登出清除 |
| 出行攻略 | `travelGuideDetailStorage` | 按 guideId / 活动最新索引 |
| 人格测试结果 | `personalityTestStorage` | 长期 · 拉服务端失败 fallback |
| **观演资料包（规划）** | **US-ARCH-19** `activityPerformanceBundleStorage` | 按 `activityLegacyId` · 阵容 + timetable + 专属行程 + 资讯 |

### 观演资料包（US-ARCH-19 · 按活动）

**写入时机**：Wi‑Fi 下用户打开已选活动详情，且阵容/行程 API 成功。  
**包内优先级**：专属行程 → 演出时间表 → 阵容网格 → 活动资讯 → 已有攻略。  
**明确不写入**：招募帖列表、评论、通知、AI 找队结果（时效 + 产品权重低）。  
**无网降级**：资料包命中则阵容/行程只读；招募区文案「需联网查看最新公开招募」。

### 微信小程序代码包（平台层）

与业务 storage 无关，但影响弱网首屏：

- 微信自动缓存已下载的**主包/分包代码**
- [`app.config.ts`](../src/app.config.ts) `preloadRule`：Tab 在 **Wi‑Fi** 预下 `packageEvent` / `packageProfile`
- 详见 [BUNDLE-SIZE.md](./BUNDLE-SIZE.md)

### Invalidate 约定

- `invalidateCache(['activities'])` 应级联考虑 `activityDetailCache` seed 与（未来）资料包 `savedAt`
- 登出：`clearHomeCachesOnLogout` · 不清匿名人格缓存策略见 `personalityTestStorage`
- 阵容官宣推送落地：应 bump 对应活动资料包版本或 `clear(activityLegacyId)`
