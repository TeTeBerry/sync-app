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
- [x] WebSocket `post_created` → toast + invalidate 帖列表
- [x] 审核拒绝：后端 `delta` 文案展示（无单独事件类型）

### P4 ✅

- [x] 探索 Tab 已移除（`pages/explore`、底栏入口、`packageEvent/pages/posts` 全量帖页）
- [x] `docs/API.md` 与 `syncApi.ts` 一致
- [x] Mock 模式：`!isApiEnabled()` 仍可本地演示

---

## 组件架构 ✅（2026-06）

- [x] `src/types/post.ts` — 帖子类型统一导出入口；移除 `ActivityPost`（改用 `HomeFeedPost`）
- [x] Profile 域迁入 `src/components/profile/` + `index.ts` barrel
- [x] `ProfileSummarySection` / `ProfileSettingsSection` / `ProfileDebugSection`
- [x] `EventDetailComposerSection` / `EventDetailEntitlementModals`
- [x] [COMPONENT-ARCHITECTURE.md](./COMPONENT-ARCHITECTURE.md) 三层规则与决策表
- [x] `ProfileBenefitsBlock` / `ProfileDebugModalsHost`
- [x] `eventPostNormalize` + `useEventDetailPosts`
- [x] `CountdownPart` → `types/home.ts`；Vitest Taro compile flags

### 组件债 · Taro `Button` 待迁 `components/ui` ✅

业务代码已统一使用 `components/ui/Button`（`open-type` 等微信属性经 wrapper 透传）。

**例外（保留 Taro 直引）**：仅 [`components/ui/Button.tsx`](sync-app/src/components/ui/Button.tsx) 实现层。

<details>
<summary>已迁移文件清单（归档）</summary>

- [x] `components/auth/*`、`Post*`、`PageNavigation`、`ListState`、`BottomNav`、`ActionSheet`
- [x] `components/AiAssistantPostCard`、`event-map/EventMapUserPostsSheet`
- [x] `components/ai-chat/*`（含 `ChatMessageList`、`ChatComposer`、`SuggestedReplyChips` 等）
- [x] `components/profile/ProfilePostsSection`、`ProfileTabErrorBoundary`、`ProfileCollapsibleSection`
- [x] `pages/events/index`、`pages/profile` 相关、`event-detail/index`（fallback）
- [x] `packageProfile/pages/settings`、`notifications`
- [x] `packageEvent/pages/my-itinerary`、`exclusive-itinerary/**`、`event-map`
- [x] `packageEvent/pages/event-detail/components/**`

</details>

### 后续 Phase（未排期）

- [ ] `AiAssistantPage` 迁入 `packageAi/pages/ai-assistant/` 同目录
- [ ] `my-itinerary` / `exclusive-itinerary` 拆 `components/`

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
- [x] Explore 功能与底栏入口（已删除，不做）
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
| WS | `/ai/chat/ws` | ✅ |
| GET | `/chat/sessions/:id` | ✅ |
| GET/PATCH | `/notifications/*` | ✅ 列表 + 深链 |

---

## 关键文件索引

```
src/
├── api/syncApi.ts              ownerParams + REST
├── hooks/useSyncApi.ts         queries + mutations + invalidatePostQueries
├── hooks/useAiChatStream.ts    WebSocket + post_created
├── utils/aiChatStream.ts       流解析
├── stores/navigationStore.ts   AI 跳转 activityLegacyId
├── pages/events/               活动列表 API
├── pages/event-detail/         详情 + 互动 + goAiAssistant
├── pages/index/                精选活动 + 热帖互动
├── pages/profile/index.tsx     个人 Tab 编排
├── components/profile/         个人中心域 UI + 权益
├── types/post.ts               帖子类型导出入口
└── components/AiAssistantPage  activityId + post_created toast
```

---

## H5 开发

```bash
TARO_APP_API_BASE_URL=/api
TARO_APP_AI_CHAT_WS_URL=ws://127.0.0.1:3000/api/ai/chat/ws
npm run dev:h5
```

---

## 验收标准

### P1–P3 ✅

- [x] 活动 Tab / 详情数据来自 API（API 模式）
- [x] 点赞、评论、申请刷新后仍存在
- [x] 活动页 → AI → 发帖 → 活动下可见帖子
- [x] 探索 Tab 与全量帖栈页已下线；首页仅展示热门帖预览

### P0（登录期）

- [ ] Bearer 鉴权，无 Query 身份
- [ ] 401 有清晰提示

---

## 备注

- 新接口继续传 Query，直到 P0 与后端同步切换。
- 后端架构：`sync-app-backend/docs/ARCHITECTURE.md`。
