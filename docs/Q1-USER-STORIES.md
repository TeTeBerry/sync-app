# Q1 User Stories（ICP 备案 · 非经营性 · 可直接开发）

> **产品定位**：免费电音节资讯 + 观演准备工具 + 用户自发结伴信息展示。  
> **合规红线**：不收费、不卖票、不撮合交易、不提供站内联系/私信。  
> **主体**：OPC · 仅有 ICP 备案，无 ICP 经营许可证。  
> **关联代码**：Festival Plan `domains/festival-plan/`；结伴 `domains/partner-feed/`；协议 `src/legal/`。

**Story 格式**：`US-Q1-xx` · 优先级 P0/P1 · 体量 S/M/L · 依赖 · **状态**（✅ 已完成 / ⏸ 暂缓 / 🔲 未开始）

## 完成进度总览（截至 2026-06-20）

| ID | 标题 | 状态 | 备注 |
|----|------|------|------|
| US-Q1-01 | 首页「我的下一场」准备进度 | ✅ | |
| US-Q1-02 | 活动详情准备清单入口 | ✅ | 含出行攻略卡片「生成/查看」切换 |
| US-Q1-03 | 新用户 3 步引导 | ✅ | 首页首次登录后轻量 Sheet |
| US-Q1-04 | 活动信息来源标注 | 🔲 | |
| US-Q1-05 | 官方购票外链 | ⏸ | 产品暂缓 |
| US-Q1-06 | 阵容未官宣空状态 + 订阅 | ✅ | 模板 #624 活动预约提醒 |
| US-Q1-07 | 帖子规则筛选 | ✅ | 日期关键词已并入主搜索框 |
| US-Q1-08 | 发帖成功合规提示 | ✅ | |
| US-Q1-09 | 搜索失败降级 | ✅ | |
| US-Q1-10 | 隐私「仅好友」修正 | ✅ | 方案 A：`friends` → `private` |
| US-Q1-11 | 举报提交后状态 | ✅ | |
| US-Q1-12 | 帮助反馈成功页 | ✅ | |
| US-Q1-13 | 账号注销指引 | ✅ | |
| US-Q1-14 | 评论订阅消息验收 | ✅ | 前端 env + `WECHAT-E2E.md` |
| US-Q1-15 | 首页新回复深链 | ✅ | |
| US-Q1-16 | 人格测试分享优化 | 🔲 | |
| US-Q1-17 | 攻略分享合规文案 | ✅ | 复制文案含免责声明 |
| US-Q1-18 | 活动详情免责声明 | ✅ | |
| US-Q1-19 | Dev mock 开关说明 | ✅ | `POST-LIFECYCLE.md` §十一 |

**增量交付（无独立 Story 编号）**

- ✅ 出行攻略服务端 + 本地持久化；清空 AI 对话后「查看出行攻略」仍可打开
- ✅ `festival-plan-progress` 返回正确 `guideId`（非 jobId）

**合规验收（每条 Story 通用）**

- [ ] 无付费入口、无「平台担保/代售」文案
- [ ] UGC 仍走联系方式拦截 + 票务敏感词 + `msg_sec_check`（若涉及发帖/评论）
- [ ] 新文案符合 `platformDisclaimer` / 用户协议「信息与工具」表述

---

## Epic A · 观演准备闭环（Festival Plan）

### US-Q1-01 · 首页「我的下一场」展示准备进度 P0 · M · ✅ 已完成

**Story**  
作为已选择活动的用户，我想在首页看到下场活动的准备进度（攻略/时间表/组队），以便知道还差什么。

**验收标准**

- [x] `HomeMyNextEvent` 或相邻区域展示 `FestivalPlan` 进度（如 `2/3` + 下一项任务名）
- [x] 数据来自已有 `useFestivalPlanSummary` 或 `GET festival-plan-progress`（与 AI Tab 一致）
- [x] 点击进度条跳转活动详情或 AI Tab 对应任务
- [x] 未选择活动用户不展示该模块

**技术提示**：`pages/index/`、`domains/festival-plan/`、`hooks/sync/festivalPlanProgress.ts`

**依赖**：无

---

### US-Q1-02 · 活动详情顶部「完成准备」入口 P0 · M · ✅ 已完成

**Story**  
作为进入活动详情的用户，我想看到本场准备清单入口，以便从详情页直达攻略/时间表/发帖。

**验收标准**

- [x] 活动详情 `EventDetailComposerSection` 上方或内嵌折叠条：进度 + 未完成项 CTA
- [x] 与 AI Tab `FestivalPlanSummaryBar` 任务定义一致（`festivalPlanTaskDefs`）
- [x] 文案为「个人准备记录」，不出现「平台帮你组队成功」
- [x] **延伸**：`EventDetailAiTravelGuideCard` 未生成显示「生成出行攻略」，已生成显示「查看出行攻略」并打开上次攻略

**技术提示**：`packageEvent/pages/event-detail/`、`domains/festival-plan/FestivalPlanSummaryBar.tsx`

**依赖**：US-Q1-01（可并行，共用 checklist 组件更佳）

---

### US-Q1-03 · 新用户 3 步引导（可选跳过） P1 · L · ✅ 已完成

**Story**  
作为首次登录用户，我想被引导完成「选活动 → 打开 AI 生成攻略」，以便快速理解产品价值。

**验收标准**

- [x] 首次登录后展示最多 2 步轻引导（非强制全屏广告）
- [x] 可跳过；跳过后不再自动弹出（localStorage 标记）
- [x] 每步跳转现有页面（活动列表 / 活动详情 / AI Tab）
- [x] 引导结束不自动发帖、不收集额外权限

**技术提示**：新建 `components/onboarding/` 或首页 overlay；`utils/auth.ts` 登录成功回调

**依赖**：无

---

## Epic B · 活动资讯中枢

### US-Q1-04 · 活动详情展示信息来源 P1 · S · 🔲 未开始

**Story**  
作为浏览活动的用户，我想知道活动信息来源与更新时间，以便自行核对官方信息。

**验收标准**

- [ ] 活动详情展示「信息来源」一行（如：主办方公开信息 / 大麦公开页 / 官网）
- [ ] 后端 `Activity` 增加可选字段 `infoSource` + `infoUpdatedAt`（或复用现有 seed 元数据）
- [ ] 无来源时不展示该行

**技术提示**：`activity.schema.ts`、`ActivityService` seed、`apiMappers.ts`、活动详情 header

**依赖**：无

---

### US-Q1-05 · 官方购票外链（离开小程序） P0 · S · ⏸ 暂缓

**Story**  
作为想购票的用户，我想在活动详情点击「前往官方/正规渠道购票」，以便在平台外完成购票。

**验收标准**

- [ ] 当 `externalUrl` 或大麦 `damaiProjectId` 存在时，展示按钮「前往官方购票信息」
- [ ] 点击前二次确认：「本平台不销售票务，将跳转第三方页面」
- [ ] 使用 `Taro.openUrl` / web-view 外链或复制链接（按微信类目能力选型）
- [ ] 无链接时不展示按钮；**无返佣、无站内支付**

**技术提示**：`types/backend.ts` 已有 `externalUrl`；`activity.schema.ts` `damaiProjectId`

**依赖**：US-Q1-04（可并行）

---

### US-Q1-06 · 阵容未官宣时的空状态 + 订阅入口 P1 · M · ✅ 已完成

**Story**  
作为等待官宣的用户，当 `schedulePublished === false` 时，我想订阅阵容更新提醒，而不是看到空白错误。

**验收标准**

- [x] `exclusive-itinerary` 空状态文案：「阵容尚未官宣，请留意主办方发布」
- [x] 提供「订阅活动更新」按钮（复用微信订阅消息或站内通知偏好）
- [x] 活动变更时已有 `NoticeAgent` / `activity_update` 通知类型可触达
- [x] 不承诺官宣时间

**技术提示**：`useExclusiveItineraryPage.ts`、后端 `WECHAT_SUBSCRIBE_*` 模板（若扩展新模板需配置 env）

**依赖**：后端通知模板配置（运维）

---

## Epic C · 结伴「信息展示」优化

### US-Q1-07 · 活动帖列表筛选（规则，非推荐算法） P1 · M · ✅ 已完成

**Story**  
作为找搭子的用户，我想按出发城市、日期段筛选公开组队帖，以便快速浏览意向。

**验收标准**

- [x] 活动详情留言区：出发城市 chip 筛选（`departureCity`）
- [x] 日期关键词并入主搜索框（占位「搜索日期、内容、标签或地点」），与独立日期输入框合并
- [x] **纯客户端或 REST 字段过滤**，不引入「匹配度排序」付费逻辑
- [x] 规则筛选与 AI 搜索互斥（有搜索内容时禁用 chip 筛选）
- [x] 仍禁止帖内联系方式

**技术提示**：`useEventDetailPosts.ts`、`post-query` 可选增加 query 参数

**依赖**：无

---

### US-Q1-08 · 发帖成功后展示「公开信息提示」 P0 · S · ✅ 已完成

**Story**  
作为发帖用户，我想在发布成功后明确知道帖仅为公开信息展示，以便理解平台不提供联系与担保。

**验收标准**

- [x] 发帖成功 toast 或轻弹层含一句：「帖子为公开信息，请勿在备注中留联系方式；线下结伴请自行甄别」
- [x] 与 `ugcPublishCompliance` 文案一致，不新增矛盾承诺

**技术提示**：`useEventDetailBuddyPost.ts`、`publishBuddyPost.ts`

**依赖**：无

---

### US-Q1-09 · 搜索失败降级提示 P1 · S · ✅ 已完成

**Story**  
作为搜索组队帖的用户，当 AI 搜索失败时，我想看到明确提示和降级建议，而不是空列表。

**验收标准**

- [x] `useEventDetailPostSearch` 失败时 toast：「搜索暂时不可用，请用关键词筛选或稍后再试」
- [x] 自动 fallback 本地 `filterEventDetailPostsByQuery`
- [x] 不展示虚假结果

**技术提示**：`useEventDetailPostSearch.ts`

**依赖**：US-Q1-07（可选）

---

## Epic D · 合规与信任基建

### US-Q1-10 · 修正隐私设置「仅好友」选项 P0 · S · ✅ 已完成

**Story**  
作为设置隐私的用户，我想选项与实际能力一致，以免误以为有好友系统。

**验收标准**

- [x] 方案 A（推荐）：移除 `friends`，仅保留 `public` / `private`，迁移存量 `friends` → `private`
- [x] 设置页描述与 `privacy.util.ts` 行为一致

**技术提示**：`settings/index.tsx`、`user.schema.ts`、`privacy.util.ts`

**依赖**：无

---

### US-Q1-11 · 举报提交后状态展示 P1 · M · ✅ 已完成

**Story**  
作为举报用户，我想在举报后看到「已受理/处理中」说明，以便知道平台已记录。

**验收标准**

- [x] 举报成功 Modal 增加：`reviewStatus` pending 说明 + 预计人工复核提示
- [x] `GET /reports/status` 已在菜单展示「已举报」— 与 Modal 文案统一（`reportLabels.ts`）
- [x] 不承诺具体处理时限

**技术提示**：`ContentReportMenuButton.tsx`、`useContentReport.ts`

**依赖**：无

---

### US-Q1-12 · 帮助反馈提交成功页 P1 · S · ✅ 已完成

**Story**  
作为提交反馈的用户，我想看到明确的成功态与后续说明，以便知道 OPC 会人工处理。

**验收标准**

- [x] `HelpFeedbackSettings` 提交成功后展示编号或时间戳 + 「我们将在合理期限内回复（邮箱/站内）」
- [x] 不自动承诺 24h 响应（OPC 人力有限）

**技术提示**：`HelpFeedbackSettings.tsx`、`api/sync/feedback.ts`

**依赖**：无

---

### US-Q1-13 · 账号注销/数据删除指引 P1 · M · ✅ 已完成

**Story**  
作为想停止使用服务的用户，我想在设置里找到「删除数据/注销」指引，以便行使隐私权利。

**验收标准**

- [x] 设置 → 帮助与反馈 或隐私区块增加「申请删除账号与数据」
- [x] 展示步骤：提交反馈说明 + 邮箱（已有 `SUPPORT_EMAIL`）+ 将清除的数据范围摘要（引用隐私政策）
- [x] 后端 `POST /feedback` 支持 `type=account_deletion` 供筛选

**技术提示**：`legal/privacy-policy.ts`、`constants/supportContact.ts`

**依赖**：无

---

## Epic E · 通知与订阅（资讯类）

### US-Q1-14 · 评论/回复订阅消息配置验收 P0 · S · ✅ 已完成

**Story**  
作为发帖/评论用户，我在互动后授权订阅，以便收到评论回复提醒（非营销）。

**验收标准**

- [x] `.env` / `.env.production` 配置 `TARO_APP_SUBSCRIBE_TMPL_COMMENT` 等
- [x] 发帖/评论成功后调用 `requestPostEngagementSubscribe`（已有）
- [x] 文档 `WECHAT-E2E.md` 补充模板申请步骤与类目说明（含活动更新模板 #624）

**技术提示**：`wechatSubscribeMessage.ts`、后端 `WechatSubscribeMessageService`

**依赖**：微信后台模板审批（运维）

---

### US-Q1-15 · 首页「新回复」跳转定位评论 P1 · S · ✅ 已完成

**Story**  
作为收到组队帖回复的用户，我想从首页「N 条新回复」直达该帖并展开评论。

**验收标准**

- [x] `HomeMyNextEvent` 回复提示点击 → `goEventDetail` 带 `postId` + `openComments=1`
- [x] 进入后滚动高亮帖子并展开评论区（`EventPostsVirtualList` 滚动重试）

**技术提示**：`navigateFromNotification` 已有类似逻辑，对齐首页入口

**依赖**：无

---

## Epic F · 增长（非交易）

### US-Q1-16 · 人格测试结果分享卡片优化 P1 · M · 🔲 未开始

**Story**  
作为完成人格测试的用户，我想分享结果卡片到微信好友，以便传播但不引导购票。

**验收标准**

- [ ] 分享标题/图片不含票价、代购、加微信等文案
- [ ] 分享 path 落地人格测试页或结果页（已有 `onShareAppMessage` 则验收 + 文案审核）
- [ ] 卡片展示 Soul DJ + 类型名，底部小字合规声明可选

**技术提示**：`PersonalityResultView.tsx`、`packageEvent/pages/personality-test/`

**依赖**：无

---

### US-Q1-17 · 出行攻略分享文案合规检查 P1 · S · ✅ 已完成

**Story**  
作为分享攻略的用户，复制/分享文案中应包含「仅供参考、自行核实」提示。

**验收标准**

- [x] `travelGuideShareText` 或分享按钮附带一行 `AI_TRAVEL_GUIDE_DISCLAIMER` 摘要
- [x] 攻略详情页展示 `AI_TRAVEL_GUIDE_DISCLAIMER`，不出现「平台代购/订票」表述

**技术提示**：`domains/travel-guide/utils/travelGuideShareText.ts`

**依赖**：无

---

## Epic G · 工程与体验（支撑合规交付）

### US-Q1-18 · 活动详情合规提示常驻 P0 · S · ✅ 已完成

**Story**  
作为任意用户，我在活动详情底部始终能看到平台免责声明。

**验收标准**

- [x] `PlatformDisclaimer` 或等价文案在详情页底部可见（与首页一致）
- [x] 文案使用 `constants/platformDisclaimer.ts` 单点；`POST-LIFECYCLE.md` 已引用

**技术提示**：`event-detail/index.tsx`（若已有则标为验收 Story）

**依赖**：无

---

### US-Q1-19 · Dev mock 数据开关说明 P1 · S · ✅ 已完成

**Story**  
作为开发者，我想在文档中明确 dev mock 帖开关，以免误带到生产。

**验收标准**

- [x] `README` 或 `POST-LIFECYCLE.md` 说明 `DISABLE_DEV_MOCK_POSTS`、`PostDevMockSeedService` 仅非 production
- [x] 生产构建 `NODE_ENV=production` 不 seed mock

**技术提示**：`post-dev-mock-seed.service.ts`

**依赖**：无（文档 Story）

---

## 建议迭代顺序（2 个 Sprint 示例）

### Sprint 1（合规 + 核心闭环）— ✅ 已完成（US-Q1-05 暂缓）

| 顺序 | ID | 说明 | 状态 |
|------|-----|------|------|
| 1 | US-Q1-10 | 隐私选项修正，避免虚假宣传 | ✅ |
| 2 | US-Q1-18 | 免责声明验收 | ✅ |
| 3 | US-Q1-05 | 官方购票外链 | ⏸ 暂缓 |
| 4 | US-Q1-01 | 首页准备进度 | ✅ |
| 5 | US-Q1-02 | 详情准备清单 | ✅ |
| 6 | US-Q1-08 | 发帖合规提示 | ✅ |
| 7 | US-Q1-14 | 订阅消息配置验收 | ✅ |

### Sprint 2（体验 + 信任）— ✅ 已完成（US-Q1-04 未做）

| 顺序 | ID | 说明 | 状态 |
|------|-----|------|------|
| 1 | US-Q1-07 | 帖子筛选 | ✅ |
| 2 | US-Q1-09 | 搜索失败降级 | ✅ |
| 3 | US-Q1-06 | 官宣空状态 + 订阅 | ✅ |
| 4 | US-Q1-15 | 首页回复深链 | ✅ |
| 5 | US-Q1-11 | 举报状态 | ✅ |
| 6 | US-Q1-12 / US-Q1-13 | 反馈与注销指引 | ✅ |
| 7 | US-Q1-04 | 信息来源标注 | 🔲 |

### Sprint 3（增长 · 可选）— 部分完成

US-Q1-03 ✅；US-Q1-16、US-Q1-17（微信分享标题）待排期

---

## 明确不纳入 Q1（需 ICP 许可证或其他资质）

| 需求 | 原因 |
|------|------|
| 会员 / 付费 AI | 经营性收费 |
| 站内私信 / 换联系方式 | 社交撮合 + 审核压力 |
| 票务销售 / 代抢 / 佣金外链 | 票务经营资质 |
| 付费置顶帖 / 广告位 | 经营性信息发布 |
| 平台担保见面 / 实名认证搭子 | 隐含服务承诺与责任 |

---

## 附录：Story 拆任务模板（复制到 Issue）

```markdown
### US-Q1-xx [标题]

**用户故事**  
作为 …，我想 …，以便 …

**验收标准**
- [ ] …

**合规**
- [ ] 无收费/无票务/无站内联系
- [ ] 文案符合信息与工具定位

**技术范围**
- 前端：…
- 后端：…

**测试**
- [ ] 单元测试 / 手工验收步骤 …
```
