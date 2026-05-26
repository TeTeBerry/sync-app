# 前端改造 Checklist

> 目标：网关鉴权 + User / Activity / Partner / AiAssistant 四模块对齐  
> 后端对照：`sync-app-backend/docs/BACKEND-REFACTOR-CHECKLIST.md`  
> API 契约：`docs/API.md`  
> **策略**：H5 业务先行；登录 / JWT **整段后置**。

---

## 进度总览（2025-05 更新）

| 阶段 | 主题 | 状态 |
|------|------|------|
| P1 | 读路径 + 去静态化 | ✅ 完成 |
| P2 | 互动（无发帖表单） | ✅ 完成 |
| P3 | AI 闭环 + activityId | ✅ 完成 |
| P4 | 信息架构与文档 | ✅ 完成 |
| P5 | 通知深链等收尾 | ✅ 完成 |
| P0-H5 | Dev 登录 + Bearer | ⬜ 登录之后 |
| P0-Wx | 微信小程序 | ⬜ 更晚 |

**产品约定**：组队帖 **仅 AI 对话闭环创建**，不新增发帖表单 UI。

---

## 当前身份

- `getClientUserId()` / `getClientUserName()` + `syncApi.ownerParams()`
- 后端 `demo-owner.util.ts` + Query
- 登录后一次性切 Bearer，删 Query（与后端 P0 同 PR）

---

## 已完成摘要

### P1 ✅

- [x] `pages/events` — `useEventList()` → `GET /activities`
- [x] 首页精选 — `useFeaturedEvents()` → `/home.signupEvents`
- [x] 活动详情 — `useActivityDetailQuery()` → `GET /activities/:legacyId`
- [x] 热帖 / 活动帖 / 我的帖子 — 已有 hooks
- [x] `apiMappers.ts` 映射后端 DTO

### P2 ✅（无发帖 UI）

- [x] `syncApi`：`updatePost`、`likePost`、`commentPost`、`applyToPost`（`createPost` 仅 API 层，**无页面调用**）
- [x] `syncApi`：`registerForActivity`、`cancelActivityRegistration`、`fetchCurrentUser`、`updateCurrentUser`
- [x] 首页「加入」→ `POST /activities/:legacyId/register`
- [x] 首页 / 活动详情：点赞、评论（H5 `promptText`）、申请加入
- [x] 个人页：编辑正文、标记完成 → `PATCH /posts/:id`
- [x] `invalidatePostQueries` 统一刷新

### P3 ✅

- [x] `goAiAssistant({ activityLegacyId })`；`navigationStore`
- [x] `useAiChatStream`：`activityLegacyId` body + `X-Activity-Id` header
- [x] SSE `post_created` → toast + invalidate 帖列表
- [x] 审核拒绝：后端 `delta` 文案展示（无单独事件类型）

### P4 ✅

- [x] 探索 Tab 从 `BottomNav` 隐藏（页面保留）
- [x] `docs/API.md` 与 `syncApi.ts` 一致
- [x] Mock 模式：`!isApiEnabled()` 仍可本地演示

---

## 待办 / 可选

### P5 收尾 ✅

- [x] 通知页：按 `meta` 跳转活动详情 / 帖子（深链）
- [ ] `authorName` 身份用途弱化（登录期一次性切换）
- [x] `useProfileParticipatedItems` 与 `/profile/activities` 去重评估（个人页用 `useProfileActivitiesQuery`，已移除未使用 hook）
- [x] 删除遗留 `profileParticipated.ts`、`ProfileParticipatedList.tsx`；`profilePageStore` 移除废弃 `activeTab`

### P0-H5（登录之后）

- [ ] `src/utils/auth.ts` — `POST /auth/dev`
- [ ] `apiClient` Bearer + 401
- [ ] 删除 `ownerParams()` Query
- [ ] `getClientUserId()` 改 JWT `sub`

### P0-Wx（更晚）

- [ ] `wx.login` → `POST /auth/wechat`

---

## 明确不做

- [ ] 活动详情 / 独立页 **发帖表单**（产品：仅 AI 闭环）
- [ ] Explore 功能与底栏入口
- [ ] 登录页（业务期）

---

## API 对照表

| 方法 | 路径 | 前端状态 |
|------|------|----------|
| POST | `/auth/dev` | ⬜ |
| GET/PATCH | `/users/me` | ✅ `syncApi` + `useCurrentUserQuery` |
| GET | `/home` | ✅ |
| GET | `/activities`… | ✅ |
| POST/DELETE | `/activities/:id/register` | ✅ 首页「加入」 |
| GET | `/posts/popular`、按活动/owner | ✅ |
| POST | `/posts` | 🟡 API 有，UI 不调（AI 发帖） |
| PATCH/DELETE | `/posts/:id` | ✅ |
| POST | `/posts/:id/like|comments|applications` | ✅ |
| GET | `/profile`… | ✅ |
| POST | `/ai/chat` (SSE) | ✅ |
| GET | `/chat/sessions/:id` | ✅ |
| GET/PATCH | `/notifications/*` | ✅ 列表 + 深链 |

---

## 关键文件索引

```
src/
├── api/syncApi.ts              ownerParams + REST
├── hooks/useSyncApi.ts         queries + mutations + invalidatePostQueries
├── hooks/useAiChatStream.ts    SSE + post_created
├── utils/aiChatStream.ts       流解析
├── stores/navigationStore.ts   AI 跳转 activityLegacyId
├── pages/events/               活动列表 API
├── pages/event-detail/         详情 + 互动 + goAiAssistant
├── pages/index/                精选活动 + 热帖互动
├── pages/profile/              我的帖 edit/complete
└── components/AiAssistantPage  activityId + post_created toast
```

---

## H5 开发

```bash
TARO_APP_API_BASE_URL=/api
TARO_APP_AI_CHAT_URL=/api/ai/chat
npm run dev:h5
```

---

## 验收标准

### P1–P3 ✅

- [x] 活动 Tab / 详情数据来自 API（API 模式）
- [x] 点赞、评论、申请刷新后仍存在
- [x] 活动页 → AI → 发帖 → 活动下可见帖子
- [x] 探索 Tab 未在底栏上线

### P0（登录期）

- [ ] Bearer 鉴权，无 Query 身份
- [ ] 401 有清晰提示

---

## 备注

- 新接口继续传 Query，直到 P0 与后端同步切换。
- 后端架构：`sync-app-backend/docs/ARCHITECTURE.md`。
