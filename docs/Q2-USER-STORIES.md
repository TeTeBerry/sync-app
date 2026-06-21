# Q2 User Stories（推广主轴 · 组队招募改版 · 仅 ICP 备案）

> **产品定位（Q2）**：免费电音节资讯 + **活动列表搜节** + **公开组队招募**展示与 **AI 检索**（非撮合、不私信、不售票）。  
> **对外一句话**：电音节资讯与公开组队招募；招募支持 AI 筛选。  
> **合规红线**：不收费、不卖票、不撮合交易、不提供站内联系/私信、无队内私密评论、无「联系队友」。  
> **主体**：OPC · 仅有 ICP 备案，无 ICP 经营许可证。  
> **功能总览**：[PRODUCT.md](./PRODUCT.md)  
> **Q1 基线**：[Q1-USER-STORIES.md](./Q1-USER-STORIES.md)  
> **关联代码**：`domains/partner-feed/` · `post-search.service.ts` · `pages/events/` · `pages/index/` · `packageEvent/pages/event-detail/`

**Story 格式**：`US-Q2-xx` · 优先级 P0/P1/P2 · 体量 S/M/L · 依赖 · **状态**（✅ / 🚧 / ⏸ / 🔲）

**状态图例**：✅ 已完成 · 🚧 进行中（部分验收已通过）· ⏸ 阻塞/待决策 · 🔲 未开始

## 完成进度总览（截至 2026-06-21）

**当前迭代（Sprint 3）**：**US-Q2-22**（去除准备 Tab / 去对话化）**已收口**；US-Q2-13 P0（活动 Tab 列表搜索）随 22 交付；US-Q2-09/10 **已取消**（整页移除，非瘦身）。

| ID | 标题 | 优先级 | 状态 |
|----|------|--------|------|
| US-Q2-22 | 去除准备 Tab / 去对话化 | P0 | ✅ |
| US-Q2-01 | 全站推广口径与合规文案统一 | P0 | ✅ |
| US-Q2-02 | 首页双 CTA（查节 / 找队） | P0 | ✅ |
| US-Q2-03 | 招募帖卡片改版（状态/人数/无点赞） | P0 | ✅ |
| US-Q2-04 | 「申请加入」按钮 + 预填公开评论 | P0 | ✅ |
| US-Q2-05 | 活动详情 AI 找队（搜索条+帖列表同区，口径优化待做） | P0 | ✅ 核心 |
| US-Q2-06 | 组队动态（公开回复，嵌在「我的下一场」） | P1 | ✅ 核心 |
| US-Q2-08 | Festival Plan 跳转统一 | P1 | ✅ |
| US-Q2-09 | ~~准备 Tab 方案 C 瘦身~~ | P1 | ❌ 取消 |
| US-Q2-10 | ~~首页/准备 Tab 查节示例~~ | P1 | ❌ 取消（示例迁至首页+活动搜索） |
| US-Q2-11 | ~~Agent `search_buddy_posts` 工具~~（已取消） | P1 | ❌ |
| US-Q2-12 | 活动信息来源标注（承接 Q1-04） | P1 | 🔲 |
| US-Q2-13 | 活动 Tab 搜节（列表过滤） | P1 | ✅ P0 |
| US-Q2-14 | 新用户引导改序（查节/找队优先） | P1 | ✅ |
| US-Q2-15 | 观演准备收进详情折叠区 | P1 | 🔲 |
| US-Q2-16 | 招募帖字段扩展（slots/status） | P1 | 🔲 |
| US-Q2-17 | 人格测试 → 找队/发招募 CTA | P2 | 🔲 |
| US-Q2-18 | 人格测试分享卡片（承接 Q1-16） | P2 | 🔲 |
| US-Q2-19 | 艺人 Tab → 活动串联 | P2 | 🔲 |
| US-Q2-20 | 地图 Tab 决策落地 | P2 | ⏸ 待决策 |
| US-Q2-21 | 冷启动种子招募帖（运营） | P2 | 🔲 |

**合规验收（每条 Story 通用）**

- [ ] 无付费入口、无「平台担保/代售/配对成功」文案
- [ ] 无「联系队友」、站内私信、队内私密评论、私密投递 inbox
- [ ] UGC 仍走联系方式拦截 + 票务敏感词 + `msg_sec_check`
- [ ] 「AI 找队」表述为检索公开信息，非智能配对
- [ ] 新文案符合 `platformDisclaimer` / 用户协议

**明确不纳入 Q2（需经营许可证或其他资质）**

| 需求 | 原因 |
|------|------|
| 队内私密评论 / team-chat 恢复 | 站内私密通讯 + 撮合 |
| 「联系队友」、展示联系方式 | 与协议冲突 |
| 私密投递 inbox、邀请接受/拒绝 | 平台撮合关系 |
| 付费匹配 / 会员 | 经营性 |
| 官方购票返佣（Q1-05） | 票务经营 · 继续暂缓 |

---

## Epic A · 合规与推广口径（P0）

### US-Q2-01 · 全站推广口径与合规文案统一 P0 · M · ✅

**Story**  
作为运营/审核人员，我希望全站文案与对外推广一致，以便在仅 ICP 备案下过审且不误导用户。

**验收标准**

- [ ] 首页副标题、AI 入口、找队结果、发帖成功处与 `platformDisclaimer` 一致
- [ ] 「匹配」类文案改为「检索 / 筛选 / 找到 N 条公开招募」
- [ ] 全站无「联系队友」「配对成功」「平台担保」
- [ ] `zh-CN` / `en-US` 对齐（英文避免无 disclaimer 的 `buddy-matching`）
- [ ] 推广素材自检清单写入 `PRODUCT.md` 或运营附录

**技术提示**：`src/i18n/messages/` · `constants/platformDisclaimer.ts` · `ugcPublishCompliance`

**依赖**：无

> **已取消 US-Q2-07**（禁止「联系队友」类 CTA）：现网本无此类按钮；设计稿中的「联系队友」不纳入实现。合规表述已含于 US-Q2-01；做 US-Q2-06 时勿新增联系类 CTA 即可。

---

## Epic B · 组队招募改版（P0–P1）

### US-Q2-03 · 招募帖卡片改版 P0 · L · ✅

**Story**  
作为找队用户，我想在活动详情看到清晰的「招募中」帖子与人数进度，以便快速判断是否合适。

**验收标准**

- [ ] 「活动帖子」改文案为「组队招募」
- [ ] 卡片展示：招募中/已满角标、人数进度（如 2/3）、`#组队` 标签
- [ ] 卡片底部预留主 CTA 位（「申请加入」样式，与评论 icon 并列）；交互见 US-Q2-04
- [ ] **无点赞**（确认未回归 like API）
- [ ] 列表仍仅 `listedInFeed !== false` 的公开帖

**技术提示**：`EventPostCard` · `domains/partner-feed/` · `post.schema.ts`

**依赖**：US-Q2-16（字段可并行，先用正文解析占位）

---

### US-Q2-04 · 「申请加入」按钮 + 预填公开评论 P0 · M · ✅

**Story**  
作为想加入的用户，我想在招募帖上看到明确的「申请加入」按钮，点开后用预填内容快速发一条**公开评论**表达意向，以便合规、好转化，且其他人也能看到。

**产品方案（入口 + 实现）**

- **入口**：招募帖卡片主按钮「申请加入」（非自己的帖、招募中才显示）
- **实现**：点击后展开 `PostCommentSection`，输入框**预填可编辑模板**；发送仍走公开评论 API
- **不复用**：不新增私密申请接口、不替代底部「评论」icon（评论区仍可浏览全部公开讨论）

**交互**

```text
[招募帖] → 点「申请加入」
  → 展开评论区 + 输入框预填「想加入，2人，上海出发，时间可配合」
  → 用户可编辑 → 发送
  → POST /posts/:id/comments（公开）
```

**验收标准**

- [ ] 非帖主、招募中（`recruitStatus=open` 或默认）显示「申请加入」主按钮；自己的帖不显示
- [ ] 招募已满：按钮置灰或文案「招募已满」；仍可点评论 icon 公开讨论
- [ ] 点击「申请加入」→ 自动 `openPostComments` + 传入 `commentDraft` 预填模板
- [ ] 预填可从用户资料/上次攻略或固定模板生成；用户必须确认发送
- [ ] 提交走现有 `POST /posts/:id/comments`；触发既有评论通知 / 订阅逻辑
- [ ] 发送前或按钮旁轻提示：「将公开发表，请勿留联系方式」
- [ ] **不做**仅队长可见的私密申请、不新增 `apply` 表

**可选增强（P1，本 Story 不阻塞）**

- [ ] 点击按钮先开轻量 Sheet（人数、出发地）再拼成评论正文

**技术提示**：`EventPostCard` · `PostCommentSection`（新增 `initialCommentDraft?`）· `useEventDetailPosts.openPostComments` · `ugcContactValidation` · `requireAuth`

**依赖**：US-Q2-03

---

### US-Q2-16 · 招募帖字段扩展 P1 · M · 🔲

**Story**  
作为发招募用户，我想设置招募状态与人数，以便列表展示「招募中 2/3」。

**验收标准**

- [ ] Post 增加可选字段：`recruitStatus`（`open`/`full`）、`slotsTotal`、`slotsFilled`（命名可调整）
- [ ] 发帖 Sheet 可填/选人数与状态；默认 `open`
- [ ] 帖主可在我的招募帖或详情自己的帖上切换「已满」
- [ ] API 与 `EventDetailPost` mapper 同步

**技术提示**：`post.schema.ts` · `PostWriteService` · `buddyPostForm.ts`

**依赖**：无（与 US-Q2-03 可并行）

---

### US-Q2-06 · 组队动态（公开回复） P1 · M · ✅ 核心已完成 · Q2 口径 🔲

**Story**  
作为发帖用户，我想在首页看到招募帖的**新公开回复**提醒，并能跳进帖子的评论区，而不是私密投递或联系入口。

**现网实现（已完成，勿重复造轮子）**

- **首页「我的下一场」**（`HomeMyNextEvent`）：`GET /home` → `myNextEventPostEngagement.unreadReplyCount`；有未读时展示「你的招募帖有 N 条新公开回复」（`home.newReplies`）
- **深链**：点击 → `goEventDetail(postId, focusPosts, openComments)`（US-Q1-15）
- **站内通知**：`comment` / `comment_reply` → `navigateFromNotification` 同样跳转详情并展开评论（`packageProfile/pages/notifications`）
- **微信订阅**：发帖/评论后可授权评论回复提醒（US-Q1-14）

**代码**：`pages/index/components/HomeMyNextEvent.tsx` · `pages/index/index.tsx` · `utils/route.ts` · `POST-LIFECYCLE.md` §八

**Q2 口径优化（未完成，本 Story 剩余验收）**

- [ ] 与 US-Q2-01 统一：全站「组队帖」→「招募帖」时确认首页提示已对齐（现 i18n 已为「招募帖」「新公开回复」）
- [ ] **不做**设计稿式独立「你的组队进度」投递 inbox（3 人投递 / 联系队友 / 邀请卡片）

> **说明**：动态能力嵌在**我的下一场**卡片内，无需在活动详情顶部另建「组队动态」区块；「我评论过的帖有新回复」走**通知页**，不在首页重复做聚合。

**依赖**：无（与 US-Q2-04 无阻塞关系）

---

## Epic C · AI 找队（P0–P1）

### US-Q2-05 · 活动详情 AI 找队 P0 · M · ✅ 核心已完成 · Q2 口径 🔲

**Story**  
作为用户，我想在活动详情的组队招募区用一句话找合适的公开帖，以便体现推广主轴。

**现网实现（已完成，勿重复造轮子）**

活动详情 `#event-detail-posts` 区块已包含：

- `EventDetailPostSearchBar` + `useEventDetailPostSearch`
- 有 API 时 `POST /posts/ai-search`（`searchBuddyPostsWithAi`）；失败 toast + 本地降级（US-Q1-09）
- 城市 chip 筛选（`EventDetailPostFilterBar`）；有搜索时禁用 chip
- 搜索结果替换下方帖列表（`EventPostsVirtualList`）
- 结果 meta：`找到 N 条匹配` / 本地降级文案

**代码**：`packageEvent/pages/event-detail/index.tsx` · `domains/partner-feed/hooks/useEventDetailPostSearch.ts` · `EventDetailPostSearchBar.tsx`

**Q2 口径优化（未完成，本 Story 剩余验收）**

- [ ] 区块/占位文案对齐推广：「AI 找队」示例占位（如「上海出发，6.14，差 1 人」），与 US-Q2-01 合规表述一致
- [ ] 结果 meta 改为「找到 N 条合适的**公开招募**」（非「匹配」）
- [ ] （可选）展示 API 返回的解析条件（`parsed.searchTerms` / 出发地·日期等一行摘要）
- [ ] 搜索无结果：引导「发一条招募」+ 合规一行（可点 FAB / 开 Sheet）
- [ ] 「组队招募」区标题与发帖 FAB 文案与 US-Q2-03 一致

**依赖**：US-Q2-01（文案）；与 US-Q2-03 招募改版可并行

> **说明**：无需另建独立「AI 找队专区」页面；就在现帖子列表上方的搜索条 + 筛选即可。

---

### US-Q2-11 · ~~Agent `search_buddy_posts` 工具~~ P1 · L · ❌ 已取消

**Story**  
~~作为在准备 Tab 用口语找队的用户，我希望 AI 返回与详情搜索相同的公开帖卡片。~~

**取消原因（2026-06-21）**  
活动详情招募区已有 `EventDetailPostSearchBar` + `POST /posts/ai-search`，与对话内检索能力重复；准备 Tab 保留「找招募帖」Chip **跳转活动详情**，不在 AI 对话内做帖检索。

**保留**

- [x] 活动详情搜索条 + AI 检索（US-Q2-05）
- [x] 已绑活动欢迎 Chip「找招募帖」→ 跳转活动详情招募区

**已移除**

- Agent 工具 `search_buddy_posts`、聊天流 `matched_posts`、对话内口语找帖快路径

**依赖**：US-Q2-05（搜索 API）· ~~US-Q2-09~~

---

## Epic D · AI 查节（P1）

### US-Q2-10 · ~~首页/准备 Tab 查节示例问题~~ P1 · M · ❌ 取消

**取消原因**：准备 Tab 整页移除（US-Q2-22）。示例 Chip 保留在首页 `HomeAiEntry`，点击 → `goEventsWithSearch` 过滤活动列表。

**迁移验收**（在 US-Q2-22 验收）

- [x] 首页示例 Chip → 活动 Tab 列表搜索（`resolveExampleChipSearchQuery` + `goEventsWithSearch`）
- [x] 无 `goAiAssistant` / 无准备 Tab

---

### US-Q2-12 · 活动信息来源标注 P1 · S · 🔲

**Story**  
作为查节用户，我想知道活动信息来源与更新时间（承接 US-Q1-04）。

**验收标准**

- [ ] 活动详情展示「信息来源」+「更新于」（有则展示）
- [ ] 后端 `Activity` 可选字段 `infoSource` + `infoUpdatedAt`
- [ ] AI 查节回答可引用同一来源；尾注「仅供参考，以主办方为准」

**技术提示**：`activity.schema.ts` · `event-detail` header · Agent 回复模板

**依赖**：无

---

### US-Q2-13 · 活动 Tab 搜节（列表过滤）P1 · M · ✅ P0

**Story**  
作为浏览用户，我想在活动 Tab 用搜索框输入节名或地点，**列表即时过滤展示匹配活动**。

**产品原则**

- **主路径**：搜索框 + 更新列表（封闭检索），不是 AI 对话
- **无结果**：空状态引导「换个关键词」或「浏览全部活动」；**不做**「问 AI」兜底（与去对话化一致）
- **分工**：活动 Tab = 目录/黄页；活动详情 = AI 找队（公开招募）

**验收标准 · P0（已完成）**

- [x] 活动 Tab 顶部搜索框（`EventsSearchBar`）
- [x] 输入即过滤 **列表** Tab 活动卡片（名称、地点、别名）
- [x] `eventsSearchIntent` + `goEventsWithSearch`；首页 Chip / 查节 CTA 承接
- [x] 清空搜索恢复全量列表
- [x] i18n：`events.searchPlaceholder` 等

**明确不做**

- [x] 活动 Tab 内嵌 WebSocket 对话
- [x] 无结果跳转准备 Tab 问 AI

**技术提示**：`pages/events/index.tsx` · `filterActivitiesForEventsSearch.ts` · `eventsSearchIntent.ts`

**依赖**：US-Q2-22

---

## Epic E · 信息架构（P1）

### US-Q2-22 · 去除准备 Tab / 去对话化 P0 · L · ✅

**Story**  
作为用户，我不需要单独的 AI 对话 Tab；查节、找队、攻略应在活动 Tab 与活动详情完成。

**验收标准**

- [x] 底栏 3 Tab：首页 / 活动 / 我的
- [x] 删除 `pages/ai/`；无 `goAiAssistant` / `goPrepTab` / `warmAiAssistant`
- [x] 前端移除 WebSocket 聊天客户端与 `aiChatStore`
- [x] 后端 `AI_CHAT_WS_ENABLED` 默认关闭（不挂载 `AiChatWsServer`）
- [x] 首页查节 → `goEventsWithSearch`；找队 → 活动详情招募区
- [x] 攻略 Sheet 提交 → `runTravelGuideGeneration` → 攻略详情页（不经聊天）
- [x] `packageAi/ai-assistant` 深链重定向

**依赖**：US-Q2-13 P0

---

## Epic E · 信息架构与准备 Tab（P1 · 历史）

### US-Q2-02 · 首页双 CTA（查节 / 找队） P0 · M · ✅

**Story**  
作为首次进入用户，我想一眼看到「查节」和「找队」两个核心能力。

**验收标准**

- [ ] 首页主区域双 CTA：查电音节（进活动 Tab 搜索）/ 找组队（进已选活动详情招募区或活动列表）
- [ ] `HomeAiEntry` 文案从「攻略行程组队」改为查节+找队
- [ ] `HomeQuickActions` 与双 CTA 不重复导流（收敛为 1 套主入口）

**技术提示**：`pages/index/components/HomeAiEntry.tsx` · `HomeQuickActions.tsx`

**依赖**：US-Q2-01

---

### US-Q2-09 · ~~准备 Tab 方案 C 瘦身~~ P1 · M · ❌ 取消

**取消原因**：US-Q2-22 移除准备 Tab 整页（`pages/ai/`、WebSocket 聊天客户端），非「瘦身」。

**依赖**：—（由 US-Q2-22 取代）

---

### US-Q2-08 · Festival Plan 跳转统一 P1 · M · ✅

**Story**  
作为用户，我从首页或详情点准备任务时，跳转应一致、可预期。

**验收标准**

- [x] 攻略：活动详情 Sheet → `runTravelGuideGeneration` → 攻略详情页（不经准备 Tab）
- [x] 行程：始终 `goExclusiveItinerary`
- [x] 组队：始终活动详情发招募（`openBuddyPost`）

**技术提示**：`domains/festival-plan/hooks/` · `utils/route.ts`

**依赖**：无

---

### US-Q2-15 · 观演准备收进详情折叠区 P1 · S · 🔲

**Story**  
作为用户，活动详情应以招募和资讯为主，攻略/行程清单不应抢首屏。

**验收标准**

- [ ] `FestivalPlanSummaryBar` 与攻略卡片收入「观演准备」折叠区（默认收起或次级位置）
- [ ] 首屏：活动信息 + AI 找队 + 招募列表
- [ ] 首页仍保留「我的下一场」简进度（可选）

**技术提示**：`packageEvent/pages/event-detail/index.tsx`

**依赖**：US-Q2-08

---

### US-Q2-14 · 新用户引导改序 P1 · M · ✅

**Story**  
作为新用户，引导应优先教「查节/找队」，而非先生成攻略。

**验收标准**

- [x] 步骤：选活动 → 活动 Tab 搜节/看招募 → 详情 AI 找队或发招募（攻略可选，详情 Sheet）
- [x] 可跳过；跳过后不再弹出
- [x] 引导文案符合 US-Q2-01 合规口径；无「打开准备」

**技术提示**：`useNewUserOnboarding.ts` · `NewUserOnboardingSheet`

**依赖**：US-Q2-02 · US-Q2-22

---

## Epic F · 增长与优化（P2）

### US-Q2-17 · 人格测试 → 找队/发招募 CTA P2 · M · 🔲

**Story**  
作为测完人格的用户，我想直接去推荐活动找队或发招募。

**验收标准**

- [ ] 结果页 CTA：「去 XX 节找招募」/「发招募（已预填）」
- [ ] 复用 `buildPersonalityBuddyPostPrefill`
- [ ] 分享文案无票价、代购、加微信

**依赖**：US-Q2-03 · US-Q2-04

---

### US-Q2-18 · 人格测试分享卡片 P2 · M · 🔲

**Story**  
承接 US-Q1-16：分享结果卡片传播，但不引导购票。

**验收标准**

- [ ] 分享标题/图：Soul DJ + 类型名 + 可选合规小字
- [ ] path 落地人格测试页/结果页
- [ ] 审核用文案清单

**技术提示**：`PersonalityResultView.tsx` · `onShareAppMessage`

**依赖**：US-Q2-01

---

### US-Q2-19 · 艺人 Tab → 活动串联 P2 · S · 🔲

**Story**  
作为追 DJ 的用户，我想从艺人页看到 TA 参加哪些节。

**验收标准**

- [ ] 艺人卡片可进「含该艺人的活动」列表或详情
- [ ] 数据来自 catalog lineup 与 activities 关联

**技术提示**：`EventsActivityArtistsTab` · backend catalog API

**依赖**：无

---

### US-Q2-20 · 地图 Tab 决策落地 P2 · — · ⏸

**Story**  
解决 `EventsActivityMapTab` 已实现未挂载的文档/代码漂移。

**验收标准（二选一）**

- [ ] **A 上线**：活动 Tab 增加地图子 Tab，坐标数据验收
- [ ] **B 下线**：删除未使用地图组件与 `getLocation` 权限（若不再需要）

**依赖**：产品决策

---

### US-Q2-21 · 冷启动种子招募帖 P2 · S · 🔲

**Story**  
作为运营，新活动页需要有可见招募帖，避免空城。

**验收标准**

- [ ] 生产环境不 seed mock；staging/运营流程文档化
- [ ] 热门活动有少量真实或官方示例招募（合规、无联系方式）

**技术提示**：`PostDevMockSeedService` · `POST-LIFECYCLE.md` §十一

**依赖**：无

---

## 建议迭代顺序

### Sprint 1（合规 + 招募主路径）— 4 周

| 顺序 | ID | 说明 |
|------|-----|------|
| 1 | US-Q2-01 | 文案与合规基线 |
| 2 | US-Q2-03 | 招募卡片 |
| 3 | US-Q2-04 | 申请按钮 + 预填公开评论 |
| 4 | US-Q2-05 | AI 找队口径优化（搜索条已有） |
| 5 | US-Q2-02 | 首页双 CTA |

### Sprint 2（IA + 查节）— 4 周 · **当前**

| 顺序 | ID | 说明 | 状态 |
|------|-----|------|------|
| 1 | US-Q2-08 | Festival Plan 跳转 | ✅ |
| 2 | US-Q2-09 | 准备 Tab 瘦身（方案 C） | ✅ |
| 3 | US-Q2-10 | 查节示例（与 09 并行） | ✅ |
| 4 | ~~US-Q2-11~~ | ~~Agent 找队工具~~ | ❌ 已取消（详情搜索条承担） |
| 5 | US-Q2-15 | 详情折叠准备 | 🔲 |
| 6 | US-Q2-12 | 信息来源 | 🔲 |
| 7 | US-Q2-14 | 新用户引导 | 🔲 |

> **说明**：US-Q2-09 / 10 / 11 已收口；可启动 **US-Q2-12**（活动信息来源标注）。

### Sprint 3（增长 · 可选）— 4 周

| 顺序 | ID | 说明 |
|------|-----|------|
| 1 | US-Q2-13 | 活动 Tab 搜节：列表过滤为主，无结果问 AI |
| 2 | US-Q2-16 | 招募帖字段扩展 |
| 3 | US-Q2-17 · 18 | 人格测试分享 / 找队 CTA |
| 4 | US-Q2-19 | 艺人 Tab → 活动串联 |
| 5 | US-Q2-20 · 21 | 地图决策 / 冷启动种子帖 |

---

## 附录：Story 拆 Issue 模板

```markdown
### US-Q2-xx [标题]

**用户故事**  
作为 …，我想 …，以便 …

**验收标准**
- [ ] …

**合规**
- [ ] 无收费/无票务/无站内联系/无私密组队区
- [ ] AI 找队 = 检索公开帖，非配对承诺
- [ ] 文案符合 PRODUCT.md 推广口径

**技术范围**
- 前端：…
- 后端：…

**测试**
- [ ] 单元测试 / 手工验收步骤 …
```
