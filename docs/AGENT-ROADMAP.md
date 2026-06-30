# Agent 路线图 · 用户目标 / 情境推送 / 开放互操作 / 微信 AI 入口

> **定位**：在现有 Scene Agent（L0/L1）+ 长任务 Job（L2）+ Hermes Scout + NoticeAgent 之上，新增 **用户目标（L3）**、**情境推送**、**开放读 API**，并为 **微信 AI 生态** 预留统一原子能力入口。  
> **原则**：小程序内仍 **无聊天 Tab**；AI 只做 **检索 / 生成草稿 / 预填 / 提醒**；用户确认后才发布 UGC。  
> **关联**：[PRODUCT.md](./PRODUCT.md) · [SCENE-AGENT.md](./SCENE-AGENT.md) · [API.md](./API.md) · [Q2-USER-STORIES.md](./Q2-USER-STORIES.md)

**最后更新**：2026-06-28

---

## 〇、优先级总览

| 阶段 | 名称 | 优先级 | 状态 | 交付物 |
|------|------|--------|------|--------|
| **P0** | 用户目标 + 阵容监控闭环 + 微信 AI 开放入口预留 | **最高 · 必须先完成** | 🔲 待启动 | Goal API · Scout 打通 · 草稿通知 · 原子能力契约层 |
| P1 | 情境推送 + 公开 Event Feed | 高 | 🔲 | ProactiveNudge · JSON-LD · `.ics` |
| P2 | 开放 MCP + Agent Task 泛化 | 中 | 🔲 | sync-mcp-server · `agent_tasks` |
| P3 | 微信 AI SKILL 正式接入 | 中（依赖微信内测开放提审） | 🔲 | SKILL 分包 · 内测分支 |
| P4 | 机票关注 + 位置情境 | 低 | 🔲 | FlightPriceAdapter · 位置开关 |

**铁律**：P1～P4 **不得阻塞 P0**；P0 中的「微信 AI 开放入口」仅做 **契约与扩展点**，不合入内测 SKILL 代码至正式提审包（见 [§七](#七微信-ai-接入p0-预留--p3-正式)）。

---

## 一、战略定位

### 1.1 我们不是什么

| 叙事 | 是否采用 |
|------|----------|
| 「Web 4.0 平台」 | ❌ 对外不用 |
| 「AI 智能匹配搭子」 | ❌ 合规红线 |
| 「全站对话 Agent / 聊天 Tab」 | ❌ 已下线，不恢复 |

### 1.2 我们是什么

**AI 增强的电音节社区小程序**：绑一场节后，**阵容监控、招募草稿、准备提醒** 主动触达用户；能力同时可通过 **REST / 未来微信 AI SKILL / 外部 MCP** 调用，但 UGC 发布权始终在用户确认环节。

### 1.3 能力分层（L0～L4）

```text
L0 规则      prep_nudge · lineup_announce_hint          （已有）
L1 单轮      POST /api/ai/scene-run + effects           （已有）
L2 长任务    travel-guide/generate · generation jobs    （已有）
L3 用户目标  user_goals + GoalOrchestrator              （P0 新建）
L4 外部入口  微信 AI SKILL · sync-mcp-server            （P0 预留 · P2/P3 实现）
```

与 [SCENE-AGENT.md §四](./SCENE-AGENT.md#四与现网-api-的关系) 一致：**scene-run 仍是小程序内唯一 AI HTTP 入口**；L3/L4 是编排层与外部入口，不新增小程序内对话页。

---

## 二、总体架构

```text
┌─────────────────────────────────────────────────────────────────┐
│  触达层                                                          │
│  · 小程序 UI（Scene effects · 通知 · 首页「我的下一场」）          │
│  · 微信订阅消息 + 站内 Notification                              │
│  · [P3] 微信 AI 对话 + GUI 卡片 → 跳转小程序（场景值 1442/1443）   │
│  · [P2] 外部 Agent（Cursor 等）via MCP                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  编排层（P0 新建）                                                │
│  GoalOrchestrator · UserContextService · ProactiveNudgeService   │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
  SceneRunService      AgentTaskService      NoticeAgent
  (L1 已有)            (P2 泛化 L2)          (已有)
        │                    │                    │
        └────────────────────┼────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  数据 / 运维层                                                    │
│  Hermes Scout watch · ActivityCatalogRefresh · Mongo · Redis     │
└─────────────────────────────────────────────────────────────────┘
```

### 2.1 原子能力契约层（P0 必建 · 全入口复用）

**所有外部入口（小程序 Scene、微信 AI 原子接口、MCP Tool、未来 H5）均调用同一套后端 Application Service**，禁止三套业务逻辑。

| 原子能力 ID | 后端 Service（现有/新建） | 读/写 | 合规 |
|-------------|---------------------------|-------|------|
| `searchFestivals` | `EventsKnowledgeSearchService` / catalog | 读 | ✅ |
| `getEvent` | `ActivityLookupPort` | 读 | ✅ |
| `getLineup` | `LineupCatalogService` | 读 | ✅ |
| `searchPublicRecruits` | `PostSearchService` via scene handler | 读 | ✅ 表述「检索公开招募」 |
| `draftRecruitPost` | `RecruitComposeSceneHandler` | 写草稿 | ✅ 无 publish |
| `subscribeLineupUpdates` | `ActivityRegistrationService` + `user_goals` | 写 | ✅ |
| `generateTravelGuide` | `TravelGuideGenerationJobService` | 写 Job | ✅ disclaimer |
| `publishRecruitPost` | — | — | ❌ **禁止暴露给任何 Agent 入口** |

契约包建议：`@sync/agent-capabilities-contracts`（P0 起建，与 `@sync/scene-contracts` 并列）。

---

## 三、P0 · 最高优先级（必须先完成）

> **目标**：用户绑活动 → 订阅阵容 → 后台监控 → 官宣/变更推送 → 可选招募草稿 → 用户进小程序确认。  
> **同时**：铺好微信 AI / MCP 共用的原子能力层，P3 只写 SKILL 壳，不改业务。

### 3.1 Story 清单

| ID | Story | 端 | 估时 |
|----|-------|-----|------|
| **US-AG-01** | `user_goals` 数据模型 + CRUD API | backend | M |
| **US-AG-02** | 活动详情「订阅阵容更新」与 Goal 绑定 | app + backend | S |
| **US-AG-03** | Scout / 清库后 → catalog refresh → GoalOrchestrator hook | backend + hermes | M |
| **US-AG-04** | 阵容官宣 → `NoticeAgent` 推送（增强 diff 摘要） | backend | S |
| **US-AG-05** | Goal 参数 `draftRecruitOnLineup` → scene-run 草稿 → artifact 存储 | backend | M |
| **US-AG-06** | 通知 deep link → 发帖 Sheet `prefill_form` | app | S |
| **US-AG-07** | `@sync/agent-capabilities-contracts` 原子能力类型 | backend packages | S |
| **US-AG-08** | Application Service 门面（AgentCapabilitiesService） | backend | M |
| **US-AG-09** | 微信 AI 扩展点文档 + `AGENTS.md` 模板 + `page-meta.json` 草案 | docs | S |

### 3.2 数据模型

#### `user_goals`

```typescript
interface UserGoal {
  goalId: string;                    // UUID
  userId: string;                    // openid 体系 clientUserId
  activityLegacyId: number;
  kind: 'watch_lineup' | 'watch_meta' | 'draft_recruit_on_lineup';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  params: {
    notifyWechat?: boolean;          // 默认 true，与 wechatActivityUpdateOptIn 对齐
    draftRecruitOnLineup?: boolean;  // 官宣后自动生成招募草稿
    departureCity?: string;          // 预填 recruit_compose / 未来机票
  };
  lastRunAt?: string;                // ISO
  lastResult?: {
    changeSummary?: string;
    snapshotHash?: string;
    artifactId?: string;             // 草稿 artifact
  };
  createdAt: string;
  updatedAt: string;
}
```

#### `user_goal_artifacts`

```typescript
interface UserGoalArtifact {
  artifactId: string;
  goalId: string;
  userId: string;
  activityLegacyId: number;
  kind: 'recruit_draft';
  payload: {
    candidates: BuddyPostComposeCandidate[];  // 来自 scene-run effects
    sceneContext?: Record<string, unknown>;
  };
  consumedAt?: string;               // 用户打开 Sheet 或发布后置位
  expiresAt: string;
}
```

### 3.3 API（P0）

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/goals` | 创建目标；body: `{ activityLegacyId, kind, params? }` |
| `GET` | `/api/goals` | 当前用户 active goals |
| `GET` | `/api/goals/:goalId` | 详情含 lastResult |
| `PATCH` | `/api/goals/:goalId` | 暂停/恢复/更新 params |
| `DELETE` | `/api/goals/:goalId` | 取消 |
| `GET` | `/api/goals/artifacts/:artifactId` | 取招募草稿（发帖 Sheet 预填） |
| `POST` | `/internal/catalog/lineup-changed` | Scout/脚本回调（内网/HMAC）→ Orchestrator |

**与现网合并**：`POST /api/goals` 且 `kind=watch_lineup` 时，同步调用现有 `setWechatActivityUpdateOptIn` + `register` 逻辑，不重复订阅流程。

### 3.4 GoalOrchestrator（P0 最小实现）

```text
触发源：
  1. ActivityCatalogRefreshService.refreshAfterLineupCatalogChange（已有）
  2. POST /internal/catalog/lineup-changed（Scout 完成后）
  3. [P1] cron ProactiveNudgeService

onLineupChanged(activityLegacyId, diff):
  goals ← find active user_goals where activityLegacyId
  for each goal:
    if diff.lineupPublished false→true or diff.artistsAdded:
      NoticeAgent.notifyActivityUpdate(...)           // 已有，扩展 changeSummary
      if goal.params.draftRecruitOnLineup:
        effects ← SceneRunService.run(recruit_compose)
        save user_goal_artifacts
        notify「已生成招募草稿，点击查看」
    update goal.lastRunAt / lastResult
```

**Hermes 衔接**：`scout watch` 或 `apply-tml-lineup-official.mjs` 在 `applyLineupSnapshot` 成功后，HTTP POST 至 backend internal 端点（或继续依赖现有 catalog refresh 轮询，P0 二选一，优先 **复用 ActivityCatalogRefreshService** 减少 moving parts）。

### 3.5 前端（P0）

| 位置 | 变更 |
|------|------|
| 活动详情 · 阵容未官宣横幅 | 升级 copy：「订阅阵容更新」；checkbox「阵容官宣后，帮我生成招募草稿」 |
| 通知点击 | `meta.type=activity_update` + `artifactId` → 活动详情 → 打开 buddy post Sheet + `prefill_form` |
| 我的 · 可选 | 「我的关注」列表 active goals（P0 可只做通知 deep link，列表可 P1） |

复用：`useActivityUpdateSubscribeAction` · `runActivitySubscribeToggle` · `applySceneEffects`。

### 3.6 P0 验收标准

- [x] 用户绑 Tomorrowland → 勾选订阅 + 草稿 → 创建 `user_goals` 记录
- [x] Hermes/清库触发 lineup 变更 → 已订阅用户收到站内通知 + 微信订阅消息（已 opt-in）
- [x] `lineupPublished: false → true` → changeSummary 含「阵容已官宣」
- [x] 勾选草稿的用户 → 收到第二条通知 → 点进 Sheet 见 3 条 AI 候选 → **用户手动选/改/发**
- [x] `AgentCapabilitiesService` 单测覆盖 4 个读能力 + `draftRecruitPost` + `subscribeLineupUpdates`
- [x] 文档：`docs/wechat-ai/AGENTS.md` 模板 + `page-meta.json` 草案就绪（见 §七）
- [x] **无** `publishRecruitPost` 暴露于任何 Agent 路径
- [x] grep 合规：`联系队友|配对成功|智能匹配|buddy-matching` 在 agent 相关新增代码中为 0

---

## 四、P1 · 情境推送 + 公开 Event Feed

### 4.1 Story 清单

| ID | Story | 状态 |
|----|-------|------|
| US-AG-11 | `UserContextService` 聚合（register · festivalPlan · favorGenres · lineup 状态） | ✅ |
| US-AG-12 | `ProactiveNudgeService` cron（L0 规则，不调 LLM） | ✅ |
| US-AG-13 | nudge 规则：未发帖 · 攻略未完成 · 阵容刚官宣未看 lineup | ✅ |
| US-AG-14 | `GET /api/public/events` JSON-LD + rate limit | ✅ |
| US-AG-15 | `GET /api/public/events/:legacyId.ics` 日历导出 | ✅ |
| US-AG-16 | 活动详情 / 分享 ·「添加到日历」 | ✅ |
| US-AG-17 | 首页「我的下一场」展示 Goal 进度摘要 | ✅ |

#### Scene 补齐（P1 优先 · ✅ 已完成）

| scene | Story | 状态 |
|-------|-------|------|
| `recruit_apply_compose` | Q2-44 招募评论区「申请加入」AI 草稿 | ✅ |
| `lineup_dj` | Q2-33/40 点 DJ 出简介 | ✅ |
| `festival_story` | Q2-41 活动详情「关于这场节」摘要 | ✅ |

### 4.2 ProactiveNudge 规则（L0 · 首批）

| 规则 ID | 条件 | 推送 copy（示例） |
|---------|------|-------------------|
| N1 | 已 register · 无 buddyPost · 距活动 < 30d | 「还差一步：发一条公开招募帖」 |
| N2 | lineup 刚官宣 · 未进 lineup 页 | 「阵容已出，去看看必看 Set」 |
| N3 | 有 travelGuide · 未 searchRecruits | 「用攻略条件找公开招募」→ prefill_query |
| N4 | 已 register · 24h 内新招募 ≥ 5 · 无帖 | 「这场节招募很活跃，去看看公开招募」 |
| N5 | 招募帖有新公开回复 | 已有 NoticeAgent |

**不做**：基于「匹配度」的推送 · 「N 人想联系你」。

### 4.3 公开 Event Feed

- 响应 `Accept: application/ld+json` 时返回 schema.org `MusicEvent`
- 字段映射 `@sync/activity-contracts` · `CatalogLineupArtist`
- `@Public()` + 现有 `PublicApiRateLimitService`
- OpenAPI regenerate：`npm run openapi:generate`

---

## 五、P2 · 开放 MCP + Agent Task 泛化

### 5.1 sync-mcp-server（独立包 /  repo）

```text
Tools（只读 + draft）:
  search_events(query, month?, region?)
  get_event(legacyId)
  get_lineup(legacyId)
  search_public_recruits(activityLegacyId, query)
  draft_recruit_post(...)        → 返回 draftId，无 publish

Resources:
  sync://events/catalog
  sync://events/{legacyId}
```

实现：HTTP 调 backend `@Public()` + JWT 用户态 draft 接口；**不 duplicate** `AgentCapabilitiesService` 以外的逻辑。

### 5.2 AgentTaskService

泛化 `TravelGuideGenerationJobService` → `agent_tasks`：

| 字段 | 说明 |
|------|------|
| `taskId` | UUID |
| `goalId?` | 关联 user_goal |
| `kind` | `travel_guide` · `flight_watch` · `recruit_draft` |
| `steps[]` | `{ stepId, status, artifactId? }` |
| `dedupeKey` | 同 travel guide |

---

## 六、P3 · 微信 AI 正式接入

> 依赖微信「小程序 AI 开发模式」内测 → 正式提审窗口。P0 仅预留；P3 在 **独立分支** 开发，不合入主分支提审直至官方允许。

### 6.1 官方能力摘要

| 项 | 说明 |
|----|------|
| 入口 | 用户对微信 AI 说话 → 调小程序 SKILL |
| 封装 | `AGENTS.md` + `SKILL.md` + `mcp.json` + 原子接口 + 原子组件 |
| 跳转 | 卡片右上角 → 小程序页面（场景值 1442/1443） |
| 反向 | 小程序 `wx.openAgent` · `wx.navigateBackAgent` |
| 限制 | 内测期 **勿将 agent 代码合入正式提审包** |

参考：[小程序 AI 开发模式接入指南](https://developers.weixin.qq.com/miniprogram/dev/ai/guide) · [接入方式](https://developers.weixin.qq.com/miniprogram/dev/ai/integration.html)

### 6.2 SKILL 规划

| SKILL | 原子接口 | 原子组件 | 关联页面 |
|-------|----------|----------|----------|
| `festival-search` | `searchFestivals` · `getEvent` · `getLineup` | `event-card` | `packageEvent/event-detail` |
| `recruit-discovery` | `searchPublicRecruits` | `recruit-list-card` | `packageEvent/event-detail` |
| `recruit-draft` | `draftRecruitPost` | `draft-candidates-card` | 发帖 Sheet 落地页 |
| `festival-prep` | `subscribeLineupUpdates` · `generateTravelGuide` | `prep-status-card` | `pages/index` |

### 6.3 小程序 `app.json` 扩展（P3 分支）

```json
{
  "lazyCodeLoading": "requiredComponents",
  "agent": {
    "instruction": "docs/wechat-ai/AGENTS.md",
    "pageMetadata": "docs/wechat-ai/page-meta.json",
    "skills": [
      {
        "name": "festival-search",
        "description": "查询电音节资讯、阵容与活动详情（免费信息检索，非票务）",
        "path": "packageAgentSkills/festival-search-skill"
      },
      {
        "name": "recruit-discovery",
        "description": "检索某场活动的公开组队招募帖（非配对撮合）",
        "path": "packageAgentSkills/recruit-discovery-skill"
      }
    ]
  }
}
```

原子接口内部 **必须** 调 P0 的 `AgentCapabilitiesService`，Schema 与 `@sync/agent-capabilities-contracts` 一致。

### 6.4 合规（微信 AI 专用）

写入 `docs/wechat-ai/AGENTS.md` 全局提示词（≤10KB）：

- 服务范围：电音节**资讯检索** + **公开招募帖检索** + **招募草稿生成**
- **禁止**表述：匹配搭子、配对成功、平台担保、联系队友、站内私信
- **禁止**原子接口：`publishRecruitPost` · 任何票务下单
- 找队场景必须说：**「检索 / 筛选公开招募帖」**
- 草稿场景必须说：**「已生成草稿，请进入小程序确认后发布」**
- 推送/卡片 disclaimer：平台不保证组满 · AI 内容仅供参考

### 6.5 用户旅程（微信 AI 接入后）

```text
用户在微信 AI：「Tomorrowland 阵容出了吗」
  → festival-search.getLineup
  → GUI 卡片展示阵容摘要
  → 用户点「进入小程序」→ 活动详情

用户：「找从上海去 Tomorrowland 的公开招募」
  → recruit-discovery.searchPublicRecruits
  → 招募列表卡片
  → 点进详情招募墙

用户：「帮我写一条招募帖」
  → recruit-draft.draftRecruitPost
  → 3 条候选卡
  → 半屏 / 进小程序 Sheet → 用户改 → 发布

活动详情内：wx.openAgent({ followUpMessage: '筛选这场节的公开招募' })
  → 同上 recruit-discovery 流程
```

---

## 七、微信 AI 接入：P0 预留 · P3 正式

P0 **必须**交付的开放入口工件（不含 SKILL 运行时代码）：

| 工件 | 路径 | P0 内容 |
|------|------|---------|
| 全局提示词模板 | `docs/wechat-ai/AGENTS.md` | 合规约束 + SKILL 分流说明 |
| 页面元数据草案 | `docs/wechat-ai/page-meta.json` | 活动详情 / 招募墙 / 阵容页 path + query schema |
| 原子能力契约 | `sync-app-backend/packages/agent-capabilities-contracts/` | TypeScript types + JSON Schema |
| 门面服务 | `AgentCapabilitiesService` | 供 REST / 未来 wx 原子接口 / MCP 共用 |
| SKILL 目录占位 | `docs/wechat-ai/SKILL-SKELETON.md` | 目录结构 + mcp.json 示例 |
| 接入检查清单 | `docs/wechat-ai/CHECKLIST.md` | 内测申请 · Nightly 工具 · 提审隔离 |

P3 正式接入时 **仅新增**：

- `packageAgentSkills/` 独立分包
- 原子接口 thin wrapper → `AgentCapabilitiesService`
- 原子组件 GUI 卡片
- 内测分支提审

---

## 八、P4 · 机票关注 + 位置情境（缓冲）

| ID | Story | 备注 |
|----|-------|------|
| US-AG-21 | `watch_flight` goal kind | Amadeus / Skyscanner adapter |
| US-AG-22 | 每日 cron 比价 → 通知 | 仅参考价 + disclaimer |
| US-AG-23 | 设置 ·「基于位置的建议」开关 | 默认关 · PIPL |
| US-AG-24 | `lastKnownCity` → 节期间 nudge | 依赖用户授权 |

**不做**：站内购票 · 返佣 · LLM 猜价格。

---

## 九、用户怎么用（全阶段完成后）

### 9.1 主路径（小程序 · 不变）

1. 首页 **查电音节 / 找组队** → 活动详情
2. 绑活动 → **订阅阵容更新**（+ 可选草稿）
3. 招募墙浏览 / AI 找队 / AI 帮写 → **用户确认发布**
4. Festival Plan：攻略 → 时间表 → 招募
5. 通知叫醒 → 点进继续

### 9.2 微信 AI 路径（P3 后叠加）

- 微信里说话 → SYNC 卡片 → 进小程序完成确认型操作
- 小程序内 `wx.openAgent` → 语音筛选招募 → 卡片 → 回详情

### 9.3 外部 Agent 路径（P2 后 · 小众）

- Cursor MCP 查 lineup / 公开招募
- 日历 App 订阅 `.ics`

---

## 十、合规红线（全阶段有效）

继承 [PRODUCT.md §1.3](./PRODUCT.md#13-主体与合规边界)：

| 不做 | Agent / 微信 AI 特别注意 |
|------|-------------------------|
| 配对成功 / 智能匹配 | `AGENTS.md` · 原子接口 `description` · 推送 copy 三重约束 |
| AI 自动发帖 | 任何入口仅 `draft*` · 无 `publish*` |
| 站内私信 / 联系队友 | SKILL 不得暴露联系方式字段 |
| 付费 AI | 全免费 |
| 票务 | 公开 API / SKILL 不含购票 |

上线前 grep：

```bash
rg '联系队友|配对成功|平台担保|智能配对|buddy-matching|publishRecruit' \
  sync-app-backend/src sync-app/src docs/wechat-ai/
```

---

## 十一、排期建议

```text
Sprint AG-0（P0 · 最高优先级）
  US-AG-01～09 · Goal 闭环 · AgentCapabilities 门面 · 微信 AI 文档预留

Sprint AG-1（P1）
  US-AG-11～17 · Nudge · 公开 Feed · 日历

Sprint AG-2（P2）
  sync-mcp-server · agent_tasks 泛化

Sprint AG-3（P3 · 跟微信内测节奏）
  packageAgentSkills · 内测分支 · wx.openAgent 入口

Sprint AG-4（P4 · buffer）
  机票 · 位置
```

**Q2 提审主包**：仅合入 P0 中 **不含** `app.json agent` 字段与 `packageAgentSkills/` 的部分。

---

## 十二、代码索引（规划）

| 领域 | P0 路径 |
|------|---------|
| Goal API | `sync-app-backend/src/modules/goal/` |
| Orchestrator | `sync-app-backend/src/modules/goal/goal-orchestrator.service.ts` |
| 原子能力门面 | `sync-app-backend/src/modules/agent-capabilities/` |
| 契约包 | `sync-app-backend/packages/agent-capabilities-contracts/` |
| 前端 Goal | `sync-app/src/domains/user-goals/` |
| Scout 回调 | `hermes-agent/scout/` → internal webhook |
| 微信 AI 文档 | `sync-app/docs/wechat-ai/` |
| 现有衔接 | `ActivityCatalogRefreshService` · `NoticeAgent` · `SceneRunService` |

---

## 十三、相关文档

| 文档 | 关系 |
|------|------|
| [SCENE-AGENT.md](./SCENE-AGENT.md) | L0/L1 小程序内 AI；本路线图 L3/L4 不替代 |
| [PRODUCT.md](./PRODUCT.md) | 合规 · 双主轴 · Festival Plan |
| [API.md](./API.md) | REST 契约；P1 补充 public events |
| [Q2-USER-STORIES.md](./Q2-USER-STORIES.md) | Epic G Scene Agent 已交付部分 |

---

## 附录 A · `page-meta.json` 草案（P0 文档）

```json
{
  "pages": [
    {
      "path": "packageEvent/pages/event-detail/index",
      "name": "活动详情",
      "description": "查看电音节资讯、阵容、公开组队招募墙与出行攻略",
      "query": {
        "type": "object",
        "properties": {
          "legacyId": { "type": "number", "description": "活动 legacyId" }
        },
        "required": ["legacyId"]
      }
    },
    {
      "path": "packageEvent/pages/activity-lineup/index",
      "name": "活动阵容",
      "description": "查看活动官宣阵容与艺人",
      "query": {
        "type": "object",
        "properties": {
          "legacyId": { "type": "number", "description": "活动 legacyId" }
        },
        "required": ["legacyId"]
      }
    }
  ]
}
```

## 附录 B · 原子接口 `mcp.json` 示例（P0 文档 · recruit-discovery）

```json
{
  "apis": [
    {
      "name": "searchPublicRecruits",
      "description": "检索某场电音节活动下的公开组队招募帖，按关键词与出发地等条件筛选。仅展示公开信息，非配对撮合，平台不保证组满。",
      "inputSchema": {
        "type": "object",
        "properties": {
          "activityLegacyId": {
            "type": "number",
            "description": "活动 legacyId，必填"
          },
          "query": {
            "type": "string",
            "description": "用户检索条件，如出发地、人数、日期"
          }
        },
        "required": ["activityLegacyId"]
      }
    }
  ]
}
```
