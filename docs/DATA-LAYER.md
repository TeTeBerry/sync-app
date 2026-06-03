# 数据层

REST 与 React Query 的分层约定；身份为 **JWT + demo Query 双轨**（见 [`API.md`](./API.md)）。

## 请求身份

| 模块                                                    | 职责                                                                                                         |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [`api/requestContext.ts`](../src/api/requestContext.ts) | **`ownerQueryParams()`** — 无 token 时 demo Query（仅 `userId`）；**有 Bearer 时 `{}`** |
| [`api/handleApiUnauthorized.ts`](../src/api/handleApiUnauthorized.ts) | 401 清 storage + toast（仅当请求前已有 token） |
| [`utils/apiClient.ts`](../src/utils/apiClient.ts)       | **`getAuthHeaders()`** + 解析 envelope 401 |
| [`utils/session.ts`](../src/utils/session.ts)           | `getClientUserId()` / `getClientUserName()` — JWT-aware（展示名，非 demo Query） |
| [`utils/auth.ts`](../src/utils/auth.ts)                 | `loginWithWechat` / `loginWithDev` / `logout`（`POST /auth/logout` 吊销 JWT） |

### REST vs WebSocket

| 通道 | 有 Bearer | 无 token（demo / mock） |
|------|-----------|-------------------------|
| **REST** | 不传 demo Query；后端 `JwtAuthGuard` 设置 `req.actor`（`RequestActor`） | `demoActorQueryParams()` → `{ userId }` only（需后端 `AUTH_ALLOW_DEMO=true`） |
| **AI WebSocket** | Upgrade `Authorization: Bearer`；`send` body **可不传** `userId`/`userName`（后端从 JWT 解析 actor，见 `buildAiChatWsSendActor()`） | body 须 `userId`（demo）；可选 `userName` / `userPhone` |

无效 JWT：请求头含 **非空 Bearer** 但校验失败 → REST **401**（`登录已过期，请重新登录`），**不**与 demo Query 混用；WS 在 `connect`/`send` 时返回同文案 `error` 帧并关闭连接。

辅助函数：

- `hasAuthenticatedRequest()` — `!!getAccessToken()`
- `demoActorQueryParams()` — demo REST 仅 `userId`
- `mergeOwnerQueryParams(extra)` — 合并 limit/cursor 等
- `ownerQueryParamsWithActivity(activityLegacyId?)` — profile / entitlements 作用域
- `resolveRequestUserId()` — React Query `queryKey` 中的用户维度
- `notificationQueryParams()` — 通知 API：有 Bearer 时 `undefined`（不传 `userId`）；无 token 时 `{ userId }`
- `buildAiChatWsSendActor()` — [`api/requestActor.ts`](../src/api/requestActor.ts)：已登录 WS `send` 仅传 `userPhone`（如有）；demo 传 `userId`/`userName`
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
| `liveInfo.ts`      | `.../live-info`        |
| `itinerary.ts`     | `.../itinerary`        |

对外仍可从 [`api/syncApi.ts`](../src/api/syncApi.ts) barrel 导入（`import { fetchX } from '../api/syncApi'`）。

## React Query hooks

实现目录 [`src/hooks/sync/`](../src/hooks/sync/)：

| 文件               | 内容                                        |
| ------------------ | ------------------------------------------- |
| `activities.ts`    | 活动列表、首页 summary、详情、报名          |
| `posts.ts`         | 热帖、活动帖、评论分页、帖互动 mutation     |
| `profile.ts`       | 个人中心、权益、套餐（`profileApiEnabled`） |
| `notifications.ts` | 通知列表与已读                              |

对外仍从 [`hooks/useSyncApi.ts`](../src/hooks/useSyncApi.ts) 导出。

## 鉴权（前端已实现）

- [x] `ownerQueryParams()` — 有 Bearer 时不发 demo Query
- [x] Demo Query 仅 `userId`（不再传 Query `authorName`；后端 demo 判定只看 `userId`）
- [x] `apiClient` / `uploadImage` — 401 清 session + 后端 `message` toast
- [x] `logout()` — `POST /auth/logout` + 清本地 session
- [x] AI WebSocket JWT actor（upgrade Bearer；`buildAiChatWsSendActor`）
- [x] 无效 Bearer → REST 401 + WS error；`api/requestActor.ts` + `useClientSessionIdentity`

后续（可选）：地图他人帖 `GET /profile/posts`（需后端 actor/owner 分离，前端暂不排）。

## Chat 契约（与后端共享）

`ConversationState`、`AiStreamEvent`、`ChatMessage`、推荐卡片类型**不得**在前端手写重复定义。

- 后端真源：`sync-app-backend/src/shared/chat/`（`index.ts` 统一导出）
- 前端：`import … from '@sync/chat-contracts'`（`conversationState.ts` / `aiChat.ts` 仅 re-export）
- 契约测试（`sync-app-backend/test/contract/`）：
  - `chat-conversation-state.contract.spec.ts` — `ConversationState` 各 flow
  - `chat-ai-stream-event.contract.spec.ts` — `AiStreamEvent` 各帧类型
  - `chat-frontend-reexports.contract.spec.ts` — 前端仅 re-export（需同级 `sync-app` 目录，否则 skip）

## 身份命名对照

| 后端 `RequestActor` | 前端 `ClientSessionIdentity`（`api/requestActor.ts`） |
| ------------------- | ----------------------------------------------------- |
| `source` (`jwt` \| `demo`) | `isAuthenticated` |
| `clientUserId` | `userId` |
| `displayName` | `displayName` |
| `resolvedUserId` | （无，由后端解析 demo 映射） |

REST/WS 发请求用 `ownerQueryParams()` / `buildAiChatWsSendActor()`；勿与后端 actor 类型混用。

## 活动上下文 Header

`X-Activity-Id: <legacyId>`：REST 由 `ActivityContextMiddleware` 写入 `req.scopedActivityLegacyId`；AI WebSocket 在 upgrade 与 `send` body 合并。Profile 等接口 Query `activityLegacyId` 可与 Header 并存，Query 优先。

## 依赖方向

```text
pages / components  →  hooks/sync  →  api/sync  →  apiClient
                                    ↘ requestContext → session / authStorage
types/conversationState  →  @sync/chat-contracts  →  sync-app-backend/shared/chat
```

`hooks/sync` **不得** import `pages/**`。
