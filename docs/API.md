# Sync App — API 契约（H5 先行）

> **身份**：JWT（Bearer）与 demo Query 双轨并存。  
> **已登录**：`Authorization: Bearer`；业务 REST **不再**附带 demo Query（`ownerQueryParams()`）。  
> **未登录（开发）**：Query 仅 `userId`（需后端 `AUTH_ALLOW_DEMO=true`；不传 Query `authorName`）。  
> 登录：`POST /auth/dev`（H5 开发）/ `POST /auth/wechat`（小程序）/ `POST /auth/logout`（吊销 JWT）。  
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

后端全局 [`JwtAuthGuard`](../sync-app-backend/src/common/auth/jwt-auth.guard.ts) 校验 Bearer 并设置 `req.actor`（`RequestActor`）；**前端 REST 不再传** demo Query（`activityLegacyId` 等业务参数仍可有）。详见 [`AUTH.md`](../sync-app-backend/docs/AUTH.md)。  
AI WebSocket：upgrade 带 Bearer 时 actor 来自 JWT；`send` 仅需业务字段（`messages`、`activityLegacyId` 等）。前端 [`buildAiChatWsSendActor()`](../src/api/requestActor.ts) 已登录时不传 body `userId`/`userName`。

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

## 举报与屏蔽

需登录（Bearer）或 demo Query `userId`。

- 屏蔽：帖子卡片 `⋯` → 屏蔽该用户；管理：个人页 → **已屏蔽用户** → 取消屏蔽
- 举报：帖子卡片 `⋯` → 举报

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/reports` | 举报内容，body：`targetType`（`post` \| `user` \| `comment`）、`targetId`、`category`（`ads` \| `scalper` \| `vulgar`）、可选 `targetUserId` / `reason` |
| `GET` | `/users/blocks` | 当前用户已屏蔽列表 `{ blockedUserIds, items: [{ userId, name, avatar? }] }` |
| `POST` | `/users/blocks` | 屏蔽用户，body：`{ blockedUserId }` |
| `DELETE` | `/users/blocks/:blockedUserId` | 取消屏蔽 |

重复举报/重复屏蔽 → `409`；屏蔽自己 → `400`。屏蔽后帖子列表（热门、活动）与 AI 匹配会过滤被屏蔽用户（含双向：对方屏蔽你也互相不可见）。

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

### POST `/api/auth/wechat`（小程序）

```json
{ "code": "<wx.login code>" }
```

响应格式与 `/auth/dev` 相同。

### POST `/api/auth/logout`（已登录）

```http
POST /api/auth/logout
Authorization: Bearer eyJ...
```

```json
{ "code": 200, "data": { "ok": true } }
```

- 需要 Bearer（`JwtAuthGuard`）；服务端递增用户 `tokenVersion`，使其它设备上的旧 JWT 失效
- 客户端应在成功后清除本地 token；网络失败时仍建议清本地 session
- Demo Query 身份（`AUTH_ALLOW_DEMO`）退出为无操作，仅客户端清 session

### 请求头

```http
Authorization: Bearer <token>
X-Activity-Id: 2          # 可选，活动 legacyId（REST + AI WebSocket upgrade）
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

### AI WebSocket 可靠性（客户端）

两层重试，均复用同一 `sessionId`（`sessionStorage` / `useChatSession`）：

| 层级 | 位置 | 行为 |
|------|------|------|
| 连接 | `utils/aiChatWs/pool.ts` | `connectSocket` 失败时最多重试 2 次，退避 400ms × 2^n |
| 整轮 | `utils/aiChatWs/stream.ts` | 传输失败且**未收到任何流式帧**时再试 1 次（共 2 轮）；已收到 `delta` 等部分内容则不自动重发（避免重复发帖/扣配额），用户可手动再发 |
| 会话恢复 | `GET /api/chat/sessions/:id` | 进入 AI 页拉历史；每轮 `send` 带持久化 `sessionId` |

不重试：`AbortError`、业务 `error` 帧、401 / 登录过期。

### GET `/api/chat/sessions/:sessionId`

恢复 AI 对话历史（进入 AI 页时调用）。

---

## REST 接口（当前已实现）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/home` | 首页聚合（热度、`signupEvents`、**`popularPosts`（8 条）**；并行拉取，减少首页额外 `/posts/popular` RTT） |
| GET | `/api/activities` | 活动列表 |
| GET | `/api/activities/match?keyword=` | 活动关键词匹配 |
| GET | `/api/activities/:legacyId` | 活动详情 |
| GET | `/api/posts/popular?limit=` | 首页热门帖子 |
| GET | `/api/posts?activityLegacyId=&limit=&cursor=&anchorPostId=` | 活动下组队帖（分页：`{ items, nextCursor?, hasMore }`） |
| POST | `/api/uploads/images` | multipart 字段 `file`，返回 `{ url }`；已配置 `WECHAT_MINI_APP_*` 时先调用微信 `img_sec_check`（≤1MB） |
| GET | `/api/posts?userId=&authorName=` | 我的帖子（owner 过滤） |
| POST | `/api/posts` | 创建组队帖（Query 身份；**前端 UI 不调用**，由 AI 闭环创建） |
| PATCH | `/api/posts/:id` | 编辑帖子 / 更新 status |
| DELETE | `/api/posts/:id` | 删除自己的帖子 |
| POST | `/api/posts/:id/like` | 点赞/取消；响应 `{ post: EventDetailPost }` |
| GET | `/api/posts/:id/comments` | 评论分页：`{ items, nextCursor?, hasMore }`；Query `limit`（默认 20，最大 50）、`cursor` |
| POST | `/api/posts/:id/comments` | 发表评论 `{ "body": "..." }`；响应 `{ post: EventDetailPost }` |
| POST | `/api/posts/:id/applications` | 申请加入（可选 `{ "message": "..." }`；创建首条会话消息） |
| POST | `/api/posts/:id/applications/:applicantUserId/accept` | 帖主接受组队 |
| GET | `/api/team-chats` | 当前用户相关的临时组队会话列表（仅帖主已发起的线程；不含已过期） |
| POST | `/api/team-chats/:postId/:applicantUserId/open` | **帖主**从组队帖发起沟通（写入 `ownerOpenedChatAt`，可选写入申请附言为首条消息） |
| GET | `/api/team-chats/:postId/:applicantUserId/messages` | 会话消息（帖主发起后才可读；过期返回 400） |
| POST | `/api/team-chats/:postId/:applicantUserId/messages` | 发送消息 `{ "body": "..." }`（帖主发起后才可发） |
| GET | `/api/profile` | 个人资料摘要 |
| GET | `/api/profile/activities` | 我的报名活动 |
| GET | `/api/profile/posts` | 我的帖子 |
| GET/PATCH | `/api/users/me` | 当前用户资料（Query 身份） |
| POST/DELETE | `/api/activities/:legacyId/register` | 活动报名 / 取消 |
| GET | `/api/notifications` | 通知列表 |
| GET | `/api/notifications/unread-count` | 未读数 |
| PATCH | `/api/notifications/:id/read` | 单条已读 |
| PATCH | `/api/notifications/read-all` | 全部已读 |
| POST | `/api/auth/logout` | 退出登录（Bearer）；吊销其它设备 JWT |

### GET `/api/posts/:id/comments`（分页）

Query：`limit`（默认 20，最大 50）、`cursor`（上一页 `nextCursor`）。

```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": "…",
        "userId": "…",
        "authorName": "…",
        "avatar": "…",
        "body": "…",
        "time": "刚刚",
        "replies": []
      }
    ],
    "nextCursor": "eyJj…",
    "hasMore": true
  }
}
```

仅分页**顶层评论**（`createdAt` 升序）；每条顶层评论的 `replies` 仍随页返回。

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

## REST 接口（用户与报名）

### `GET/PATCH /api/users/me`

- **已登录**：仅 `Authorization: Bearer`（无 demo Query）
- **未登录（开发）**：Query `userId`（`AUTH_ALLOW_DEMO=true`）；Query `authorName` 已废弃

GET 响应 `data`：`{ id, name, handle, location, bio, avatar, city?, favorGenres?, budgetLevel?, likeMate?, accountRisk? }`

`accountRisk`（仅受限时返回）：`{ status: 'restricted' | 'banned', postBlockedUntil?, message? }`。发帖/评论 403 时前端应 `invalidate users/me` 并展示提示。

PATCH body（均可选）：`name`, `handle`, `location`, `bio`, `avatar`, `city`, `favorGenres`, `budgetLevel`, `likeMate`

**账号风控**（`GET /users/me` 在受限时返回 `accountRisk`：`status`、`postBlockedUntil`、`message`）：

- 累计 **黄牛类违规**（规则/票务策略/LLM `scalper`）或 **被举报黄牛** 达阈值 → `restricted`（默认 7 天）或 `banned`（30 天）
- 受限期间 `POST /posts`、评论、AI 发帖均返回 **403**
- 违规事件写入 `AccountRiskEvent`；`duplicate` 不计入升级

**画像自动写入**（`city` / `favorGenres` / `likeMate` / `budgetLevel`，有变化才 `PATCH`）：

- AI 找搭子对话（`UserProfileAgent`）
- 组队发帖 / 组队表单 `POST /api/posts`（地点→`city`，组队类标签→`likeMate`，正文英文风格词→`favorGenres`）
- 专属行程 `POST /api/activities/:legacyId/travel-guide/generate`（出发地→`city`，住宿档位→`budgetLevel`，人数&gt;1→`likeMate`）

### `POST/DELETE /api/activities/:legacyId/register`

- **已登录**：仅 Bearer
- **未登录（开发）**：Query `userId` only

POST 响应 `data`：`{ ok: true, activityLegacyId, status: "registered", alreadyRegistered?: boolean }`

DELETE 响应 `data`：`{ ok: true, activityLegacyId, wasRegistered?: boolean }`

---

## 前端实现位置

| 能力 | 路径 |
|------|------|
| REST | `src/api/syncApi.ts`、`src/hooks/useSyncApi.ts` |
| WebSocket | `src/utils/aiChatWs.ts`、`src/hooks/ai-chat/useWsChatStream.ts` |
| 身份 / 登录登出 | `src/utils/auth.ts`、`src/api/requestActor.ts`、`src/api/requestContext.ts` |
| 展示用 userId/昵称 | `src/utils/session.ts`（非 demo Query） |
| 活动上下文 | `src/stores/navigationStore.ts`（`activeActivityLegacyId`） |

---

## 已移除（勿再文档化）

- `/api/tickets`、`/api/pindan` 及相关 profile 拼单接口（已从后端删除）
- 探索 Tab、`pages/explore`、`packageEvent/pages/posts`（全量帖栈页）及 `GET /posts/all` 前端消费
