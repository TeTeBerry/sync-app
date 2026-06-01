# Sync App — API 契约（H5 先行）

> **开发策略**：先 H5 业务联调，**登录后置**；微信登录更晚。  
> **未登录**：Query `userId`（demo；不再传 Query `authorName`）。  
> **已登录**：`Authorization: Bearer`；业务 REST **不再**附带 demo Query（由 `ownerQueryParams()` 控制）。  
> 登录：`POST /auth/dev`（H5）/ `POST /auth/wechat`（小程序）。  
> 清单：`docs/FRONTEND-REFACTOR-CHECKLIST.md` / 后端 `docs/BACKEND-REFACTOR-CHECKLIST.md`  
> 架构：`../sync-app-backend/docs/ARCHITECTURE.md`

---

## 未登录（demo Query）

无 access token 时，个人页、删帖等传 Query：

```http
GET /api/profile?userId=...
DELETE /api/posts/:id?userId=...
```

前端：[`api/requestContext.ts`](../src/api/requestContext.ts) 中 `demoActorQueryParams()` / `ownerQueryParams()`；聚合入口 [`api/requestActor.ts`](../src/api/requestActor.ts)。  
Query **`authorName`**（demo）：**已废弃**，仅兼容旧客户端；新接入只传 `userId`。  
AI 聊天 **WebSocket**：upgrade 可带 `Authorization: Bearer`；已登录时 `send` body **可不传** `userId`/`userName`。无效 Bearer → REST 401 / WS `error`（见 [`constants/authMessages.ts`](../src/constants/authMessages.ts)）。

## 已登录（Bearer）

```http
GET /api/profile
Authorization: Bearer eyJ...
```

后端 [`JwtActorMiddleware`](../sync-app-backend/src/common/middleware/jwt-actor.middleware.ts) 将 JWT `sub` → `req.query.userId`、`name` → `req.query.authorName`；**前端 REST 不再传** demo Query（`activityLegacyId` 等业务参数仍可有）。  
AI WebSocket：upgrade 带 Bearer 时 actor 来自 JWT；`send` 仅需业务字段（`messages`、`activityLegacyId` 等）。前端 [`buildAiChatWsSendActor()`](../src/api/aiChatActor.ts) 已登录时不传 body `userId`/`userName`。

---

## 环境变量（H5）

```env
TARO_APP_API_BASE_URL=/api
TARO_APP_WS_URL=ws://127.0.0.1:10086/api/ai/chat/ws
```

H5 devServer 将 `/api`（含 WebSocket）代理到 `http://localhost:3000`。  
未配置 `TARO_APP_API_BASE_URL` 时前端走 mock，不请求后端。

---

## 微信小程序

### 环境变量（`npm run dev:weapp` / 上传构建）

```env
# 必填：HTTPS 业务 API（须在微信公众平台配置 request 合法域名）
TARO_APP_API_BASE_URL=https://your-api.example.com

# 可选：AI WebSocket（须配置 socket 合法域名 wss://…）
TARO_APP_AI_CHAT_WS_URL=wss://your-api.example.com/api/ai/chat/ws
```

本地联调：开发者工具勾选 **「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」**，可将 `TARO_APP_API_BASE_URL` 指向局域网 HTTP（如 `http://192.168.x.x:3000`）。

### 登录

- 拦截登录（`LoginPromptHero`）：`loginWithWechat({ requireProfile: true })` — 需用户授权昵称头像
- 静默 `ensureAuth`（`app.tsx` / 个人页）：`loginWithWechat({ requireProfile: false })`
- 用户主动退出后：`shouldSkipAutoLogin()` 为真，**不会**自动 `wx.login`

### 后端前置

`POST /api/auth/wechat` 在目标环境可用；`sync-app-backend` 的 `AUTH_MODE` 与微信 AppId/Secret 已配置。未就绪时前端仍可构建，但无法完成真机登录验收。

### WebSocket

在公众平台配置 `socket` 合法域名为 `wss://你的域名`；本地开发可配合「不校验合法域名」使用 `ws://局域网IP:3000/api/ai/chat/ws`。

---

## 鉴权

### POST `/api/auth/dev`（H5 开发）

```json
{ "displayName": "Zara" }
```

```json
{
  "code": 200,
  "data": {
    "accessToken": "eyJ...",
    "user": { "id": "...", "name": "Zara Chen", "handle": "@zara" }
  }
}
```

- 仅开发环境或 `AUTH_MODE=dev` 开启  
- 生产不可用；微信上线后由 `/auth/wechat` 替代

### POST `/api/auth/wechat`（小程序，后置）

```json
{ "code": "<wx.login code>" }
```

响应格式与 `/auth/dev` 相同。

### 请求头

```http
Authorization: Bearer <token>
X-Activity-Id: 2          # 可选，活动 legacyId（AI 聊天已发送；后端 middleware 登录期启用）
```

---

## 响应格式（REST）

```json
{ "code": 200, "message": "ok", "data": { ... } }
```

---

## AI 流式对话（WebSocket）

### WebSocket `/api/ai/chat/ws`

连接时建议带 `Authorization: Bearer <token>`（与 REST 相同）。连接后先发握手，再发用户消息（JSON 帧）：

```json
{ "type": "connect", "sessionId": "optional", "activityLegacyId": 2 }
```

已登录 `send`（body 身份可省略，由 JWT 注入）：

```json
{
  "type": "send",
  "messages": [{ "role": "user", "content": "帮我组队 EDC" }],
  "sessionId": "optional",
  "activityLegacyId": 2,
  "image": "http://127.0.0.1:3000/uploads/abc.jpg"
}
```

无 token / demo `send`：

```json
{
  "type": "send",
  "messages": [{ "role": "user", "content": "帮我组队 EDC" }],
  "userId": "demo-zara",
  "userName": "Zara Chen",
  "activityLegacyId": 2
}
```

若已登录且 body `userId` 与 JWT `sub` 不一致，服务端返回 `{ "type": "error", "message": "用户身份与登录态不一致" }`。

`image` / `images`：优先使用 `POST /api/uploads/images` 返回的 URL；服务端仍兼容 legacy data URL。

AI 匹配配额：服务端在 `post_recommendations` 且 `posts.length > 0` 时扣次；客户端收到后仅需刷新 `GET /profile/entitlements`，勿再调用 `POST /profile/entitlements/consume/ai-match`。

服务端事件（示例）：

```json
{"type":"connected","sessionId":"...","auth":"jwt"}
```
`auth`：`jwt`（upgrade 含有效 Bearer）或 `demo`。

```json
{"type":"delta","content":"..."}
{"type":"post_created","postId":"...","activityLegacyId":2}
{"type":"conversation_patch","state":{...}}
{"type":"done","messageId":"...","sessionId":"..."}
{"type":"error","message":"..."}
```

- `post_created`：AI 闭环发帖成功，前端应刷新帖列表并 toast
- 审核拒绝：`delta` 文案（含「组队帖暂未发布」），**不**发 `post_created`
- `error`：请求失败或流异常

**环境变量**：`TARO_APP_WS_URL`（或 `TARO_APP_AI_CHAT_WS_URL`），或从 `TARO_APP_API_BASE_URL` 自动推导 `ws(s)://…/api/ai/chat/ws`。

### GET `/api/chat/sessions/:sessionId`

恢复 AI 对话历史（进入 AI 页时调用）。

---

## REST 接口（当前已实现）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/home` | 首页聚合（热度、报名活动列表；热度优先 Redis，Mongo 兜底） |
| GET | `/api/activities` | 活动列表 |
| GET | `/api/activities/match?keyword=` | 活动关键词匹配 |
| GET | `/api/activities/:legacyId` | 活动详情 |
| GET | `/api/posts/popular?limit=` | 首页热门帖子 |
| GET | `/api/posts?activityLegacyId=&limit=&cursor=&anchorPostId=` | 活动下组队帖（分页：`{ items, nextCursor?, hasMore }`） |
| POST | `/api/uploads/images` | multipart 字段 `file`，返回 `{ url }` |
| GET | `/api/posts?userId=&authorName=` | 我的帖子（owner 过滤） |
| POST | `/api/posts` | 创建组队帖（Query 身份；**前端 UI 不调用**，由 AI 闭环创建） |
| PATCH | `/api/posts/:id` | 编辑帖子 / 更新 status |
| DELETE | `/api/posts/:id` | 删除自己的帖子 |
| POST | `/api/posts/:id/like` | 点赞 |
| POST | `/api/posts/:id/comments` | 发表评论 `{ "body": "..." }` |
| POST | `/api/posts/:id/applications` | 申请加入 |
| GET | `/api/profile` | 个人资料摘要 |
| GET | `/api/profile/activities` | 我的报名活动 |
| GET | `/api/profile/posts` | 我的帖子 |
| GET/PATCH | `/api/users/me` | 当前用户资料（Query 身份） |
| POST/DELETE | `/api/activities/:legacyId/register` | 活动报名 / 取消 |
| GET | `/api/notifications` | 通知列表 |
| GET | `/api/notifications/unread-count` | 未读数 |
| PATCH | `/api/notifications/:id/read` | 单条已读 |
| PATCH | `/api/notifications/read-all` | 全部已读 |

通知 `meta`（深链，可选）：

```json
{
  "activityLegacyId": 2,
  "postId": "665a…",
  "type": "like",
  "actorUserId": "demo-zara",
  "actorUserName": "Zara Chen"
}
```

- `type`：`like` | `comment` | `application` | `activity`（客户端跳转活动详情；有 `postId` 时高亮对应帖子）
- `activityLegacyId`：优先于已废弃的字符串 `activityId`

---

## REST 接口（登录期规划，未实现）

| 方法 | 路径 | 模块 |
|------|------|------|
| POST | `/api/auth/dev` | Auth |
| POST | `/api/auth/logout` | Auth |

### `GET/PATCH /api/users/me`

Query：`userId`、`authorName`（与 `/profile` 相同）。

GET 响应 `data`：`{ id, name, handle, location, bio, avatar, city?, favorGenres?, budgetLevel?, likeMate? }`

PATCH body（均可选）：`name`, `handle`, `location`, `bio`, `avatar`, `city`, `favorGenres`, `budgetLevel`, `likeMate`

### `POST/DELETE /api/activities/:legacyId/register`

Query：`userId`、`authorName`。

POST 响应 `data`：`{ ok: true, activityLegacyId, status: "registered", alreadyRegistered?: boolean }`

DELETE 响应 `data`：`{ ok: true, activityLegacyId, wasRegistered?: boolean }`

---

## 前端实现位置

| 能力 | 路径 |
|------|------|
| REST | `src/api/syncApi.ts`、`src/hooks/useSyncApi.ts` |
| WebSocket | `src/utils/aiChatWs.ts`、`src/hooks/ai-chat/useWsChatStream.ts` |
| 身份（当前 demo） | `src/utils/session.ts` |
| 身份（规划） | `src/utils/auth.ts` |
| 活动上下文 | `src/stores/navigationStore.ts`（`activeActivityLegacyId`） |

---

## 已移除（勿再文档化）

- `/api/tickets`、`/api/pindan` 及相关 profile 拼单接口（已从后端删除）
- 探索 Tab、`pages/explore`、`packageEvent/pages/posts`（全量帖栈页）及 `GET /posts/all` 前端消费
