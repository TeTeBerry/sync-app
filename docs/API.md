# Sync App — API 契约（H5 先行）

> **开发策略**：先 H5 业务联调，**登录后置**；微信登录更晚。  
> **当前身份**：Query `userId` / `authorName`（demo，与现后端一致）。  
> **登录之后**：`POST /auth/dev` → `Authorization: Bearer`；再之后 `/auth/wechat`。  
> 清单：`docs/FRONTEND-REFACTOR-CHECKLIST.md` / 后端 `docs/BACKEND-REFACTOR-CHECKLIST.md`  
> 架构：`../sync-app-backend/docs/ARCHITECTURE.md`

---

## 当前期（无登录）

个人页、删帖等继续传 Query：

```http
GET /api/profile?userId=...&authorName=Zara
DELETE /api/posts/:id?userId=...&authorName=Zara
POST /api/posts?userId=...&authorName=Zara
```

前端：`syncApi.ts` 中 `ownerParams()`。  
AI 聊天 body 仍可带 `userId` / `userName` / `userPhone` / `activityLegacyId`。

---

## 环境变量（H5）

```env
TARO_APP_API_BASE_URL=/api
TARO_APP_WS_URL=ws://127.0.0.1:10086/api/ai/chat/ws
```

H5 devServer 将 `/api`（含 WebSocket）代理到 `http://localhost:3000`。  
未配置 `TARO_APP_API_BASE_URL` 时前端走 mock，不请求后端。

**微信小程序**：在公众平台配置 `socket` 合法域名为 `wss://你的域名`；本地开发勾选开发者工具「不校验合法域名、web-view、TLS」，使用 `ws://局域网IP:3000/api/ai/chat/ws`。

---

## 鉴权（登录之后做，规划中）

### POST `/api/auth/dev`（H5 开发，规划中）

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

连接后先发握手，再发用户消息（JSON 帧，与旧 SSE `data:` 载荷同形）：

```json
{ "type": "connect", "sessionId": "optional", "activityLegacyId": 2 }
```

```json
{
  "type": "send",
  "messages": [{ "role": "user", "content": "帮我组队 EDC" }],
  "sessionId": "optional",
  "userId": "demo-zara",
  "userName": "Zara Chen",
  "activityLegacyId": 2,
  "image": "data:image/jpeg;base64,..."
}
```

服务端事件（示例）：

```json
{"type":"connected","sessionId":"..."}
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
| GET | `/api/posts?activityLegacyId=` | 活动下组队帖 |
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
- 探索 Tab 底栏入口（页面保留，未上线）
