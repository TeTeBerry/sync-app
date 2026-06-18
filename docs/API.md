# Sync App — REST / WS 契约

> **身份**：受保护 REST 需 `Authorization: Bearer`；`@Public()` 路由（health、部分活动读等）可无 token。  
> 登录：`POST /auth/wechat`（小程序）/ `POST /auth/logout`（吊销 JWT）。  
> 清单：`docs/FRONTEND-REFACTOR-CHECKLIST.md` / 后端 `docs/BACKEND-REFACTOR-CHECKLIST.md`  
> 架构：`../sync-app-backend/docs/ARCHITECTURE.md`

---

## 鉴权概览

**已登录**：

```http
GET /api/profile
Authorization: Bearer eyJ...
```

后端 [`JwtAuthGuard`](../sync-app-backend/src/common/auth/jwt-auth.guard.ts) 校验 Bearer 并设置 `req.actor`（`RequestActor`）。前端 [`ownerQueryParams()`](../src/api/requestContext.ts) 恒为 `{}`（身份仅走 Header）。详见 [`AUTH.md`](../sync-app-backend/docs/AUTH.md)。

AI WebSocket：upgrade 带 Bearer 时 actor 来自 JWT；`send` 仅需业务字段（`messages`、`activityLegacyId` 等）。前端 [`buildAiChatWsSendActor()`](../src/api/requestActor.ts) 已登录时不传 body `userId`/`userName`。

**未登录**：受保护接口返回 401；`@Public()` 接口可访问，后端 actor 为 `anonymous`。

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
# 文档/回退用公网 API 根（H5 或调试）；小程序 weapp 走 callContainer，无需 request 合法域名
TARO_APP_API_BASE_URL=https://sync-backend-prd-xxxx.sh.run.tcloudbase.com/api

# 文档/回退用；小程序 AI WS 走 connectContainer，无需 socket 合法域名
TARO_APP_AI_CHAT_WS_URL=wss://sync-backend-prd-xxxx.sh.run.tcloudbase.com/api/ai/chat/ws

# 必填：CloudBase 环境 ID（wx.cloud.init / uploadFile / callContainer）
TARO_APP_CLOUDBASE_ENV_ID=sync-prd-xxxx

# 必填：云托管服务名（控制台「服务管理」；也可从 *.sh.run 域名自动推导）
TARO_APP_CLOUD_RUN_SERVICE=sync-backend-prd-xxxx
```

**小程序生产路径**：`apiClient` 使用 `wx.cloud.callContainer`，AI WebSocket 使用 `wx.cloud.connectContainer`（见 [`utils/cloudRunTransport.ts`](../src/utils/cloudRunTransport.ts)）。**无需**在公众平台配置 `sh.run.tcloudbase.com` 为 request/socket 合法域名。

本地联调 Nest：开发者工具勾选 **「不校验合法域名」**，可将 `TARO_APP_API_BASE_URL` 指向局域网 HTTP，并**清空** `TARO_APP_CLOUD_RUN_SERVICE`（或删除 `TARO_APP_CLOUDBASE_ENV_ID`）以回退 `Taro.request` / `connectSocket`。

### 登录

- 拦截登录（`LoginPromptHero`）：`loginWithWechat({ requireProfile: true })` — 需用户授权昵称头像
- 静默 `ensureAuth`（`app.tsx` / 个人页）：`loginWithWechat({ requireProfile: false })`
- 用户主动退出后：`shouldSkipAutoLogin()` 为真，**不会**自动 `wx.login`

### 后端前置

`POST /api/auth/wechat` 在目标环境可用；`sync-app-backend` 已配置 `WECHAT_MINI_APP_ID` / `WECHAT_MINI_APP_SECRET`。未就绪时前端仍可构建，但无法完成真机登录验收。

### WebSocket

云托管体验版/正式版：`connectContainer` 连 `/api/ai/chat/ws`，upgrade 可带 `Authorization: Bearer`（[`aiChatWs/pool.ts`](../src/utils/aiChatWs/pool.ts)）。

H5 / 局域网调试：`Taro.connectSocket` 到 `TARO_APP_AI_CHAT_WS_URL`；本地可配合「不校验合法域名」使用 `ws://局域网IP:3000/api/ai/chat/ws`。

### 图片上传（UGC）

| 环节 | 说明 |
|------|------|
| 选图 | 小程序 `Taro.chooseImage` / 聊天选图 |
| 上传 | `wx.cloud.uploadFile` → 对象路径 `ugc/{userId}/…` |
| 提交 API | 请求体字段存 **`cloud://` fileID**（AI `image`、手环 `imageUrl`、聊天图片等） |
| 展示 | 客户端 `wx.cloud.getTempFileURL`；`resolveDisplayImageUrls` |
| 后端 | 校验 fileID 格式与 `CLOUDBASE_ENV_ID`（若配置）；**不**持有 COS 密钥、**不**代传文件 |

环境变量：`TARO_APP_CLOUDBASE_ENV_ID`（前端）、`CLOUDBASE_ENV_ID`（后端，可选校验）。

---

## 举报

需登录（Bearer）。

- 举报：内容或用户 `⋯` → 举报（`targetType`: `user` | `comment`）

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/reports` | 举报内容，body：`targetType`（`user` \| `comment`）、`targetId`、`category`（`ads` \| `scalper` \| `vulgar`）、可选 `targetUserId` / `reason` |

重复举报 → `409`。

---

## 鉴权

### POST `/api/auth/wechat`（小程序）

```json
{ "code": "<wx.login code>", "nickName": "可选", "avatarUrl": "可选" }
```

需配置：`WECHAT_MINI_APP_ID` / `WECHAT_MINI_APP_SECRET`（与内容安全共用 access_token）。

```json
{
  "code": 200,
  "data": {
    "accessToken": "eyJ...",
    "user": { "id": "...", "name": "...", "handle": "@..." }
  }
}
```

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

### 请求头

```http
Authorization: Bearer <token>
X-Activity-Id: 4          # 可选，活动 legacyId（REST + AI WebSocket upgrade）
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
{ "type": "connect", "sessionId": "optional", "activityLegacyId": 4 }
```

已登录 `send`（body 身份可省略，由 JWT 注入）：

```json
{
  "type": "send",
  "messages": [{ "role": "user", "content": "帮我组队风暴" }],
  "sessionId": "optional",
  "activityLegacyId": 4,
  "image": "cloud://sync-prd-xxxx.7373-sync-prd/ugc/posts/wx_user/1710000000000_abc.jpg"
}
```

无 token / demo `send`：

```json
{
  "type": "send",
  "messages": [{ "role": "user", "content": "帮我组队风暴" }],
  "userId": "demo-zara",
  "userName": "Zara Chen",
  "activityLegacyId": 4
}
```

若已登录且 body `userId` 与 JWT `sub` 不一致，服务端返回 `{ "type": "error", "message": "用户身份与登录态不一致" }`。

**生产（CloudBase 云托管）**：仅 `cloud://` fileID。  
**本地 Nest 联调**：可设 `ENABLE_LOCAL_UPLOADS=true`，临时使用 `http://局域网IP:3000/uploads/…`。

服务端事件（示例）：

```json
{"type":"connected","sessionId":"...","auth":"jwt"}
```
`auth`：`jwt`（upgrade 含有效 Bearer）或 `demo`。

```json
{"type":"delta","content":"..."}
{"type":"activity_recommendation","activity":{...}}
{"type":"conversation_patch","state":{...}}
{"type":"suggested_replies","replies":["..."]}
{"type":"done","messageId":"...","sessionId":"..."}
{"type":"error","message":"..."}
```

- `activity_recommendation`：推荐进入某活动详情
- `conversation_patch`：会话状态更新（当前主要为 `idle`）
- `error`：请求失败或流异常

**环境变量**：`TARO_APP_WS_URL`（或 `TARO_APP_AI_CHAT_WS_URL`），或从 `TARO_APP_API_BASE_URL` 自动推导 `ws(s)://…/api/ai/chat/ws`。

### AI WebSocket 可靠性（客户端）

两层重试，均复用同一 `sessionId`（`sessionStorage` / `useChatSession`）：

| 层级 | 位置 | 行为 |
|------|------|------|
| 连接 | `utils/aiChatWs/pool.ts` | `connectSocket` 失败时最多重试 2 次，退避 400ms × 2^n |
| 整轮 | `utils/aiChatWs/stream.ts` | 传输失败且**未收到任何流式帧**时再试 1 次（共 2 轮）；已收到 `delta` 等部分内容则不自动重发，用户可手动再发 |
| 会话恢复 | `GET /api/chat/sessions/:id` | 进入 AI 页拉历史；每轮 `send` 带持久化 `sessionId` |

不重试：`AbortError`、业务 `error` 帧、401 / 登录过期。

### GET `/api/chat/sessions/:sessionId`

恢复 AI 对话历史（进入 AI 页时调用）。

---

## REST 接口（当前已实现）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/home` | 首页聚合（热度、`signupEvents`） |
| GET | `/api/activities` | 活动列表（当前 catalog legacyId：`1` TML、`4` 风暴、`5` EDC Thailand） |
| GET | `/api/activities/resolve?keyword=` | 活动关键词解析（按 code / 名称 / 别名查找） |
| GET | `/api/activities/:legacyId` | 活动详情 |
| GET | `/api/profile` | 个人资料摘要 |
| GET | `/api/profile/activities` | 我的报名活动 |
| GET/PATCH | `/api/users/me` | 当前用户资料（Query 身份） |
| POST/DELETE | `/api/activities/:legacyId/register` | 活动报名 / 取消 |
| GET | `/api/activities/:legacyId/live-info` | 现场资讯快照：`zones`、`viewer`、`summary`、`certCount`、`feed`；Query 可选 `zoneTag`、`categoryId`、`certifiedOnly=true` |
| POST | `/api/activities/:legacyId/live-info/wristband` | 提交手环图 `{ imageUrl }`（`cloud://` fileID 或本地 dev `/uploads/` URL；当日认证） |
| DELETE | `/api/activities/:legacyId/live-info/wristband` | 清除当日认证 |
| POST | `/api/activities/:legacyId/live-info/updates` | 发布 `{ zoneTag, ratings: [{ categoryId, score }], remark? }`（须当日认证；5 分钟冷却、每小时上限、同内容 24h 内不可重复） |
| POST | `/api/activities/:legacyId/live-info/updates/:updateId/like` | 点赞切换 |
| GET | `/api/notifications` | 通知列表 |
| GET | `/api/notifications/unread-count` | 未读数 |
| PATCH | `/api/notifications/:id/read` | 单条已读 |
| PATCH | `/api/notifications/read-all` | 全部已读 |
| POST | `/api/auth/logout` | 退出登录（Bearer）；吊销其它设备 JWT |
| POST | `/api/activities/:legacyId/travel-guide/generate` | AI 出行攻略（出发地、人数、预算档、是否自驾等；POI/路线来自高德） |
| GET | `/api/travel-guide/place-suggestions` | 出发地输入提示（高德 inputtips + 本地城市库） |

后端地图链路见 `sync-app-backend/docs/TRAVEL_GUIDE_MAP.md`；需配置 `AMAP_KEY`。

**UGC 文本**（现场资讯备注 / AI 用户消息 / 资料编辑 / 举报说明等）在落库前可调用微信 `msg_sec_check`（需 `WECHAT_CONTENT_SECURITY_ENABLED=true` 且配置小程序 AppId/Secret）。

### GET `/api/activities/:legacyId/itinerary/schedule`

响应含 `schedulePublished: boolean` — 无官方演出时间表时为 `false`，前端禁止「生成时间表」并提示等待官宣。

### 帖子

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/posts/popular` | 热门帖 |
| GET | `/api/posts?activityLegacyId=` | 活动帖分页 |
| GET | `/api/posts` | 当前用户帖子（owner） |
| POST | `/api/posts` | 创建模板帖 |
| DELETE | `/api/posts/:id` | 删除自己的帖 |
| GET | `/api/posts/:id/comments` | 评论列表 |
| POST | `/api/posts/:id/comments` | 发表评论 |
| POST | `/api/posts/ai-search` | AI 搭伴检索 |
| GET | `/api/profile/posts` | 个人页我的帖子 |

**已移除**：`PATCH /api/posts/:id`、`POST /api/posts/:id/like`、`GET /api/posts/:id/navigation-target`

### 消息通知

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/notifications` | 通知列表（过滤历史点赞/评论/组队申请） |
| GET | `/api/notifications/unread-count` | 未读数（同上过滤） |
| PATCH | `/api/notifications/:id/read` | 单条已读 |
| PATCH | `/api/notifications/read-all` | 全部已读 |
| DELETE | `/api/notifications/:id` | 删除单条（若实现） |

前端通知页 Tab：**全部** / **系统**。不再推送或展示点赞/评论类通知。

### 通知 `meta`（深链，可选）

```json
{
  "activityLegacyId": 4,
  "postId": "665a…",
  "type": "activity_update",
  "changeSummary": "地点已更新"
}
```

- `type`：`activity_update` | `post_rejected` | `post_hidden`（跳转个人页）| `activity` — 按类型跳转活动详情 / AI 助手 / 个人页
- `activityLegacyId`：深链必填；前端 `navigateFromNotification` 直接读取，**不**再请求 `/posts/:id/navigation-target`
- `postId`：可选，跳转活动详情时用于高亮对应留言
- **已废弃（列表不返回）**：`like` | `comment` | `comment_reply` | `application`

---

## REST 接口（用户与报名）

### `GET/PATCH /api/users/me`

需 `Authorization: Bearer`。

GET 响应 `data`：`{ id, name, handle, location, bio, avatar, city?, favorGenres?, budgetLevel?, accountRisk? }`

`accountRisk`（仅受限时返回）：`{ status: 'restricted' | 'banned', postBlockedUntil?, message?, reasonCode?, appealHint? }`。

- `reasonCode`：`scalper` | `content` | `reports`（用户可读原因分类，不含内部违规明细）
- `appealHint`：引导至「设置 → 申诉说明」的固定文案

受限时前端应 `invalidate users/me` 并展示提示。

PATCH body（均可选）：`name`, `handle`, `location`, `bio`, `avatar`, `city`, `favorGenres`, `budgetLevel`

### `GET /api/reports/status`

- **已登录**：仅 Bearer
- **未登录（开发）**：Query `userId`

Query：`targetType=user` | `comment`、`targetId`

响应 `data`：`{ reported: boolean, category?: 'ads'|'scalper'|'vulgar', createdAt?: string, reviewStatus?: 'pending'|'acknowledged' }`（仅当前登录用户对单目标的举报记录；`acknowledged` 表示已对相关内容/账号采取限制，可与账号风控联动）

### `POST /api/reports`

（见既有实现）提交后前端展示处理说明 Modal；菜单打开时先查 `GET /reports/status` 展示「已举报」并禁止重复提交。

---

**账号风控**（`GET /users/me` 在受限时返回 `accountRisk`：`status`、`postBlockedUntil`、`message`、`reasonCode`、`appealHint`）：

- 累计 **黄牛类违规** 或 **被举报黄牛** 达阈值 → `restricted`（默认 7 天）或 `banned`（30 天）
- 受限期间部分 UGC / 互动接口返回 **403**
- 违规事件写入 `AccountRiskEvent`；`duplicate` 不计入升级

**画像自动写入**（`city` / `favorGenres` / `budgetLevel`，有变化才 `PATCH`）：

- 专属行程 `POST /api/activities/:legacyId/travel-guide/generate`（出发地→`city`，住宿档位→`budgetLevel`）

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
| 展示用 userId/昵称 | `src/utils/session.ts` |
| 活动上下文 | `src/stores/navigationStore.ts`（`activeActivityLegacyId`） |

---

## 已移除（勿再文档化）

- `/api/tickets`、`/api/pindan` 及相关 profile 拼单接口
- 探索 Tab、`pages/explore`、`packageEvent/pages/posts` 及 `GET /posts/all`
- **组队帖子全链路**（2026-06）：`PartnerModule`、`POST/GET/DELETE /api/posts`、`post_created` WS 帧、前端帖流 UI
