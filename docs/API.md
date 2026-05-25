# Sync App — API（AI 对话 SSE）

## POST `/api/ai/chat`

流式 AI 对话。客户端使用 **`fetch` + `response.body`（ReadableStream）** 读取 SSE，按 token 增量渲染打字机效果。

### Request

```http
POST /api/ai/chat
Content-Type: application/json
Accept: text/event-stream
Authorization: Bearer <token>   # 可选
```

```json
{
  "messages": [
    { "role": "assistant", "content": "欢迎语…" },
    { "role": "user", "content": "查 EDC 门票" }
  ],
  "sessionId": "optional-session-id",
  "userId": "optional-user-id"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `messages` | `{ role, content }[]` | `role`: `user` \| `assistant` \| `system` |

### Response

`Content-Type: text/event-stream`，每条事件一行 `data:`：

```
data: {"type":"delta","content":"正在"}
data: {"type":"delta","content":"为你搜索"}
data: {"type":"done","messageId":"msg_abc"}
```

| `type` | 字段 | 说明 |
|--------|------|------|
| `delta` | `content: string` | 增量文本，前端 append |
| `done` | `messageId?: string`, `sessionId?: string`, `ticketId?: string` | 流结束 |
| `error` | `message: string` | 错误，前端展示并停止 |

### GET `/api/chat/sessions/:sessionId`

按 `sessionId` 读取 MongoDB 中的完整对话历史，进入 AI 页时用于恢复 UI。

```json
{
  "code": 200,
  "data": {
    "sessionId": "1730-abc",
    "history": [
      { "role": "user", "content": "想出一票 EDC" },
      { "role": "assistant", "content": "好的，请补充…" }
    ]
  }
}
```

服务端在 `POST /api/ai/chat` 时会将 MongoDB 历史与本次用户消息合并后传给通义千问，并在回复完成后写回完整对话。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/chat/sessions/:sessionId` | AI 对话历史 |

也支持 `data: [DONE]` 或纯文本 `data: 片段` 作为 delta。

## 前端接入

环境变量（`.env`）：

```
TARO_APP_API_BASE_URL=http://localhost:3000/api
TARO_APP_AI_CHAT_URL=http://localhost:3000/api/ai/chat
```

H5 开发态也可只配 `TARO_APP_API_BASE_URL=/api`，由 `config/index.ts` devServer 代理到 `localhost:3000`。

### REST（响应格式 `{ code, message, data }`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/activities` | 活动列表 |
| GET | `/api/activities/match?keyword=edc` | 活动匹配 |
| GET | `/api/tickets?activityId=&type=` | 门票挂单 |
| POST | `/api/tickets` | 创建门票挂单 |
| GET | `/api/home` | 首页聚合（热度条 / 活动报名 / 热拼排行 / 票区） |
| GET | `/api/activities/:legacyId` | 按前端 activityId 查活动 |
| GET | `/api/pindan?activityId=&type=&keyword=` | 拼单列表（type: package/hotel/transport） |
| POST | `/api/pindan` | 创建拼单 |
| POST | `/api/pindan/:legacyId/join` | 加入拼单（body: `{ userId? }`，返回 ProfilePinDanItem） |
| DELETE | `/api/pindan/:legacyId/join?userId=` | 退出拼单 |
| GET | `/api/profile/pindan?userId=` | 我的拼单列表 |

### SSE 对话

- 实现：`src/utils/aiChatStream.ts`、`src/hooks/useAiChatStream.ts`
- 业务数据：`src/api/syncApi.ts`、`src/hooks/useSyncApi.ts`
- 未配置 `TARO_APP_API_BASE_URL` 时使用 mock 数据（开发态）
