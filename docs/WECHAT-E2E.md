# 微信小程序 E2E 验收

> 自动化：`sync-app-backend` 的 `npm run smoke:ws`（REST + AI WebSocket）。  
> 本文档为**人工**真机/开发者工具清单。  
> 对照：[API.md](./API.md#微信小程序) · [FRONTEND-REFACTOR-CHECKLIST.md](./FRONTEND-REFACTOR-CHECKLIST.md)

## 环境

| 项 | 要求 |
|----|------|
| `TARO_APP_API_BASE_URL` | HTTPS 业务 API（公众平台 request 合法域名） |
| `TARO_APP_AI_CHAT_WS_URL` | `wss://…/api/ai/chat/ws`（socket 合法域名） |
| 后端 `AUTH_MODE` | 含 `wechat`；`POST /api/auth/wechat` 可用 |
| 本地联调 | 开发者工具勾选 **不校验合法域名** 时可用 `http://` / `ws://` 局域网 |
| 真机 / 体验版 | ICP 备案 + HTTPS 合法域名（见 [API.md](./API.md#微信小程序)） |

## 流程

1. **退出登录**（若有）— 确认 `shouldSkipAutoLogin` 后不会自动 `wx.login`
2. **拦截登录** — 活动/个人页 `LoginPromptHero` → 授权昵称头像 → Bearer 写入 storage
3. **静默登录** — 冷启动 `ensureAuth({ requireProfile: false })` 不弹授权（已登录用户）
4. **通知** — 打开通知列表；抓包确认 **无** demo Query `userId`（仅 Bearer）
5. **AI 对话** — 进入 AI 助手发一条消息：
   - WS upgrade 含 `Authorization`
   - `send` body **无** `userId`/`userName`（已登录）
   - 收到 `connected` 且 `auth: "jwt"`（dev 日志）
6. **401 / 过期** — 将 storage 中 token 改为无效值 → 任意 REST 或 AI 发消息 → toast「登录已过期」且 session 清空

## 失败排查

| 现象 | 检查 |
|------|------|
| REST 仍带 `userId=` Query | 是否真有 Bearer；`hasAuthenticatedRequest()` |
| AI「缺少用户身份」 | upgrade 是否带 Bearer；B1 `buildAiChatWsSendActor` |
| WS 立即 error 登录过期 | token 无效（B2）；重新微信登录 |
| 无法连接 WS | 合法域名、`wss://`、路径 `/api/ai/chat/ws` |

## Checklist 勾选

在 [FRONTEND-REFACTOR-CHECKLIST.md](./FRONTEND-REFACTOR-CHECKLIST.md) **P0-Wx** 小节勾选「开发者工具真机预览全流程验收」。
