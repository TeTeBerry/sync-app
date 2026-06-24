# Scene Agent · 无感 AI 产品说明

> **定位**：不用线性对话 Tab，把 Agent 能力嵌进用户正在做的场景（找队、发帖、看阵容、出征准备）。  
> **原则**：单次任务、结构化输出、用户可改可拒；合规表述为 **检索 / 生成 / 预填**，非配对撮合。  
> **关联**：[Q2-USER-STORIES.md](./Q2-USER-STORIES.md)（US-Q2-31～34 · **41～48**）· [PRODUCT.md](./PRODUCT.md) · 后端 [orchestration/README.md](../sync-app-backend/src/ai/orchestration/README.md)

**最后更新**：2026-06-23

---

## 一、为什么不用聊天

| 聊天 Agent | Scene Agent（无感） |
|------------|---------------------|
| 独立对话页、多轮气泡 | 嵌在活动详情 / Sheet / 搜索条 |
| 用户先想「怎么问」 | 用户本来就在搜招募、发帖、看阵容 |
| 像通用助手 | 像「懂电音节的产品功能」 |

US-Q2-22 已移除准备 Tab 与 WS 多轮对话；**能力保留在后端 tools**，通过 Scene 协议接到 UI。

---

## 二、架构概览

```text
用户场景（页面 + 手势）
    → Scene Context（activityId、偏好、人格、Festival Plan…）
    → Scene Run（单轮 HTTP；长任务仍走现有 REST + 进度）
    → UI Effects（非聊天气泡）
```

### Scene Context（自动打包，用户无感）

| 字段 | 来源 |
|------|------|
| `activityLegacyId` | 当前活动详情 / 用户绑定活动 |
| `prefs` | 设置 · 攻略 · 发帖 · 人格（US-Q2-27） |
| `personalityType` | 人格测试结果 |
| `festivalPlan` | 攻略 / 行程 / 是否已发招募 |
| `lineupPublished` | 活动阵容 / timetable 是否已官宣（影响 itinerary 与 prep_nudge 分支） |
| `raverMode` | `local` \| `nomad` \| `balanced`（影响首页主次、是否展示 prep / 攻略） |
| `homeCity` | 本地 Hub 默认城市（如上海） |
| `activityType` | `festival` \| `indoor`（室内详情弱化 itinerary Scene） |
| `trigger` | `search` · `chip` · `sheet_submit` · `page_enter` |

**时间线原则**：专属时间表通常临近开场才可用；公开组队可在**官宣前**进行。Scene Run 在 `festivalPlan.itinerary` 为空时，应优先使用 `personalityType` / `prefs.favorGenres` 作为找队排序与预填信号，**不要求**用户先完成行程。详见 [PRODUCT.md §2.5](./PRODUCT.md#25-festival-plan出征准备--降优先级)。

### UI Effect 类型（目标契约）

| type | 作用 | 示例 |
|------|------|------|
| `insight_line` | 一行 AI 解析/偏好说明 | 「已参考你的偏好：上海 · Techno」 |
| `reorder_posts` | 招募列表排序 | postIds 顺序 |
| `prefill_query` | 搜索框幽灵预填 | 攻略完成后带条件找队 |
| `prefill_form` | Sheet 表单默认值 | 暗号候选、发帖字段 |
| `candidates` | 横滑候选卡 | AI 生成 3 条暗号 |
| `open_sheet` | 打开 bounded wizard | 等同原 `client_action` |
| `inline_card` | 半屏只读卡片 | 点 DJ 出简介 |

**合规**：生成类 effect 带 `aiGenerated: true`；列表类附 `disclaimer` 文案。

---

## 三、场景注册表

| scene | 页面 | 触发 | 复用能力 | Story |
|-------|------|------|----------|-------|
| `recruit_search` | 活动详情招募墙 | 搜索 / Chip | `PostSearchService` · 偏好排序 | Q2-05 · **Q2-27** |
| `local_hub_recruit_search` | 本地城市 Hub | 顶栏搜索 / Chip | 跨场 `activityLegacyIds[]` 或 city+indoor 检索 | **Q2-39** |
| `recruit_compose` | 发帖 Sheet | 「AI 帮写」 | LLM 候选文案 | **Q2-28** |
| `recruit_flip` | 翻招募卡页 | 翻卡 | 帖池加权 shuffle | **Q2-29** ⏸ |
| `guide_to_recruit` | 攻略完成 | CTA | `travelGuideFormToBuddyPrefill` | **Q2-30** |
| `personality_next` | 人格结果 / 分享落地 | 主 CTA · 测完提交 | 偏好同步 + 路由至有种子的招募墙 | **Q2-17** · **Q2-18** |
| `lineup_dj` | 活动详情阵容 / **室内 Headliner** | 点 DJ · 「查看艺人介绍」 | `query_dj_info` | **Q2-33** · **Q2-40** |
| `prep_nudge` | 出征准备折叠区 | 进详情 | 分阶段规则（阵容是否官宣 · 偏好 · 招募进度）；**local/indoor 默认跳过** | **Q2-34** · **Q2-37** |
| `recruit_filters` | 招募墙 | 进入 / 有偏好 | 动态 Chip | **Q2-32** |
| `recruit_apply_compose` | 活动详情评论区 | 「申请加入」展开 | LLM 公开评论草稿 | **Q2-44** |
| `lineup_picks` | `activity-lineup` | 阵容官宣后进页 | `favorGenres` + 阵容 · `itinerary-schedule` | **Q2-43** |
| `festival_recommend` | 人格结果 / nomad 首页 | 测完 / 进入 | catalog 规则排序 + LLM 解释 | **Q2-42** |
| `festival_story` | 活动详情资讯区 | 展开「关于这场节」 | 结构化字段 ± LLM 摘要 | **Q2-41** |
| `events_nl_search` | 活动 Tab | 搜索提交 | `buddy-post-search` 式解析 → filter | **Q2-45** |
| `festival_compare` | 活动 Tab / 详情 | 用户选对比 | 规则表 + 少量 LLM | **Q2-46** |
| `lineup_announce_hint` | 活动详情资讯区 | `lineupPublished=false` | **规则** insight_line | **Q2-47** |
| `guide_survival` | 攻略完成 / Prep 区 | 攻略生成后 | 节别模板卡（签证/天气/换汇） | **Q2-48** |

**不做**：全站聊天、跨活动匹配队友、首页招募信息流 Agent、AI 自动代发评论/发帖（须用户选草稿确认）。

---

## 四、与现网 API 的关系

| 现网 | Scene 演进 |
|------|------------|
| `POST /posts/ai-search` | 保留兼容；**Q2-31** 活动详情已切 `scene=recruit_search` |
| `POST …/travel-guide/generate` | 长任务独立 REST + 进度，不塞进 scene-run |
| WS `client_action` | 前端已无消费者；改为 REST `effects.open_sheet` |
| `ReadOnlyTurnHandler` | 阵容/演出表等 **规则快路径**，能不调 LLM 就不调 |

### Scene Run API（US-Q2-31 ✅）

`POST /api/ai/scene-run`

- 请求：`scene` · `intent?` · `activityLegacyId?` · `input?` · `context?`
- 响应：`effects[]` · `disclaimer?`

**首期 handler**：`recruit_search` → `insight_line`（`variant: parsed | preference`）+ `reorder_posts`（含 `items` · `parsed` · `totalMatched`）

`POST /posts/ai-search` 仍保留向后兼容；活动详情 AI 找队已走 scene-run。

### 实现分层（L0 / L1 / L2）

| 层级 | 何时用 | Scene 示例 |
|------|--------|------------|
| **L0 规则** | 能不调 LLM 就不调 | `prep_nudge` · `lineup_announce_hint`（Q2-47） |
| **L1 单轮** | `scene-run` 一次请求 + effects | `recruit_compose` · `recruit_apply_compose` · `festival_story` |
| **L2 长任务** | 独立 REST + 进度 | `travel-guide/generate` · 行程优化（`itinerary-schedule.service.ts`） |

---

## 五、分阶段信号与 Scene 优先级

公开组队与出征准备**不同步**。Prep Nudge / 找队相关 Scene 按下列优先级取信号（均只影响公开帖检索排序或预填，非配对）：

| 用户阶段 | 典型 nudge / effect | 主要信号 |
|----------|---------------------|----------|
| 官宣前 · 未测人格 | 「去招募墙看看公开招募」 | 无偏好，关键词检索 |
| 官宣前 · 已测人格 | 「已参考你的 Techno 偏好，去看看公开招募」 | `personalityType` → `favorGenres` |
| 官宣前 · 未发招募 | 「还差：发一条公开招募」 | `festivalPlan.buddy_post` |
| 有攻略 · 未找队 | 搜索框 `prefill_query`（出发地/人数） | 攻略表单槽位（`guide_to_recruit`） |
| 阵容未官宣 | 行程项弱化或提示订阅；**不阻塞**找队 | `lineupPublished=false` |
| **local / indoor** | 不触发 itinerary / 攻略 nudge；找队与艺人介绍优先 | `raverMode=local` 或 `activityType=indoor` |
| 阵容已官宣 · 无行程 | 「时间表已出，去排你的专属 set」 | `lineupPublished=true` |
| 已发招募 · 有新回复 | 「你的招募有 N 条新公开回复」 | 通知 / engagement |

---

## 六、无感交互五模式

1. **幽灵预填** — 搜索框/表单灰色建议，点采纳  
2. **一行洞察** — 列表上方解析摘要，无助手头像  
3. **候选卡片** — 横滑选 AI 文案再发布  
4. **情境 Chip** — 动态筛选「和我同出发地」「还差 1 人」  
5. **Bounded Sheet** — 多步表单在 Sheet 内，无消息列表  

---

## 七、排期（与 Q2 Sprint 对齐）

| 阶段 | 时间 | Scene 范围 |
|------|------|------------|
| **上线包** | ～2026-07-06 | 无新 API；**Q2-27** 洞察行 + 偏好次排序；**Q2-34** 规则版 Prep Nudge |
| **Sprint 6** | 上线后 2～4 周 | **Q2-31** scene-run ✅ · **Q2-32** 动态 Chip · **Q2-33** DJ 卡片 · **Q2-43** 必看 set · **Q2-44** 申请评论 AI · **Q2-47** 官宣规律 |
| **Sprint 7** | 有互动数据后 | **Q2-17/28/30** 人格/AI 发帖/攻略串联 · **Q2-29** 翻卡（帖量门槛）· **Q2-39/40** Hub + 室内 · **Q2-41** 节故事 · **Q2-42** 哪场适合我 · **Q2-48** 生存指南 |
| **Sprint 8** | 上海验证后 | Hub 跨场 `local_hub_recruit_search` · 多城 indoor seed · **Q2-45** NL 搜节 · **Q2-46** 双节对比 |

---

## 八、代码索引

| 层 | 路径 |
|----|------|
| Scene 契约 | `sync-app-backend/packages/scene-contracts/` |
| Scene 运行时 | `sync-app-backend/src/ai/scene/` · `sync-app/src/domains/scene-agent/` |
| Agent 工具 | `sync-app-backend/src/ai/agent/tools/` |
| 编排 | `sync-app-backend/src/ai/orchestration/` |
| AI 找队 | `post-search.service.ts` · `buddy-post-search.util.ts` |
| 前端搜索 | `useEventDetailPostSearch.ts` |
| 原 client_action 类型 | `shared/chat/client-action.types.ts` |
| 用户偏好 | `BuddyPreferencesSettings.tsx` · `user-profile-sync.service.ts` |
| Raver 模式 / Hub | US-Q2-37 · US-Q2-39 · `pages/index/`（待定 Hub 分包） |
| 行程优化 | `itinerary-schedule.service.ts` · US-Q2-43 |
