# 前端改造 Checklist

> 目标：网关鉴权 + User / Activity / AiAssistant 对齐  
> 后端对照：`sync-app-backend/docs/archive/BACKEND-REFACTOR-CHECKLIST.md`  
> API 契约：`docs/API.md`  
> **策略**：H5 业务先行；登录 / JWT **整段后置**。

---

## 进度总览

| 阶段 | 主题 | 状态 |
|------|------|------|
| P1 | 读路径 + 去静态化 | ✅ 完成 |
| P2 | 活动详情（AI 咨询 / 行程入口） | ✅ 完成 |
| P3 | AI 对话 + activityLegacyId | ✅ 完成 |
| P4 | 信息架构与文档 | ✅ 完成 |
| P5 | 通知深链等收尾 | ✅ 完成 |
| P0-H5 | Dev 登录 + Bearer | ✅ 前端已接 |
| P0-Wx | 微信小程序 | 🟡 前端已接，联调验收 |
| P0-perf | AI 流式渲染性能 | ✅ 完成 |
| P1-perf | 预加载 / 缓存分层 | ✅ 完成 |
| P3-perf | 图片懒加载 / Zustand 细粒度订阅 | ✅ 完成 |
| P2-perf | 包体与依赖治理 | ✅ 完成 |
| P3-dev | check / husky / CI | ✅ 完成 |
| AE | 活动域 `domains/` + `@sync/*-contracts` | ✅ 完成 |

**产品约定**：首页为活动报名列表；活动详情提供 AI 咨询、出行攻略与行程入口；无帖流。

**工程**：`npm run check`；pre-commit lint-staged；CI 见 `.github/workflows/ci.yml`；工作区 [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md)。

---

## 当前身份

- **未登录（demo REST）**：`ownerQueryParams()` → Query **仅** `userId`
- **已登录**：`Authorization: Bearer`；`ownerQueryParams()` 返回 `{}`
- `getClientUserId()` / `getClientUserName()` — JWT-aware（session + authStorage）
- **AI WebSocket**：upgrade Bearer → actor 来自 JWT；`buildAiChatWsSendActor()`（见 [DATA-LAYER.md](./DATA-LAYER.md))

---

## 已完成摘要

### P1 — 读路径 ✅

- [x] `pages/events` — `useEventList()` → `GET /activities`
- [x] 首页精选 — `useFeaturedEvents()` → `/home.signupEvents`
- [x] 活动详情 — `useActivityDetailQuery()` → `GET /activities/:legacyId`
- [x] `apiMappers.ts` 映射后端 DTO

### P2 — 活动详情 ✅

- [x] `syncApi`：`registerForActivity`、`cancelActivityRegistration`、`fetchCurrentUser`、`updateCurrentUser`
- [x] 首页「加入」→ `POST /activities/:legacyId/register`
- [x] `domains/partner-feed/` — `EventDetailComposerSection`、行程菜单（AI 咨询入口）
- [x] `useEventDetailPage` + `useEventDetailRoute` + `useEventDetailTravelGuide`

### P3 — AI 对话 ✅

- [x] `goAiAssistant({ activityLegacyId })`；`navigationStore`
- [x] `useAiChatStream`：`activityLegacyId` body + `X-Activity-Id` header
- [x] 流式事件：`delta` / `activity_recommendation` / `conversation_patch` / `suggested_replies` / `done`

### P4 — 信息架构 ✅

- [x] 探索 Tab 已移除（`pages/explore`、底栏入口）
- [x] `docs/API.md` 与 `syncApi.ts` 一致
- [x] Mock 模式：`!isApiEnabled()` 仍可本地演示

### 组件架构 ✅

- [x] Profile 域迁入 `src/components/profile/` + barrel
- [x] `EventDetailComposerSection`；[COMPONENT-ARCHITECTURE.md](./COMPONENT-ARCHITECTURE.md)
- [x] `AiAssistantChat` 抽出至 `packageAi/pages/ai-assistant/`
- [x] `components/ui/Button` 统一业务按钮
- [x] `components/navigation/` — 导航壳迁移

### 数据层 ✅

- [x] [`api/requestContext.ts`](src/api/requestContext.ts) — `ownerQueryParams` / `resolveRequestUserId`
- [x] [`api/sync/`](src/api/sync/) — activities / users / profile / notifications / travel-guide / …
- [x] [`hooks/sync/`](src/hooks/sync/) — Query hooks 按域拆分；`useSyncApi.ts` barrel
- [x] [DATA-LAYER.md](./DATA-LAYER.md) — REST vs WS 身份表
- [x] `constants/queryCache.ts` — staleTime 分层

### 性能 ✅

- [x] **预加载**：`preloadRule` `network: 'wifi'`；Tab 级 `preloadHotRoutes`
- [x] **详情种子**：`seedActivityDetailsFromHomeSummary` + `goEventDetail` 补种缓存
- [x] **AI 流式**：`throttleRaf` + `patchChatMessage` + `ChatMessageRow` memo
- [x] **包体**：`components/icons` 单入口；`verify:bundle` 主包边界；`build:weapp:size` CI 门禁
- [x] **Zustand**：`navigationSelectors` 细粒度订阅

详见 [BUNDLE-SIZE.md](./BUNDLE-SIZE.md)。

### 登录与鉴权 ✅

- [x] `src/utils/auth.ts` — `loginWithWechat` + `ensureAuth`
- [x] `apiClient` Bearer + 401（`handleApiUnauthorized.ts`）
- [x] `LoginPromptHero` / `loginWithWechat`（weapp）
- [x] B2：无效 Bearer → REST 401 + WS 清 session
- [x] `api/sync/ownerQuery.contract.test.ts`

### 通知与收尾 ✅

- [x] 通知页：按 `meta` 跳转活动详情 / 个人页
- [x] `smoke:ws` 自动化（见 [WECHAT-E2E.md](./WECHAT-E2E.md)）

---

## 待办

### P0-Wx（微信小程序）

- [ ] 开发者工具 / 真机人工验收（HTTPS 合法域名 + `POST /auth/wechat`；见 [WECHAT-E2E.md](./WECHAT-E2E.md)）

---

## 明确不做

- [x] Explore 功能与底栏入口（已删除）
- [ ] 独立登录页（业务期后置）

---

## API 对照表

| 方法 | 路径 | 前端状态 |
|------|------|----------|
| POST | `/auth/wechat` | ✅ |
| GET/PATCH | `/users/me` | ✅ |
| GET | `/home` | ✅ |
| GET | `/activities`… | ✅ |
| POST/DELETE | `/activities/:id/register` | ✅ |
| GET | `/profile` / `/profile/activities` | ✅ |
| GET/PATCH | `/notifications/*` | ✅ |
| POST | `/activities/:id/travel-guide/generate` | ✅ |
| WS | `/ai/chat/ws` | ✅ |
| GET | `/chat/sessions/:id` | ✅ |

---

## 关键文件索引

```
src/
├── api/requestContext.ts       ownerQueryParams（身份单点）
├── api/sync/*.ts               REST 按域
├── api/syncApi.ts              barrel
├── hooks/sync/*.ts             React Query 按域
├── hooks/useSyncApi.ts         barrel
├── constants/queryCache.ts     staleTime 分层
├── components/icons/index.ts   Lucide 单入口
├── hooks/ai-chat/useWsChatStream.ts  WS 流 + rAF 打字机
├── utils/throttleRaf.ts        rAF 节流
├── utils/chatMessages.ts       patchChatMessage
├── components/ai-chat/         消息列表 / 输入 / 攻略卡片
├── stores/navigationStore.ts   AI 跳转 activityLegacyId
├── pages/events/               活动列表
├── pages/index/                首页精选活动
├── pages/profile/              个人 Tab
├── domains/partner-feed/       活动详情 AI 咨询 / 行程菜单
├── domains/travel-guide/       出行攻略
├── packageEvent/pages/event-detail/
└── packageAi/pages/ai-assistant/  AiAssistantChat + legacy redirect
```

---

## 测试目录布局

- `test/unit/domains/**` 镜像 `src/domains/**`
- `test/unit/packageEvent/**` 分包页尚未迁入 domains 的用例

---

## 验收标准

### 核心功能 ✅

- [x] 活动 Tab / 详情数据来自 API
- [x] 首页「加入」报名有效
- [x] 活动页 → AI 助手（带 `activityLegacyId`）→ 攻略 / 活动推荐
- [x] 探索 Tab 已下线

### P0（登录）✅

- [x] Bearer 鉴权；业务 REST 身份仅走 Header
- [x] 401 有清晰提示并清 session

### 性能 ✅

- [x] AI 流式：`throttleRaf` + `patchChatMessage` + memo 消息行
- [x] Wi‑Fi 分包预加载 + Tab 级 `preloadHotRoutes`
- [x] `verify:bundle` + `build:weapp:size` CI 门禁

---

## 备注

- 后端架构：`sync-app-backend/docs/ARCHITECTURE.md`
- 主发布端为 **weapp**；H5 仅本地调试（见 [README.md](../README.md)）
