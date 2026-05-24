# Sync App — API（AI 对话 SSE）

## POST `/ai/chat`

流式 AI 对话。客户端使用 **`fetch` + `response.body`（ReadableStream）** 读取 SSE，按 token 增量渲染打字机效果。

### Request

```http
POST /ai/chat
Content-Type: application/json
Accept: text/event-stream
Authorization: Bearer <token>   # 可选
```

```json
{
  "messages": [
    { "role": "assistant", "content": "欢迎语…" },
    { "role": "user", "content": "想拼 EDC 门票" }
  ]
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
| `done` | `messageId?: string` | 流结束 |
| `error` | `message: string` | 错误，前端展示并停止 |

也支持 `data: [DONE]` 或纯文本 `data: 片段` 作为 delta。

### 前端接入

- 环境变量：`TARO_APP_AI_CHAT_URL=https://api.example.com/ai/chat`
- 未配置时使用 mock 流式输出（开发态）
- 实现：`src/utils/aiChatStream.ts`、`src/hooks/useAiChatStream.ts`
