# Q2 User Stories（推广主轴 · 组队招募改版 · 仅 ICP 备案）

> **产品定位（Q2）**：免费电音节资讯 + **活动列表搜节** + **公开组队招募**展示与 **AI 检索**（非撮合、不私信、不售票）。  
> **对外一句话**：电音节资讯与公开组队招募；招募支持 AI 筛选。  
> **合规红线**：不收费、不卖票、不撮合交易、不提供站内联系/私信、无队内私密评论、无「联系队友」。  
> **主体**：OPC · 仅有 ICP 备案，无 ICP 经营许可证。  
> **阶段**：**上线冲刺** — 目标 2026-07-06 前提审；验证「选活动 → 公开招募墙 → AI 筛帖 → 公开回复」闭环。  
> **功能总览**：[PRODUCT.md](./PRODUCT.md)  
> **Q1 基线**：[Q1-USER-STORIES.md](./Q1-USER-STORIES.md)  
> **关联代码**：`domains/partner-feed/` · `post-search.service.ts` · `pages/events/` · `pages/index/` · `packageEvent/pages/event-detail/`

> **关联代码**：`domains/partner-feed/` · `post-search.service.ts` · `pages/events/` · `pages/index/` · `packageEvent/pages/event-detail/`  
> **无感 Agent**：[SCENE-AGENT.md](./SCENE-AGENT.md)（US-Q2-31～34 · **41～48**）

**Story 格式**：`US-Q2-xx` · 优先级 P0/P1/P2 · 体量 S/M/L · 依赖 · **状态**（✅ / 🚧 / ⏸ / 🔲 / ❌）

**状态图例**：✅ 已完成 · 🚧 进行中（部分验收已通过）· ⏸ 阻塞/待决策 · 🔲 未开始 · ❌ 已取消 / MVP 不做

---

## 上线冲刺（约 2 周 · 3～4 大需求/天 · 目标 2026-07-06 前提审）

**原则**：上线包只保 **招募墙不空、AI 找队可用、合规过审**；无感 Agent **先轻后重**（洞察行 + 规则引导先行，完整 `scene-run` 上线后）。

### 冷启动双轨（产品决策 · 2026-06）

| 轨道 | 解决什么 | Story |
|------|----------|-------|
| **种子招募帖** | 招募墙不空、测完/裂变用户进来有帖可看 | US-Q2-21 |
| **人格测试微信裂变** | 低成本拉新 + 测完沉淀曲风 `favorGenres` | US-Q2-18（分享）· US-Q2-27（写偏好）· US-Q2-17（测完→招募墙） |

现网已具备：`onShareAppMessage` / 朋友圈分享、分享 path（`share=1` · `primaryType` · `soulDjId`）、好友落地 teaser、海报分享、首页入口。**冷启动可先推卡片分享**；人格写偏好与洞察行已随 **US-Q2-27 Lite** 交付，测完转化仍待 US-Q2-17 收口。详见 [PRODUCT.md §2.6](./PRODUCT.md#26-冷启动双轨)。

### 上线包 · 必做（P0）

| 序 | ID | 标题 | 体量 | 目标周 | 状态 |
|----|-----|------|------|--------|------|
| 1 | US-Q2-21 | 冷启动种子招募帖（运营） | S | W1 | 🔲 |
| 2 | US-Q2-06 | 组队动态口径终检 | XS | W1 | ✅ |
| 3 | — | 发版冒烟 + 微信类目/文案终检 | S | W2 | 🔲 |
| 4 | US-Q2-05 | 活动详情 AI 找队 | S | — | ✅ |
| 5 | US-Q2-16 | 招募帖字段扩展 | M | — | ✅ |
| 6 | US-Q2-15 | 观演准备收进详情折叠区 | S | — | ✅ |
| 7 | US-Q2-01 | 全站推广口径与合规文案 | S | — | ✅ |
| 8 | US-Q2-36 | 全球电音节资讯目录（活动 Tab + 详情资讯区） | M | W1 | ✅ |

**W1** = 冲刺第 1 周（～06-23～06-29）· **W2** = 提审前（～06-30～07-06）

### 上线包 · 冲刺交付（P1/P2 · 高产能纳入提审）

> **排期假设（2026-06-23 更新）**：开发产能 **3～4 个大需求/天**（S/M = 1 项 · L ≈ 1 天）；提审日 **07-06 不变**。原「上线后」项按依赖顺序前移至 D1～D10，D11～D14 仍留冒烟 + 提审 buffer。

| 序 | ID | 标题 | 体量 | 目标日 | 状态 |
|----|-----|------|------|--------|------|
| 9 | US-Q2-27 | 用户偏好 Full（`budgetLevel` · 列表开关 · 设置说明） | M | D1 | 🚧 |
| 10 | US-Q2-30 | 攻略串联找队 / 发招募预填 | S | D1 | 🚧 |
| 11 | US-Q2-34 | 观演准备智能下一步（规则版 Prep Nudge） | XS | — | ✅ |
| 12 | US-Q2-25 | 招募列表筛选（仅招募中 / 城市 chip） | S | — | ✅ |
| 13 | US-Q2-26 | 招募进度帖主自维护（+1 / 改人数） | S | — | ✅ |
| 14 | US-Q2-35 | 出行攻略预算对比选档（生成后三卡 + 写偏好） | S | — | ✅ |
| 15 | US-Q2-17 | 人格测试 → 找队/发招募 CTA | M | D2 | 🔲 |
| 16 | US-Q2-18 | 人格测试分享卡片终检 + 裂变埋点 | S | D2 | 🔲 |
| 17 | US-Q2-23 | 申请加入结构化 Sheet | M | D2 | 🔲 |
| 18 | US-Q2-24 | 发帖场景字段（拼房/曲风/经验等） | M | D2 | 🔲 |
| 19 | US-Q2-33 | 阵容 DJ 点选无感解读 | S | D3 | 🔲 |
| 20 | US-Q2-28 | AI 辅助发招募（暗号 / 组队卡预览） | M | D3 | 🔲 |
| 21 | US-Q2-29 | 翻招募卡（人格测试串联） | M | D3 | 🔲 |
| 22 | US-Q2-31 | Scene Agent 运行时（`scene-run` + effects） | L | D3～D4 | 🔲 |
| 23 | US-Q2-32 | 招募墙动态筛选 Chip（Scene） | M | D4 | 🔲 |
| 24 | US-Q2-37 | Raver 模式（本地 / 追节） | M | D4 | 🔲 |
| 25 | US-Q2-38 | 室内活动 catalog 收录与多城 | M | D4 | 🔲 |
| 26 | US-Q2-39 | 本地城市 Hub 聚合页 | M | D5 | 🔲 |
| 27 | US-Q2-40 | 室内活动详情 · 艺人介绍 | M | D5 | 🔲 |

> **资讯轴（US-Q2-36）** ✅ 已验收：活动 Tab 目录增强 + 详情资讯区 + US-Q2-12 来源标注。

### 明确推迟到上线后（Post-launch）

| ID | 标题 | 原因 |
|----|------|------|
| US-Q2-19 | 艺人 Tab → 活动串联 | ⏸ 查节辅助；catalog 艺人覆盖不足时可延后 |
| US-Q2-41～48 | Scene AI 增强（节故事 / 推荐 / 必看 set 等） | Sprint 6～8 | 见 [PRODUCT.md §8.1](./PRODUCT.md#81-scene-ai-增强路线图无感-agent--2026-06) |
| US-Q2-39 Hub 跨场 AI 找队 API · 翻卡跨场 | Sprint 8 深化 | 依赖 D5 Hub 上线后有本地数据 |
| US-Q2-20 | 地图 Tab | ❌ MVP 不做 |

**P0 验收指标（上线后 4 周内看行为）**

| 指标 | 说明 |
|------|------|
| AI 找队使用率 | 详情 AI 搜索 / 进详情 UV |
| 发招募 | 热门活动有可见帖（含种子） |
| 招募 → 公开回复转化 | 「申请加入」后发公开评论比例 |
| 合规 | 类目/审核无驳回；联系方式拦截正常 |
| 查节 → 选活动 | 活动 Tab 搜索/地区筛选后进详情或 register 率（US-Q2-36） |
| 人格裂变（可选观测） | 分享次数 · 分享落地 UV · 落地→测完率 · 测完→进招募墙率 |
| **节故事**（Sprint 7+） | 展开率 · 展开者 register / AI 找队率（US-Q2-41） |
| **申请评论 AI**（Sprint 6+） | 草稿使用率 · 使用后发评论转化率（US-Q2-44） |

### P1 — 上线后第 1～2 周（数据驱动 + 解阻项）

| 序 | ID | 标题 | 体量 | 状态 | 说明 |
|----|-----|------|------|------|------|
| 1 | US-Q2-19 | 艺人 Tab → 活动串联 | S | ⏸ | catalog 艺人覆盖达标后启动 |
| 2 | — | 裂变 / 找队行为看板 + P0 指标周报 | S | 🔲 | 对照上线包验收指标调优 |
| 3 | US-Q2-27 | 偏好排序 A/B（权重微调） | S | 🔲 | 有 AI 找队使用数据后 |

### P2 — 有互动数据后（增长深化 · Scene AI）

| ID | 标题 | 体量 | Sprint | 状态 | 前提 |
|----|------|------|--------|------|------|
| US-Q2-43 | 阵容必看 set（偏好高亮 + 行程） | M | 6 | 🔲 | 阵容官宣 · Q2-33 |
| US-Q2-44 | 申请加入公开评论 AI 草稿 | S | 6 | 🔲 | Q2-31 或 REST 映射 |
| US-Q2-47 | 官宣前往年规律洞察 | XS | 6 | 🔲 | 规则为主 · `lineupPublished` |
| US-Q2-41 | 电音节故事（起源与发展） | S | 7 | 🔲 | 运营结构化稿 3～5 场热门节 |
| US-Q2-42 | 哪场节适合我（人格+偏好推荐） | M | 7 | 🔲 | Q2-17 · Q2-27 |
| US-Q2-48 | 节别生存指南（攻略增强） | S | 7 | 🔲 | 攻略生成后 |
| US-Q2-39 | 本地 Hub 跨场 AI 找队 API | M | 8 | 🔲 | D5 Hub 上线 · 上海 UV |
| US-Q2-45 | 活动 Tab 自然语言搜节 | M | 8 | 🔲 | Q2-13 列表基线 ✅ |
| US-Q2-46 | 双节对比卡 | S | 8 | 🔲 | catalog ≥2 场可对比 |
| US-Q2-29 | 翻招募卡跨场扩展 | M | 8 | 🔲 | US-Q2-29 首版 + 多城 seed |
| — | 深圳 / 香港 city seed 扩量 | S | 8 | 🔲 | US-Q2-38 catalog 稳定后 |

### MVP 明确不做

| 事项 | 处理 |
|------|------|
| 恢复准备 Tab / AI 多轮对话 | ❌ 用户不喜欢 + US-Q2-22 已收口 |
| US-Q2-11 对话内找帖 | ❌ 已取消 |
| US-Q2-09 / 10 准备 Tab 瘦身与查节示例 | ❌ 由 US-Q2-22 取代 |
| 活动 Tab「问 AI」兜底 | ❌ 与去对话化一致 |
| US-Q2-20 地图 Tab 上线 | ❌ MVP 建议 **B 下线**未挂载代码 |
| 官方购票返佣（Q1-05） | ⏸ 暂缓 |
| 付费 / 私信 / 点赞 / team-chat | ❌ 合规不做 |
| 首页全站招募帖流 / 全国帖子广场 | ❌ 主路径仍是活动详情招募墙 |
| 塔罗 / 占卜式「抽队友」 | ❌ 微信类目与合规；可做「翻公开招募卡」 |
| 申请加入自动改进度 / 接受申请入队 | ❌ 公开评论与招募进度解耦 |
| 上线前做完整 Scene Agent API + 对话 Tab | ❌ 见 [SCENE-AGENT.md](./SCENE-AGENT.md) 分阶段 |
| 活动 Tab 独立「资讯」流 / UGC 新闻 | ❌ 节讯 = 结构化活动目录 + 详情资讯区（US-Q2-36） |
| 中外籍两套用户管理 / 外籍数据存境外 | ❌ 见 [PRODUCT.md §1.5](./PRODUCT.md#15-国际化与用户体系合规--2026-06) |
| AI 自动代发评论或发帖（无用户确认） | ❌ 须 candidates 模式由用户选草稿 |
| 匹配度 / 最佳搭子 / 缘分队友 | ❌ 撮合承诺 |

---

## 完成进度总览（截至 2026-06-23）

**Sprint 3～4 已交付**：去对话化 · 活动搜索 · 招募卡片/字段 · AI 找队 · 详情 IA · 合规文案。

**Sprint 5（当前）**：**上线冲刺 ～2 周 · 3～4 大需求/天** — 种子帖 · 偏好 Full · 裂变闭环 · Scene Agent · 本地室内轴 · **07-06 提审不变**。

| ID | 标题 | 上线包 | 状态 |
|----|------|--------|------|
| US-Q2-22 | 去除准备 Tab / 去对话化 | — | ✅ |
| US-Q2-01 | 全站推广口径与合规文案统一 | P0 补漏 | ✅ |
| US-Q2-02 | 首页双 CTA（搜节 / 找队） | — | ✅ |
| US-Q2-03 | 招募帖卡片改版 | — | ✅ |
| US-Q2-04 | 「申请加入」+ 预填公开评论 | — | ✅ |
| US-Q2-05 | 活动详情 AI 找队 | **P0** | ✅ |
| US-Q2-06 | 组队动态（公开回复） | **P0 必做** | ✅ |
| US-Q2-08 | Festival Plan 跳转统一 | — | ✅ |
| US-Q2-09 | ~~准备 Tab 方案 C 瘦身~~ | — | ❌ |
| US-Q2-10 | ~~首页/准备 Tab 查节示例~~ | — | ❌ |
| US-Q2-11 | ~~Agent `search_buddy_posts`~~ | — | ❌ |
| US-Q2-12 | 活动信息来源标注 | **P0**（随 Q2-36） | ✅ |
| US-Q2-13 | 活动 Tab 搜节（列表过滤） | — | ✅ |
| US-Q2-14 | 新用户引导改序 | — | ✅ |
| US-Q2-15 | 观演准备收进详情折叠区 | **P0** | ✅ |
| US-Q2-16 | 招募帖字段扩展 | **P0** | ✅ |
| US-Q2-17 | 人格测试 → 找队/发招募 CTA | **冲刺 D2** | 🔲 |
| US-Q2-18 | 人格测试分享卡片 | **冲刺 D2** | 🔲 |
| US-Q2-19 | 艺人 Tab → 活动串联 | 上线后 | ⏸ |
| US-Q2-20 | 地图 Tab 决策落地 | — | ❌ MVP 下线 |
| US-Q2-21 | 冷启动种子招募帖（运营） | **P0 · D1** | 🔲 |
| US-Q2-23 | 申请加入结构化 Sheet | **冲刺 D2** | 🔲 |
| US-Q2-24 | 发帖场景字段扩展 | **冲刺 D2** | 🔲 |
| US-Q2-25 | 招募列表筛选/排序增强 | — | ✅ |
| US-Q2-26 | 招募进度帖主自维护 | — | ✅ |
| US-Q2-27 | 用户偏好优先排序 | **冲刺 D1** | 🚧 |
| US-Q2-28 | AI 辅助发招募（预览发布） | **冲刺 D3** | 🔲 |
| US-Q2-29 | 翻招募卡（人格串联） | **冲刺 D3** | 🔲 |
| US-Q2-30 | 攻略串联找队 / 发招募预填 | **冲刺 D1** | 🚧 |
| US-Q2-31 | Scene Agent 运行时 | **冲刺 D3～D4** | 🔲 |
| US-Q2-32 | 招募墙动态筛选 Chip | **冲刺 D4** | 🔲 |
| US-Q2-33 | 阵容 DJ 无感解读 | **冲刺 D3** | 🔲 |
| US-Q2-34 | 出征准备 Prep Nudge | — | ✅ |
| US-Q2-35 | 出行攻略预算对比选档 | — | ✅ |
| US-Q2-36 | 全球电音节资讯目录 | **P0** | ✅ |
| US-Q2-37 | Raver 模式（本地 / 追节） | **冲刺 D4** | 🔲 |
| US-Q2-38 | 室内活动 catalog 收录与多城 | **冲刺 D4** | 🔲 |
| US-Q2-39 | 本地城市 Hub 聚合页 | **冲刺 D5** | 🔲 |
| US-Q2-40 | 室内活动详情 · 艺人介绍 | **冲刺 D5** | 🔲 |
| US-Q2-41 | 电音节故事（起源与发展） | Sprint 7 | 🔲 |
| US-Q2-42 | 哪场节适合我（人格+偏好推荐） | Sprint 7 | 🔲 |
| US-Q2-43 | 阵容必看 set | Sprint 6 | 🔲 |
| US-Q2-44 | 申请加入公开评论 AI 草稿 | Sprint 6 | 🔲 |
| US-Q2-45 | 活动 Tab 自然语言搜节 | Sprint 8 | 🔲 |
| US-Q2-46 | 双节对比卡 | Sprint 8 | 🔲 |
| US-Q2-47 | 官宣前往年规律洞察 | Sprint 6 | 🔲 |
| US-Q2-48 | 节别生存指南（攻略增强） | Sprint 7 | 🔲 |

**合规验收（每条 Story 通用）**

- [ ] 无付费入口、无「平台担保/代售/配对成功」文案
- [ ] 无「联系队友」、站内私信、队内私密评论、私密投递 inbox
- [ ] UGC 仍走联系方式拦截 + 票务敏感词 + `msg_sec_check`
- [ ] 「AI 找队」表述为检索公开信息，非智能配对
- [ ] 新文案符合 `platformDisclaimer` / 用户协议

**明确不纳入（需经营许可证或其他资质）**

| 需求 | 原因 |
|------|------|
| 队内私密评论 / team-chat 恢复 | 站内私密通讯 + 撮合 |
| 「联系队友」、展示联系方式 | 与协议冲突 |
| 私密投递 inbox、邀请接受/拒绝 | 平台撮合关系 |
| 付费匹配 / 会员 | 经营性 |
| 官方购票返佣（Q1-05） | 票务经营 · 继续暂缓 |

---

## Epic A · 合规与推广口径

### US-Q2-01 · 全站推广口径与合规文案统一 P0 · S · ✅

**Story**  
作为运营/审核人员，我希望全站文案与对外推广一致，以便在仅 ICP 备案下过审且不误导用户。

**验收标准**

- [x] 「匹配」类文案改为「检索 / 筛选 / 找到 N 条公开招募」
- [x] 全站无「联系队友」「配对成功」「平台担保」
- [x] `zh-CN` / `en-US` 对齐（英文避免无 disclaimer 的 `buddy-matching`）
- [x] **Sprint 4 补漏**：`PRODUCT.md` §1.4 自检表与 §1.1 一致（对外一句 = 资讯 + 公开招募 + AI 筛选；不说「用 AI 查电音节」作主 slogan）
- [x] 首页 `HomeAiEntry`、AI 找队结果、发帖成功处与 `platformDisclaimer` 终检

**技术提示**：`src/i18n/messages/` · `constants/platformDisclaimer.ts` · `PRODUCT.md` §1.4

**依赖**：无

---

## Epic B · 组队招募改版

### US-Q2-03 · 招募帖卡片改版 P0 · L · ✅

**Story**  
作为找队用户，我想在活动详情看到清晰的「招募中」帖子与人数进度，以便快速判断是否合适。

**验收标准**

- [x] 「活动帖子」改文案为「组队招募」
- [x] 卡片展示：招募中/已满角标、人数进度（如 2/3）、`#组队` 标签
- [x] 卡片底部「申请加入」+ 评论 icon
- [x] **无点赞**
- [x] 列表仍仅 `listedInFeed !== false` 的公开帖

**技术提示**：`EventPostCard` · `domains/partner-feed/` · `parseBuddyPostRecruitDisplay.ts`

**依赖**：US-Q2-16 ✅

---

### US-Q2-04 · 「申请加入」按钮 + 预填公开评论 P0 · M · ✅

**Story**  
作为想加入的用户，我想在招募帖上看到「申请加入」，用预填内容快速发一条**公开评论**表达意向。

**验收标准**

- [x] 非帖主、招募中显示「申请加入」；已满置灰
- [x] 点击 → 展开评论区 + `commentDraft` 预填模板
- [x] `POST /posts/:id/comments`（公开）；轻提示「将公开发表，请勿留联系方式」
- [x] **不做**私密申请 / `apply` 表

**结构化增强**：见 **US-Q2-23**（P1，不阻塞本 Story 已交付能力）

**技术提示**：`EventPostCard` · `PostCommentSection` · `useEventDetailPosts.openPostComments`

---

### US-Q2-16 · 招募帖字段扩展 P0 · M · ✅

**Story**  
作为发招募用户，我想设置招募状态与人数，以便列表展示「招募中 2/3」，摆脱「普通长文帖」观感。

**验收标准**

- [x] Post 增加字段：`recruitStatus`（`open`/`full`）、`slotsTotal`、`slotsFilled`
- [x] 发帖 Sheet 可填人数；默认 `open`（详情页帖主可切换已满）
- [x] 帖主可在我的招募帖或详情自己的帖上切换「已满」
- [x] API 与 `EventDetailPost` mapper 同步；卡片优先读字段，正文解析作降级

**技术提示**：`post.schema.ts` · `PostWriteService` · `buddyPostForm.ts` · `EventPostCard`

**依赖**：无

---

### US-Q2-21 · 冷启动种子招募帖 P0 · S · 🔲

**Story**  
作为运营，热门活动详情需要有可见招募帖，避免空城导致「不好用」。

**产品原则（与 US-Q2-18 人格裂变配合）**

- 种子帖解决 **供给侧**（墙上有帖）；人格裂变解决 **拉新 + 偏好**（用户进来且测完有 `favorGenres`）
- 人格结果页 / 测完 CTA 默认跳转的活动，应优先指向**已有种子帖**的热门活动（US-Q2-17）
- 仅有裂变、无种子 → 测完进招募墙空城；仅有种子、无裂变 → 早期 UV 与偏好密度不足

**验收标准**

- [ ] 生产环境不 seed mock；staging/运营流程文档化（`POST-LIFECYCLE.md` §十一）
- [ ] 热门活动有少量**结构化**示例招募（出发地、人数、备注；合规、无联系方式）
- [ ] 种子帖样式与 US-Q2-16 字段一致（staging mock 已对齐；生产靠运营发帖）

**技术提示**：运营 SOP · `PostDevMockSeedService`（仅 staging）

**依赖**：无（可与 US-Q2-16 并行；运营可先用现模板发帖）· 协同 US-Q2-17 / US-Q2-18

---

### US-Q2-23 · 申请加入结构化 Sheet P1 · M · 🔲

**Story**  
作为想加入的用户，我想用简短表单表达意向，生成**固定版式**的公开回复，而不是自由灌水评论。

**验收标准**

- [ ] 点「申请加入」→ 轻量 Sheet（人数、出发地、时间是否可配合、一句话自我介绍）
- [ ] 提交仍走 `POST /posts/:id/comments`；正文为固定模板拼接
- [ ] 评论区展示结构化回复（可选：与自由评论区分样式）
- [ ] 无联系方式；合规提示与 US-Q2-04 一致

**技术提示**：`EventPostCard` · 新 `ApplyJoinSheet` · `ugcContactValidation`

**依赖**：US-Q2-04

---

### US-Q2-24 · 发帖场景字段扩展 P1 · M · 🔲

**Story**  
作为发招募用户，我想补充电音节场景信息（如拼房、曲风偏好、新手/老手），以便他人判断，且与泛搭子帖区分。

**验收标准**

- [ ] 发帖 Sheet 增加 2～3 个可选公开字段（具体命名产品定稿）
- [ ] 写入 Post 扩展字段或结构化正文段；招募卡展示为标签/行，非长段落
- [ ] AI 搜索可索引新字段（`buddy-post-search.util.ts`）
- [ ] 合规：仍为公开信息，无联系方式

**技术提示**：`AiBuddyPostSheet` · `buddyPostForm.ts` · `post.schema.ts`

**依赖**：US-Q2-16 ✅（可并行，字段命名对齐）

---

### US-Q2-25 · 招募列表筛选/排序增强 P1 · S · ✅

**Story**  
作为找队用户，我想按出发地、招募状态、还差人数快速浏览，而不只按时间刷帖。

**验收标准**

- [x] 在现有城市 chip（`EventDetailPostFilterBar`）基础上，支持「仅招募中」或按 `slots` 排序（可先前端）
- [x] 与 AI 搜索互斥规则与现网一致（搜索时禁用 chip）
- [x] 无「智能匹配」表述

**技术提示**：`useEventDetailPostFilters` · `filterEventDetailPostsByRules.ts`

**依赖**：US-Q2-16 ✅（排序依赖 slots 字段时）

---

### US-Q2-26 · 招募进度帖主自维护 P1 · S · ✅

**Story**  
作为发招募用户，我想在确定有人同行后手动更新「已确定人数」，以便进度条真实反映小队状态；平台不替我确认队友。

**背景（产品原则）**

- 「申请加入」= **公开评论**，**不**自动 `slotsFilled + 1`
- 进度条 = **帖主自报**，非平台核实组队结果
- 与合规「非撮合、非担保」一致

**验收标准**

- [x] 发帖时若填 `slotsTotal`，创建时显式写入 `slotsFilled = 1`（含帖主）
- [x] 帖主在自己的招募卡上可操作：**进度条 ± 步进**（改人数）、保留现有 **「标为已满 / 重新招募」**
- [x] `slotsFilled` 下限为 1（含帖主）；达 `slotsTotal` 时后端 normalize 可标为已满
- [x] 进度展示 `filled/total`（如 2/3）
- [x] **不做**：路人改进度、评论成功自动 +1、「接受申请」按钮

**合规**

- [x] 无「XX 已加入你的队伍」「组队成功」文案
- [x] 仍走 `PATCH /posts/:id/recruit`（仅帖主）

**技术提示**：`PostOwnerSlotStep` · `PostOwnerRecruitStatusButton` · `updatePostRecruit` · `buddy-post-recruit.util`（`slotsFilled` 下限 1）· `EventPostCard` · `useEventDetailPosts.handleRecruitSlotsAdjust`

**依赖**：US-Q2-16 ✅

---

### US-Q2-06 · 组队动态（公开回复） P1 · M · ✅

**Story**  
作为发帖用户，我想在首页看到招募帖的**新公开回复**提醒，并能跳进评论区。

**验收标准**

- [x] 首页「我的下一场」：`myNextEventPostEngagement.unreadReplyCount` →「你的招募帖有 N 条新公开回复」
- [x] 点击提醒 → `goEventDetail` 带 `postId` + `focusPosts=1` + `openComments=1`
- [x] 站内通知 `comment` / `comment_reply` 深链同上（`navigateFromNotification`）
- [x] 微信订阅消息（US-Q1-14）仍走评论/回复模板
- [x] 全站「招募帖」「新公开回复」口径终检（首页 i18n、站内通知模板；与 US-Q2-01 联动）
- [x] `rg` 无「联系队友 / 配对成功 / 平台担保 / buddy-matching」命中（`src/`）
- [x] **不做**投递 inbox / 联系队友 / 邀请卡片

**技术提示**：`HomeMyNextEvent.tsx` · `home.service.ts` · `notification-templates.util.ts` · `POST-LIFECYCLE.md` §八

**依赖**：US-Q1-14 ✅ · US-Q1-15 ✅ · US-Q2-01 ✅

---

## Epic C · AI 找队

### US-Q2-05 · 活动详情 AI 找队 P0 · M · ✅

**Story**  
作为用户，我想在活动详情用一句话**检索**公开招募帖，体现「招募支持 AI 筛选」差异点。

**现网实现（已完成）**

- `EventDetailPostSearchBar` + `POST /posts/ai-search`
- 城市 chip；失败本地降级
- 结果替换帖列表

**Sprint 4 剩余验收（P0）**

- [x] 占位示例：「上海出发，6.14，差 1 人」
- [x] 结果 meta：「找到 N 条合适的**公开招募**」（非「匹配」）
- [x] 展示 API `parsed` 一行摘要（出发地·日期等）
- [x] 搜索无结果：引导「发一条招募」+ 合规一行（FAB / Sheet）
- [x] 区块标题与发帖 FAB 与 US-Q2-03 一致

**明确不做**

- [x] 独立「AI 找队」页面
- [x] 对话内检索（US-Q2-11 已取消）

**代码**：`useEventDetailPostSearch.ts` · `EventDetailPostSearchBar.tsx` · `formatBuddyPostSearchParsedSummary.ts`

---

### US-Q2-27 · 用户偏好优先排序（AI 找队增强） P1 · M · 🚧

**Story**  
作为找队用户，我希望系统用我在设置里保存的偏好（出发城市、曲风、预算），在 **AI 检索公开招募** 时对结果做优先排序；偏好可来自人格测试、出行攻略自动写入，也可在设置页修改。**官宣前无专属时间表时，人格曲风是主要可用偏好信号。**

**上线包拆分（W2 有余力）**

| 档位 | 范围 | 状态 |
|------|------|------|
| **Lite（推荐上版）** | AI 找队 `insight_line` + 人格完成写 `favorGenres`（官宣前找队增强） | ✅ |
| **Full（上线后）** | `budgetLevel` 打分 · 列表「按偏好排序」开关 · 设置页说明 | 🔲 |

**背景**

- 专属时间表通常临近开场、依赖主办方官宣；**公开组队往往在官宣前已开始**
- 人格测试可在任意时刻完成，是官宣前 AI 找队的主要可用偏好信号（曲风 `favorGenres`）
- 后端已有：`rankBuddyPostsBySearch` 在关键词打分后，用 `city` / `favorGenres` 作次排序（`scoreBuddyPostPreferenceMatch`）
- **Lite 已交付**：人格测试 sync `favorGenres`；AI 找队洞察行 + 「已按偏好排序」文案
- **Full 待做**：`budgetLevel` 参与打分；列表偏好开关；设置页说明
- **冷启动**：裂变新用户测完写 `favorGenres` 后，首次 AI 找队即可感知偏好排序（与 US-Q2-18 / 17 串联）

**验收标准**

- [x] 人格测试完成 → `mergeUserProfileHints` 写入 `favorGenres`（来自类型 `genreTags`，不覆盖用户手改）
- [x] 出行攻略：**点选预算档后** `applyTravelGuideHints`（US-Q2-35）；发帖 `applyBuddyPostHints`（现网保持）
- [ ] `scoreBuddyPostPreferenceMatch` 增加 `budgetLevel` 弱信号（权重低于城市/曲风）
- [x] AI 找队结果区展示一行：「已参考你的偏好：{城市} · {曲风} · {预算}」（无偏好则不展示）
- [x] 文案为「找到 N 条合适的公开招募（已按偏好排序）」，**非**「匹配度」「配对成功」
- [ ] （可选 P1）招募列表开关：「按我的偏好优先展示」— **只排序不过滤** 帖子
- [ ] 设置页 `BuddyPreferencesSettings` 说明：偏好用于公开招募检索排序，可随时修改

**合规**

- [x] 偏好仅影响**同一活动下公开帖**的展示顺序，不生成「适合你的队友」
- [ ] 用户可关闭「按偏好排序」（若做开关）

**技术提示**：`user-profile-hints.util.ts` · `user-profile-sync.service.ts` · `buddy-post-search.util.ts` · `post-search.service.ts` · `BuddyPreferencesSettings.tsx` · `personality-test.service.ts`（完成时 sync）

**依赖**：US-Q2-05 ✅ · 设置页用户偏好（现网）

---

### US-Q2-11 · ~~Agent `search_buddy_posts` 工具~~ · ❌ 已取消

**取消原因**：详情搜索条已承担；US-Q2-22 移除对话入口。MVP 不恢复。

---

## Epic D · 查节与资讯（辅助轴）

### US-Q2-10 · ~~首页/准备 Tab 查节示例~~ · ❌ 已取消

示例 Chip 在首页 → `goEventsWithSearch`（US-Q2-22）。

---

### US-Q2-12 · 活动信息来源标注 P0 · S · ✅

> **上线包**：并入 **US-Q2-36** 详情资讯区一并交付，不单独立项排期。

**Story**  
作为浏览用户，我想在活动详情看到信息来源与更新时间（承接 US-Q1-04）。

**验收标准**

- [x] 活动详情 **资讯区** 展示「信息来源」+「更新于」（有则展示）
- [x] 后端 `Activity` 可选字段 `infoSource` + `infoUpdatedAt`
- [x] 尾注「仅供参考，以主办方为准」

**明确不做**：无对话入口下，不要求 Agent 查节回答引用（后端工具保留即可）

**技术提示**：`activity.schema.ts` · `EventDetailInfoSection` · `event-detail`

**依赖**：US-Q2-36（UI 容器）✅

---

### US-Q2-36 · 全球电音节资讯目录 P0 · M · ✅

**Story**  
作为想查全球电音节的用户，我想在活动 Tab 按地区与时间浏览节讯，并在活动详情 **上半区** 看到结构化资讯（时间地点、阵容入口、来源），以便在找队之前完成「查节」闭环。

**现网实现（已完成）**

- 活动 Tab：`EventsCatalogFilterChips`（地区 + 时间 chip）· `EventsHotCarousel`（`hot === true`，不足 3 场隐藏）· 日历视图展示全部活动、默认当前月、过期置灰、点日期过滤列表（不受搜索影响）
- 活动卡片：`EventCard` 地区标签 + 阵容状态 badge（**已官宣阵容** / **待官宣阵容**，`lineupPublished`）
- 详情资讯区：`EventDetailInfoSection`（状态 pill · 摘要 · 来源 · 免责）· CTA **「查看阵容与时间表」** → `activity-lineup`
- 阵容深页：`packageEvent/pages/activity-lineup/` — 三态（未官宣订阅 / 演出时间表 / 仅阵容艺人卡）；已公布时间表时 footer CTA → `exclusive-itinerary`
- 订阅：`lineupPublished === false` 时展示订阅横幅；微信 opt-in 走 `wechatActivityUpdateOptIn`（阵容官宣推送）

**产品原则**

| 原则 | 说明 |
|------|------|
| **活动 Tab = 全球目录** | 不新开「资讯 Tab」；列表 / 日历 / 艺人三视图分工不变 |
| **类型双轨** | 上线包以 **festival** 为主；**室内活动**（`activityType=indoor`）与类型 Chip 见 **US-Q2-38**（上线后） |
| **资讯 = 结构化事实** | 时间、地点、阵容官宣状态、来源；**不做** UGC 资讯流、小编口吻 |
| **全球感** | 复用 `region`（国内 / 海外 / 港澳台）+ `hot` + 搜索 alias |
| **详情分区** | **上资讯、下找队**；观演准备仍折叠（US-Q2-15） |
| **阵容深页** | `activity-lineup` 分包；专属行程仍走 `exclusive-itinerary`（由阵容页 footer 进入） |

**上线包范围（W1 · 提审前必须完成）**

| 天 | 交付 |
|----|------|
| **D5～D6** | 活动 Tab：地区 chip + 客户端 filter；`hot` 热门横滑（3～5 张） |
| **D6～D7** | 活动卡片：地区标签 + 阵容状态 badge（**已官宣阵容** / **待官宣阵容**） |
| **D7** | 活动详情 **资讯区**（非折叠）：状态 pill、摘要、[查看阵容与时间表] |
| **D7** | **US-Q2-12**：`infoSource` + `infoUpdatedAt` + 免责尾注 |
| **D8** | 资讯轴联调 · 与找队区视觉分层 · 冒烟条目 |

**验收标准 — 活动 Tab**

- [x] 搜索框下 **地区 chip**：全部 / 国内 / 海外 / 港澳台（复用 `Activity.region`，逻辑可抽自 `EventsMapRegionTabs` / `useEventsActivityMap`）
- [x] 可选 **时间 chip**（客户端）：即将开始 / 本月 / 热门（`hot`）
- [x] **热门亚洲电音节** 横滑区：`hot === true` 的 3～5 场，点击进入详情
- [x] 列表 / 日历 / 艺人视图文案与空状态符合「节讯目录」定位（无「问 AI」兜底）
- [x] 搜索仍用 `filterActivitiesForEventsSearch`；haystack 扩展至 `alias`（有则）

**验收标准 — 活动卡片**

- [x] 展示 **地区** 标签（国内 / 海外 / 港澳台）
- [x] 有 `lineupPublished` 时展示 **阵容状态** badge：**已官宣阵容** / **待官宣阵容**（`eventCard.lineupPublished` · `eventCard.lineupPending`；勿用简称「已官宣」）
- [x] 主路径仍为 **点卡片进详情**（不在卡片上抢「组队」CTA）

**验收标准 — 活动详情资讯区**

- [x] 导航下方、招募区 **上方** 增加资讯区（首屏可见，非折叠）
- [x] 状态 pill：即将开始 / 进行中 / 已结束
- [x] 摘要行：类型 · 地区 · 更新于（US-Q2-12）
- [x] CTA **「查看阵容与时间表」** → `activity-lineup`
- [x] `lineupPublished === false` 时展示未官宣文案 + **订阅活动更新**（复用 US-Q1-06）
- [x] 招募区（AI 找队 + 帖列表）仍在资讯区 **下方**，视觉层级不混

**合规**

- [x] 无代购/订票/撮合表述；来源区含「仅供参考，以主办方为准」
- [x] 不出现独立「资讯广场」或 UGC 新闻 feed

**技术提示**

- 前端：`pages/events/index.tsx` · `EventsCatalogFilterChips` · `EventsHotCarousel` · `EventCard` · `EventDetailInfoSection` · `packageEvent/pages/activity-lineup/`
- 后端：`activity.schema.ts`（`region` · `infoSource` · `infoUpdatedAt` · `lineupPublished`）· 详情 API 透出 `lineupPublished`（阵容是否已官宣，与行程 `schedulePublished` 区分）
- 复用：`filterActivitiesForEventsCatalog` · `filterActivitiesForEventsSearch` · `subscribeToActivityUpdates` · `exclusive-itinerary`（专属行程）

**依赖**：US-Q2-13 ✅ · US-Q2-15 ✅ · US-Q1-06 ✅

**协同**：**US-Q2-12** 随本 Story 交付 ✅；**US-Q2-19** 艺人→活动串联仍上线后；**US-Q2-20** 地图 Tab 仍不做；**US-Q1-05** 购票外链仍暂缓

**明确不做（上线后 / Phase B）**

- 独立「资讯 Tab」或 RSS 式滚动新闻
- 活动 Tab 地图视图上线
- 艺人 Tab 点击进场次列表（US-Q2-19）
- 详情内嵌购票按钮
- **室内活动 catalog / 类型 Chip / 日历含 indoor** → **US-Q2-38**（与 US-Q2-37 本地模式联动）

**人力极紧时的最小子集（仍须上版）**

1. 地区 chip + 列表 filter  
2. 详情资讯区 + US-Q2-12 来源  
3. 阵容入口 → `activity-lineup`  

可砍：热门横滑、时间 chip、卡片 lineup badge（**已官宣阵容** / **待官宣阵容**；不挡提审底线）— **完整版已一并交付**

---

### US-Q2-13 · 活动 Tab 搜节（列表过滤）· ✅

**产品原则**

- 主路径：搜索框过滤列表（封闭检索）
- **无结果**：换关键词 / 浏览全部；**不做**「问 AI」兜底
- 分工：活动 Tab = 目录；活动详情 = AI 找队（公开招募）

**代码**：`pages/events/index.tsx` · `filterActivitiesForEventsSearch.ts`

---

## Epic E · 信息架构

### US-Q2-22 · 去除准备 Tab / 去对话化 · ✅

**验收标准**

- [x] 底栏 3 Tab；删除 `pages/ai/`；无 `goAiAssistant`
- [x] 前端移除 WebSocket 聊天客户端
- [x] 首页查节 → `goEventsWithSearch`；找队 → 详情招募区
- [x] 攻略 → `runTravelGuideGeneration`；`packageAi` 深链重定向

**MVP 不恢复**多轮 AI 对话 Tab。

---

### US-Q2-02 · 首页双 CTA · ✅

查节 → 活动 Tab 搜索；找队 → 详情招募区或活动列表。

---

### US-Q2-08 · Festival Plan 跳转统一 · ✅

攻略 Sheet / 行程页 / 发招募均在活动详情或分包完成。

**产品注记（2026-06）**：Checklist UI 固定顺序为 `攻略 → 发招募 → 行程`（见 `festivalPlanTaskDefs.ts`）。专属时间表依赖官宣，组队可在官宣前进行；Prep Nudge（US-Q2-34）与人格偏好（US-Q2-27）按 [PRODUCT.md §2.5](./PRODUCT.md#25-festival-plan观演准备--降优先级) 分阶段推荐。

---

### US-Q2-15 · 观演准备收进详情折叠区 P0 · S · ✅

**Story**  
活动详情以招募和资讯为主，攻略/行程不抢首屏。

**验收标准**

- [x] `FestivalPlanSummaryBar` 与攻略卡片收入「观演准备」折叠区（默认收起）
- [x] 首屏：活动信息 + AI 找队搜索 + 招募列表
- [x] 首页仍保留「我的下一场」简进度

**技术提示**：`packageEvent/pages/event-detail/index.tsx` · `EventDetailComposerSection`

**依赖**：US-Q2-08

---

### US-Q2-35 · 出行攻略预算对比选档 P1 · S · ✅

**Story**  
作为生成出行攻略的用户，我想 **不必在生成前选定住宿预算**，而是在看到 **经济 / 舒适 / 豪华三档对比** 后点选一档，以便降低填表成本，并让系统记住我的预算偏好。

**产品原则**

- **一次生成**，不做 3 次完整 LLM（避免冷启动 ×3 成本与等待）
- 三档卡片 = **预算档位选择**；攻略内「就近 / 市中心」= **同档下的住宿方案**（两层勿混）
- 偏好写入时机：**用户点选某档后** 再 `applyTravelGuideHints`（非生成瞬间默认 `standard`）
- 仍为「AI 参考 · 自行核实」，非报价/代订

**上线包范围（Phase A · W2 · 提审前必须完成）**

| 天 | 交付 |
|----|------|
| **D8** | 表单：住宿预算改为可选；主 CTA 仅需出发地（+ 人数/晚数/自驾现逻辑） |
| **D9** | 攻略结果页顶部：**三档对比卡**（沿用 `economy \| standard \| comfort` 文案与每晚区间） |
| **D10** | 点选一档 → 更新当前攻略 `budgetTier` 展示 + 调用 `applyTravelGuideHints` 写 `budgetLevel`；住宿区按所选档刷新（规则估算 / 现有 POI 按 tier 重排，**不**整页重跑 LLM） |

**验收标准**

- [x] `AiGuidePlanSheet` 不再强制选预算；文案说明「生成后可对比三档」
- [x] 首次生成以 `standard` 为基线（或 `budgetTier: unset` 后端等价策略），**只调一次** `travel-guide/generate`
- [x] 结果页展示 3 张预算对比卡：档名 + 每晚 hint（¥150–300 / ¥300–600 / ¥600+）+ 本次出行住宿 **估算区间**（可复用 `budgetTierHotelNightRanges` / `buildTravelGuideBudgetItems`）
- [x] 用户点选某档后：该卡高亮；攻略 `budgetLabel` / 住宿段落与所选档一致；**就近/市中心** 子方案仍可见
- [x] 点选后调用 `applyTravelGuideHints` → 用户 `budgetLevel`（`low \| medium \| high`）有变化才 PATCH
- [x] 卡片与页脚含免责声明：「AI 估算仅供参考，请自行核实价格与预订」
- [x] **不做**：三档各生成一份完整攻略；「平台推荐/最低价保证」；未点选时写入偏好

**合规**

- [x] 无代购/订票/担保表述；区间文案为「约」「参考」
- [x] 与 `AI_TRAVEL_GUIDE_DISCLAIMER` 一致

**技术提示**

- 前端：`AiGuidePlanSheet` · `useAiGuidePlanSheetForm` · `packageEvent/pages/ai-travel-guide/` · 新组件 `TravelGuideBudgetCompareCards`
- 后端：`travel-guide-budget-estimate.util` · `parse-activity-days.util`（tier ranges）· `user-profile-sync.applyTravelGuideHints`；可选 `PATCH` 仅更新已存攻略 `form.budgetTier`
- 缓存：无预算首次生成可用 `standard` 作 cache key，点选后另存用户选择至 `TravelGuidePlanReadResult.form`

**依赖**：US-Q2-15 ✅ · US-Q2-08 ✅

**协同**：为 **US-Q2-27** 提供 `budgetLevel` 信号；可与 Q2-27 Lite **并行**（D8～D10）。**优先于** US-Q2-25（筛选 chip）若 W2 人力二选一。

**明确不做（上线后 / Phase B）**

- 点选非当前档时 **增量 LLM** 重生成住宿块
- 三档卡片内嵌真实酒店预订链接

---

### US-Q2-14 · 新用户引导改序 · ✅

步骤：选活动 → 搜节/看招募 → 详情 AI 找队或发招募。

---

### US-Q2-09 · ~~准备 Tab 方案 C 瘦身~~ · ❌

由 US-Q2-22 整页移除取代。

---

## Epic F · 增长（P2 · 冷启动裂变 + MVP 验证后）

> **前提**：P0 指标至少有发招募、公开回复或 AI 搜索使用之一成立。  
> **冷启动**：人格测试微信分享（US-Q2-18）与种子帖（US-Q2-21）双轨并行；分享链路现网已有，偏好与转化收口见 US-Q2-27 / 17。

### US-Q2-17 · 人格测试 → 找队/发招募 CTA P2 · M · 🔲

**Story**  
作为测完人格的用户，我想在结果页明确下一步：去该活动 **浏览/筛选公开招募**，或 **预填发一条招募**；分享海报路径保留。

**产品原则**

- 人格测试可在**官宣前**完成，填补「尚无专属时间表、但已想找人」的空窗
- 主 CTA 优先找队/发招募，**不**以「先生成行程」为前置（行程依赖官宣）
- 测完同步曲风偏好 → US-Q2-27；表述为公开招募检索排序，非配对撮合
- **裂变落地**：从分享链接进入的用户（`share=1` teaser）测完后，与 organic 用户走同一转化路径；推荐活动默认有种子帖（US-Q2-21）

**验收标准**

- [ ] 结果页首屏下半区 **行动分流**（不埋在三屏 DJ 列表之后）：
  - 主 CTA：**翻招募卡 / 去招募区找队**（见 US-Q2-29，MVP 可先跳推荐活动 `focusPosts`）
  - 次 CTA：**发一条招募**（`buildPersonalityBuddyPostPrefill`）
  - 底部：分享海报 · 再测
- [ ] DJ/活动长列表默认折叠为「查看更多」
- [ ] 跳转活动详情招募墙或带预填发帖 Sheet
- [x] 完成测试后同步用户偏好（曲风）→ US-Q2-27 Lite ✅
- [ ] 无「配对成功」「缘分队友」表述

**技术提示**：`PersonalityResultView` · `buildPersonalityBuddyPostPrefill` · `goEventDetailWithBuddyPostPrefill`

**依赖**：US-Q2-16 ✅ · US-Q2-04 · US-Q2-27（偏好同步可并行）

---

### US-Q2-29 · 翻招募卡（人格测试串联） P2 · M · 🔲

**Story**  
作为测完人格的用户，我想用 **趣味翻卡** 随机偶遇该活动下的 **公开招募帖**（非塔罗占卜），以便低门槛进入找队。

**产品原则**

- 翻的是 **真实已发布招募帖**，不是生成假队友
- 命名：**翻招募卡 / 偶遇小队**；**禁止**塔罗、运势、缘分队友、匹配度 %
- 卡池空时 **不进入翻卡页**，降级为「去招募列表 / 发第一条招募」

**验收标准**

- [ ] 入口：人格结果页主 CTA，或活动详情（有帖时）
- [ ] 选活动：默认推荐阵容含本命 DJ 的节，可切换
- [ ] 交互：卡背点击翻开 → 展示帖摘要（人数、标签、出发地、暗号、备注）
- [ ] 「再翻一张」「查看全部招募」；同会话不重复同帖
- [ ] 可选：按 `primaryType` **加权排序**卡池（前排/高能等关键词），文案写「优先展示风格相近的公开招募」
- [ ] 转化：**查看详情** · **申请加入**（公开评论，US-Q2-04）
- [ ] 页脚合规：「随机展示公开招募，不代表平台推荐或保证组队成功」
- [ ] 免费次数上限（如 5 次/活动/日）防刷

**合规**

- [ ] 无占卜/塔罗 UI 与文案
- [ ] 不对人展示「匹配度」

**技术提示**：新翻卡页分包或 modal · 复用 `GET /posts?activityLegacyId=` · `resolveBuddyPostRecruitDisplay` · 本地 shuffle/加权 util

**依赖**：US-Q2-17 · US-Q2-21（卡池非空）· US-Q2-16 ✅

---

### US-Q2-28 · AI 辅助发招募（暗号 / 组队卡预览） P2 · L · 🔲

**Story**  
作为发招募用户，我想根据所选人格/阵容等选项，让 AI **生成多个候选文案**（如接头暗号、小队 slogan），我挑选或自定义后 **预览组队卡再发布**。

**产品原则**

- **人机协同**：用户必选/可改/须预览，禁止静默代发
- 发布物仍是 **用户 UGC 公开招募帖**，走现有发帖与审核链路

**验收标准**

- [ ] 发帖流程增加步骤：选字段 → AI 生成候选（可换一批）→ 用户选择或自定义 → **预览组队卡** → 确认发布
- [ ] 生成页与预览页显著标注「AI 生成，仅供参考」
- [ ] AI 输出与最终帖文均走 `msg_sec_check` 与联系方式拦截
- [ ] 发布前仍走 `ugcPublishCompliance` 确认
- [ ] 合规文案：「招募帖为公开信息展示」；无「平台担保组满」

**合规**

- [ ] 深度合成 / 生成式内容标识（用户协议已覆盖）
- [ ] 有 AI 备案前提下上线对应微信类目

**技术提示**：扩展 `AiBuddyPostSheet` · 后端生成接口（或复用现有 LLM）· `PostWriteService.createPost`

**依赖**：US-Q2-24（结构化字段）· US-Q2-16 ✅

---

### US-Q2-30 · 攻略串联找队 / 发招募预填 P2 · S · 🚧

**Story**  
作为生成出行攻略的用户，我想回到活动详情后 **AI 找队搜索框自动预填** 出行条件（可编辑），或从攻略页 **预填发招募**，而不是平台黑盒「根据攻略匹配队友」。

**MVP 拆分（2026-06）**

| 档位 | 范围 | 状态 |
|------|------|------|
| **MVP** | 回活动详情自动预填 AI 找队搜索 · 攻略页发招募 CTA · 发帖 Sheet 预填 | 🚧 |
| **Full** | 预算偏好来自 **US-Q2-35** 点选档位后再写入预填 / `budgetLevel` 检索排序 | ✅ |

**验收标准**

- [x] 生成/查看攻略后回到活动详情：**AI 找队搜索框默认展示预填**（出发地、人数等，来自攻略表单），可编辑后搜索
- [x] 预填时展示轻提示「已根据出行攻略预填，可修改后搜索」；用户清除搜索后不再自动覆盖
- [x] 攻略详情页保留 **「预填并发招募帖」** CTA → 打开发帖 Sheet，`travelGuideFormToBuddyPrefill` 预填
- [x] **不做**：攻略页「用这些条件找公开招募」跳转 CTA、攻略全文自动匹配队友、攻略页内嵌「匹配结果流」
- [x] 预算偏好由 **US-Q2-35** 点选档位写入；城市等仍可在生成后 `applyTravelGuideHints`（MVP 暂用攻略表单 `budgetTier`）

**技术提示**：`travelGuideToBuddyPost.ts` · `travelGuideFormToSearchQuery` · `travelGuideSearchPrefillStorage.ts` · `useEventDetailPostSearch` · `useEventDetailPage` · `ai-travel-guide/index.tsx`

**依赖**：US-Q2-35（预算偏好 · Full）· US-Q2-27 Lite ✅ · US-Q2-08 ✅

---

**依赖**：US-Q2-16 ✅ · US-Q2-04 · US-Q2-27（偏好同步可并行）· US-Q2-21（有种子的活动）

---

### US-Q2-18 · 人格测试微信裂变 / 分享卡片 P2 · M · 🔲

**Story**  
作为完成人格测试的用户，我想把结果分享到微信好友或朋友圈，好友点开也能测一测；平台在**新用户自己测完**后沉淀曲风偏好，用于后续 AI 找队排序。

**产品原则**

- **双目标**：社交裂变拉新 + 测完写入 `favorGenres`（via US-Q2-27），服务官宣前找队
- 分享 path 仅用于 teaser（分享者 `primaryType` / `soulDjId`），**不**代表好友偏好已入库
- 与 US-Q2-21 种子帖配合：好友测完 → US-Q2-17 CTA → 有种子的活动招募墙
- 承接 [US-Q1-16](./Q1-USER-STORIES.md)；无购票、无 buddy-matching、无匹配度

**现网基线（可先用于冷启动）**

- [x] `onShareAppMessage` / `onShareTimeline` · 标题「我是「XX 型」Raver，测测你的本命 DJ」
- [x] 分享 path：`/packageEvent/pages/personality-test?share=1&primaryType=…&soulDjId=…`
- [x] 落地 teaser：「好友是 XX 型 · 你也来测测」
- [x] 海报保存 / 分享 · 首页 `HomePersonalityTestEntry`

**待收口（裂变闭环）**

- [ ] 分享卡片视觉优化（Soul DJ + 类型名 + 可选合规小字；US-Q1-16 验收项）
- [ ] 海报含小程序码或明确「微信搜 SYNC / 扫码进小程序」指引（朋友圈场景）
- [x] 测完 → US-Q2-27 写 `favorGenres` · US-Q2-17 主 CTA 进招募墙（写偏好 ✅ · CTA 🔲）
- [ ] 分享标题 / 图片 / 海报 grep：无票价、代购、加微信、配对、匹配度
- [ ] （可选）分享埋点：分享次数 · 落地 UV · 测完率 · 测完→招募墙率

**合规**

- [ ] ✅ 测测你的本命 DJ · Raver 人格
- [ ] ❌ 测测你的搭子 · 缘分队友 · 匹配度 XX%

**技术提示**：`personalityWechatShare.util.ts` · `PersonalityResultView.tsx` · `usePersonalityTestPage.ts` · `personalityPosterShare.ts` · `personality-types.ts`（`genreTags` → `favorGenres`）

**依赖**：US-Q2-16 ✅ · US-Q2-27（写偏好）· US-Q2-17（转化）· US-Q2-21（招募墙非空）

### US-Q2-19 · 艺人 Tab → 活动串联 P2 · S · 🔲

**Story**  
作为追节用户，我想在活动 Tab 的**艺人**视图里按 DJ 查「今年去哪几场」，点进艺人后看到出场活动并进入活动详情，而不是只能看一张不可点的排行榜。

**产品定位（查节辅助 · 第三条入口）**

| Tab 子视图 | 用户问题 | 终点 |
|------------|----------|------|
| 列表 | 哪场节、在哪 | `event-detail` |
| 日历 | 哪天有节 | `event-detail` |
| **艺人** | 这个 DJ 去哪几场 | `event-detail` → 招募墙 |

- **不是**：听歌 App、艺人社交、按艺人匹配队友  
- **找队**：仅轻导流「去该活动的公开招募」，不在艺人 Tab 内做撮合

**现状基线**

- [x] 活动 Tab 第三子 Tab「艺人」：`EventsActivityArtistsTab` · `GET /activities/lineup-artists`
- [x] 卡片展示：头像 · 艺名 · 曲风 · `activityCount`
- [ ] 卡片**不可点**；无出场活动列表；无半屏详情

**MVP 拆分**

| 档位 | 范围 | 状态 |
|------|------|------|
| **Phase A** | 艺人卡可点 · 半屏 · 出场活动列表 → 活动详情 · 主 CTA「最近一场」 | 🔲 |
| **Phase B** | 半屏接 `DjService` / `query_dj_info` 简介与代表曲目（**US-Q2-33** 复用） | 🔲 |
| **Phase C** | 艺人 Tab 搜索 · 曲风 chip · `favorGenres` 洞察排序（非匹配文案） | 🔲 |

**验收标准 — Phase A（最小可用）**

- [ ] 艺人列表卡片可点击，打开**半屏 Sheet**（`ArtistProfileSheet`，与阵容页共用组件名待定）
- [ ] 半屏展示：艺名 · 曲风标签 · 简介占位或一行摘要（无 B 数据时可仅展示 catalog 字段）
- [ ] **出场活动**区块：按日期近→远列出该艺人关联活动（名称 · 日期 · 地区 · 阵容是否官宣）
- [ ] 点击任一场活动 → `event-detail`（带 `activityLegacyId`）
- [ ] 底栏主 CTA：**查看最近一场活动** → 同上；副文案提示公开招募在活动详情
- [ ] 列表默认排序：**即将出场**优先（有未开始活动按最近 `date`）；`activityCount` 作次排序；catalog 过少时可暂保留现网计数排序
- [ ] 卡片增强（可选 Phase A）：展示**最近一场**活动名 + 日期（需 API 扩展 `nextActivity`）
- [ ] 空态 / 加载 / 失败与现网一致；无艺人数据时不挡列表/日历 Tab

**验收标准 — Phase B（与 US-Q2-33 合体）**

- [ ] 半屏简介来自 `DjService.profile` / `query_dj_info` 摘要（截断 + 展开）
- [ ] 代表曲目：曲名列表（2～3 条），**不**嵌完整音频播放
- [ ] 加载文案：「正在查艺人信息…」；底部免责：「资料来源于公开信息，仅供参考」
- [ ] `activity-lineup` 点 DJ 名打开**同一半屏**（不重复造轮子）

**验收标准 — Phase C（有偏好数据后）**

- [ ] 艺人 Tab 顶：封闭搜索艺人名（无 AI 对话兜底）
- [ ] 曲风 chip 筛选列表（Techno / House / …）
- [ ] 登录且有 `favorGenres` 时：可选洞察行「已参考你的曲风偏好排序公开目录」；**禁止**「匹配队友 / 本命搭子 / 配对度」

**合规**

- [ ] 表述为「查出场活动 / 公开招募在活动详情」，无「智能配对 / 找同好队友 / 平台担保」
- [ ] 艺人资料区含来源与免责；无票务代购、无联系方式展示
- [ ] 偏好仅用于**目录排序或预填 AI 找队**，非撮合承诺

**技术提示**

- 前端：`EventsActivityArtistsTab.tsx` · 新 `ArtistProfileSheet` · `pages/events/` · 复用 `EventCard` 或精简活动行 · `activity-lineup/` 点选 DJ
- 后端（Phase A）：扩展 `listCatalogLineupArtistsRanked` 或新 `GET /artists/:id` · `GET /activities?lineupArtistId=`（出场活动列表）· 可选 `nextActivity` 字段
- 后端（Phase B）：`DjService` · `dj-info.service.ts` · `query-dj-info.tool`
- 数据：`CatalogLineupArtist` · `dj.schema.ts`（Discogs）· `itinerary-schedule.service.ts`

**依赖**：US-Q2-36 ✅（活动 catalog）· US-Q2-33（Phase B 可并行或后置）· US-Q2-38 / 40（室内 headliner 复用半屏，可选）

**排期**：**不挡 07-06 提审**；catalog 艺人覆盖不足时 Phase A 可延后至 Sprint 6～7。详见 [PRODUCT.md §4.1](./PRODUCT.md#41-艺人-tab查节第三条入口--us-q2-19)。

---

### US-Q2-20 · 地图 Tab · ❌ MVP 不做

**决策（MVP）**：**B 下线** — 删除未挂载的 `EventsActivityMapTab` 与多余 `getLocation` 权限（若产品确认无近期计划）。

全量上线地图列为 post-MVP 可选。

---

## Epic G · 无感 Scene Agent

> 总览：[SCENE-AGENT.md](./SCENE-AGENT.md) · 不用线性对话，场景内单次任务 + UI Effects。

### US-Q2-31 · Scene Agent 运行时 P1 · L · 🔲

**Story**  
作为研发，我希望有统一的 `scene-run` 契约，以便各页面复用 Agent tools 而不恢复聊天 Tab。

**验收标准**

- [ ] `POST /api/ai/scene-run`：`scene` · `intent` · `activityLegacyId?` · `input` · `context`
- [ ] 响应 `effects[]`（`insight_line` · `reorder_posts` · `prefill_query` · `open_sheet` 等）
- [ ] 首期场景：`recruit_search` 包装现有 `PostSearchService`
- [ ] 规则可决场景走快路径，不强制 LLM
- [ ] 文档与 [SCENE-AGENT.md](./SCENE-AGENT.md) 一致

**上线包**：🔲 不阻塞；上线后用现有 REST 先行。

**技术提示**：`ChatAgentToolRegistry` · `AiTurnPipeline`（参考）· 新 `SceneRunService`

**依赖**：US-Q2-05 ✅

---

### US-Q2-32 · 招募墙动态筛选 Chip P1 · M · 🔲

**Story**  
作为找队用户，我想看到与这场节、我的偏好相关的筛选 Chip（如「和我同出发地」「仅招募中」），点一下即筛公开帖。

**验收标准**

- [ ] Chip 由规则或 Scene 生成，**非**写死全集
- [ ] 与 AI 搜索互斥规则与现网一致
- [ ] 无「智能匹配」表述

**依赖**：US-Q2-25 · US-Q2-31（可先做纯前端规则版）

---

### US-Q2-33 · 阵容 DJ 点选无感解读 P1 · S · 🔲

**Story**  
作为用户，我想在阵容里点 DJ 名看到简短解读卡片，而不是进对话问。

**验收标准**

- [ ] 半屏卡片展示 `query_dj_info` 结果摘要（与 **US-Q2-19** `ArtistProfileSheet` 同一组件）
- [ ] 加载态「正在查艺人信息…」，非「AI 正在思考」
- [ ] 免责声明一行
- [ ] 半屏内嵌**出场活动**列表（与艺人 Tab 入口数据一致）

**技术提示**：`query-dj-info.tool` · `ArtistProfileSheet` · `activity-lineup/` · `EventsActivityArtistsTab`

**依赖**：US-Q2-31（或活动内单轮 REST 封装）· **US-Q2-19 Phase B**（可并行；半屏壳子建议 Q2-19 Phase A 先建）

---

### US-Q2-34 · 出征准备 Prep Nudge P1 · XS · ✅

**Story**  
作为已选活动的用户，我想在观演准备折叠区看到 **与当前阶段匹配的下一步建议**（如「去发招募」「阵容已出，去排时间表」），感到产品懂进度。

**产品原则**

- Checklist 展示顺序为 `攻略 → 发招募 → 行程`；nudge **按真实时间线分支**（阵容未官宣时弱化行程 nudge）
- 阵容 / timetable 未官宣时：**弱化或跳过**行程 nudge，**不阻塞**招募墙与 AI 找队
- 有人格偏好时，可提示「已可参考你的曲风偏好找公开招募」（联动 US-Q2-27 洞察行）

**验收标准**

- [x] **上线包**：纯规则，无 LLM；输入含 Festival Plan checklist + 阵容是否官宣 + 是否有 `favorGenres` + 招募回复数
- [x] 分阶段文案示例（命中最高优先级一条即可）：
  - 已发招募且有新回复 → 「你的招募有 N 条新公开回复」
  - 未发招募 → 「还差：发一条公开招募」
  - 已测人格 · 未找队 → 「已参考你的偏好，去看看公开招募」（可选，依赖 US-Q2-27）
  - 阵容已官宣 · 无行程 → 「时间表已出，去排你的专属 set」
  - 阵容未官宣 · 无行程 → 「阵容尚未官宣，可订阅提醒；找队可先浏览公开招募」
  - 其余 → 按 checklist 下一未完成项（攻略 → 发招募 → 行程）
- [x] 点击跳转现有能力（发帖 Sheet / 攻略 / 招募区 / `exclusive-itinerary` / 订阅）
- [ ] （上线后）可接 Scene `prep_nudge` 增强

**技术提示**：`FestivalPlanSummaryBar` · `buildFestivalPlanChecklist` · 活动 lineup 状态 · `prep-guidance.util.ts`（后端参考）· [SCENE-AGENT.md §五](./SCENE-AGENT.md#五分阶段信号与-scene-优先级)

**依赖**：US-Q2-15 ✅ · US-Q2-08 ✅ · （可选）US-Q2-27 Lite

---

## Epic H · 本地 Raver 与室内活动（Post-launch · 上海冷启动）

> **产品决策（2026-06）**：追节用户走 festival 详情 + Festival Plan；**本地 Raver** 走 **Hub 聚合 + 单场招募墙**，双轴（查活动 / 找组队）保留，主次由 `raverMode` 调节。详见 [PRODUCT.md §2.7～§2.10](./PRODUCT.md#27-raver-模式本地--追节)。

| ID | 标题 | 体量 | 依赖 |
|----|------|------|------|
| US-Q2-37 | Raver 模式（本地 / 追节） | M | — |
| US-Q2-38 | 室内活动 catalog 收录与多城 | M | Q2-36 列表基线 ✅ |
| US-Q2-39 | 本地城市 Hub 聚合页 | L | Q2-37 · Q2-38 |
| US-Q2-40 | 室内活动详情 · 艺人介绍 | M | Q2-38 · Q2-33 |

---

### US-Q2-37 · Raver 模式（本地 / 追节）P1 · M · 🔲

**Story**  
作为新用户，我想在首进时选择「主要在本地玩」或「追外地电音节」，以便首页与活动 Tab 默认展示符合我习惯的内容；我也可以在设置里随时改回来。

**验收标准**

- [ ] 首进一屏两卡 + **稍后再说**（`raverMode=balanced`），不挡人格分享落地
- [ ] 持久化 `raverMode`：`local` | `nomad` | `balanced`（本地 storage + 可选同步 profile）
- [ ] **local**：首页 **找组队** CTA 主 · 查活动次；默认跳转 **本地 Hub**（§2.9）；隐藏 Festival Plan / 攻略 / 行程入口与 Prep 折叠区（festival 详情仍可进，不主推）
- [ ] **nomad**：现网 festival 主路径；**查活动** CTA 主 · 找组队次；Festival Plan 保留
- [ ] **balanced**：双 CTA 同等权重（现网行为）
- [ ] 设置页：切换模式 + 联动 `homeCity`（复用 `BuddyPreferencesSettings` 城市字段）
- [ ] 合规文案：「本地玩 / 追节」，禁止匹配/缘分表述

**技术提示**：`pages/index/index.tsx` · `HomeAiEntry` · `useNewUserOnboarding.ts`（可选合并首进）· 新 `raverMode` util

**依赖**：无（可与 US-Q2-39 并行，Hub 路由可先 placeholder）

---

### US-Q2-38 · 室内活动 catalog 收录与多城 P1 · M · 🔲

**Story**  
作为本地 Raver，我想在活动 Tab 按 **室内活动** 类型浏览同城 club / 室内局，以便找队前能看到本周有哪些局；运营可按 **一场活动一条** 录入 catalog（非按场馆拆页）。

**产品原则**

- Catalog 单位 = **Activity**（活动/厂牌名）；场馆在 `location` / `venueName` / `city`
- `activityType: 'indoor'`（schema 已有）；与 `festival` 共用列表 API，客户端 filter
- 命名：`{活动名} · {城市}` 或 `{系列} @ {场馆}`；alias 含城市、场馆、曲风、艺人
- 冷启动：**上海** seed；后续深圳（`domestic`）、香港（`hmt`），同一 Tab + 城市 Chip

**验收标准**

- [ ] 活动 Tab **类型 Chip**：电音节 / 室内活动（默认随 `raverMode`：local→室内，nomad→电音节）
- [ ] 列表 filter `activityType=indoor`；卡片无「AI 攻略」tag；展示招募条数（有则）
- [ ] **日历视图含 indoor**（现网 `isFestivalEvent` 过滤需扩展）
- [ ] 后端 / seed：至少 3～5 条上海 indoor 活动 + 与 US-Q2-21 种子帖绑定
- [ ] 可选 schema：`city` · `venueName` · `indoorFormat` 字段文档化

**技术提示**：`activity.schema.ts` · `pages/events/index.tsx` · `EventsCatalogFilterChips` · `festivalEvents.ts`（日历 gap）· `activity-catalog-refresh.service.ts`

**依赖**：US-Q2-36 列表基线 ✅ · US-Q2-21 种子帖

---

### US-Q2-39 · 本地城市 Hub 聚合页 P1 · L · 🔲

**Story**  
作为本地 Raver，我想在 **「{city} · 本周」** 一页浏览多场室内活动与招募预览，以便不必逐场打开全屏详情；发招募、申请加入仍须进入 **单场** 上下文。

**验收标准**

- [ ] 路由：首页 local **找组队** 默认 → Hub（`homeCity`，如上海）
- [ ] 顶栏：**AI 找队**（Phase 1：单场 fallback；Phase 2：`activityLegacyIds[]` 或 city+indoor 跨场检索 API）
- [ ] 筛选 Chip：时间（本周/今晚）· 曲风 · 仅招募中（复用 US-Q2-25 逻辑）
- [ ] 按活动分区块：活动名 · 日期 · 艺人条 · 招募预览 2～3 条 · **[看这场]** · **[发招募]**
- [ ] **[看这场]** → 轻详情半屏或 `event-detail`（indoor 模板，见 US-Q2-40）
- [ ] **[发招募]** → 发帖 Sheet，**必须带该场 `activityLegacyId`**
- [ ] 顶统计（规则）：「本周 N 场 · M 条招募」（合规，非匹配）
- [ ] nomad 用户可从活动 Tab 或设置进入 Hub，非强制主路径

**技术提示**：新分包页（如 `packageLocal/pages/city-hub/`）· Hub API 聚合多场 activity + post 预览 · `post-search.service.ts` 扩展多 ID

**依赖**：US-Q2-37 · US-Q2-38 · US-Q2-05（单场 AI 找队基线）

---

### US-Q2-40 · 室内活动详情 · 艺人介绍 P1 · M · 🔲

**Story**  
作为本地 Raver，我点进某场室内局时，我想看到 **日期 · 场馆 · 主咖艺人介绍** 和招募墙，而不是出行攻略与专属时间表。

**验收标准**

- [ ] `activityType=indoor` 或 `raverMode=local` 进入详情时：
  - **展示**：资讯区（日期 · 场馆 · 城市）· **查看艺人介绍** CTA（Headliner）
  - **隐藏**：出行攻略 · 专属时间表 · Festival Plan 三步 · Prep 折叠区（或折叠内为空态「本地局无需行程」）
- [ ] **查看艺人介绍** → `ArtistProfileSheet`（复用 US-Q2-19 / US-Q2-33 · `DjService.answerArtistProfile`）
- [ ] 下半 **不变**：AI 找队 + 招募墙 + 公开评论（帖绑 `activityLegacyId`）
- [ ] Hub **[看这场]** 与活动 Tab 卡片进入同一模板
- [ ] festival 详情行为不受本 Story 影响

**技术提示**：`EventDetailInfoSection.tsx` · `EventDetailPrepActions.tsx` · `EventDetailComposerSection` · 条件渲染 `activityType`

**依赖**：US-Q2-38 · US-Q2-15 ✅ · US-Q2-19（半屏壳）· （可选）US-Q2-33

---

## Epic I · Scene AI 增强（查节 / 找队 / 粘性 · Sprint 6～8）

> 无感 Agent 场景注册：[SCENE-AGENT.md](./SCENE-AGENT.md) · 产品路线图：[PRODUCT.md §8.1](./PRODUCT.md#81-scene-ai-增强路线图无感-agent--2026-06)  
> **不挡 07-06 提审**；Sprint 6 起按数据与产能迭代。

### US-Q2-41 · 电音节故事（起源与发展） P2 · S · 🔲

**Story**  
作为还在选节的用户（尤其 nomad），我想在活动详情看到这场节的 **起源、发展历程和气质标签**，以便更有兴趣认下这场节并进入招募墙。

**产品原则**

- 资讯区 **叙事层**，默认 **折叠**，不挡招募墙首屏
- 运营 **结构化字段** 为主（`foundedYear` · `origin` · `highlights[]` · `vibeTags[]`）；LLM 仅做多语言摘要（`aiGenerated: true`）
- 热门节 3～5 场 MVP（与 US-Q2-21 种子活动对齐）

**验收标准**

- [ ] 详情资讯区「关于这场节」折叠块；展开后展示起源 + 3 条里程碑 + 曲风气质
- [ ] `infoSource` + 「仅供参考，以主办方/公开资料为准」
- [ ] （可选）`storyEn` 简短版供 `en-US`
- [ ] 无「必去」「全网最好」等夸大表述

**指标**：故事展开率 · 展开者 register / AI 找队率 vs 未展开

**Scene**：`festival_story` · effect `inline_card`

**依赖**：US-Q2-36 ✅ · US-Q2-12 ✅

---

### US-Q2-42 · 哪场节适合我（人格+偏好推荐） P2 · M · 🔲

**Story**  
作为测完人格或已写偏好的用户，我想看到 **3 场推荐活动** 和一行解释，以便更快决定 bind 哪场节（**非匹配队友**）。

**验收标准**

- [ ] 人格结果页 / nomad 首页：`insight_line` + 最多 3 张活动卡
- [ ] 排序：**规则**（`favorGenres` · 档期 · 地区）优先；LLM 只写解释文案
- [ ] 文案：「基于你的偏好推荐活动」；禁止「匹配度」「最佳搭子」
- [ ] 点击卡 → `event-detail`；推荐活动优先有种子帖（US-Q2-21）

**Scene**：`festival_recommend`

**依赖**：US-Q2-17 · US-Q2-27 · US-Q2-21

---

### US-Q2-43 · 阵容必看 set（偏好高亮 + 行程） P2 · M · 🔲

**Story**  
作为阵容已官宣的用户，我想看到 **根据曲风偏好高亮的必看 DJ** 并一键加入专属时间表，以便提高阵容页粘性与回访。

**验收标准**

- [ ] `activity-lineup` 官宣后：高亮 3～5 位 DJ + 一行解读（`favorGenres`）
- [ ] CTA「加入我的行程」→ `exclusive-itinerary`（复用 `itinerary-schedule.service.ts`）
- [ ] 规则优先；LLM 补艺人一句话（可选，联动 US-Q2-33）
- [ ] local/indoor 可弱化或跳过

**Scene**：`lineup_picks` · effect `open_sheet`

**依赖**：US-Q2-33 · 阵容官宣 · `exclusive-itinerary`

---

### US-Q2-44 · 申请加入公开评论 AI 草稿 P2 · S · 🔲

**Story**  
作为想申请加入的用户，我希望在展开评论区时看到 **2～3 条可编辑的公开评论模板**，以便降低发言门槛、提高招募→回复转化。

**验收标准**

- [ ] 「申请加入」展开评论区时：横滑 `candidates`（含出发地/可拼房等，读帖字段 + 用户 profile）
- [ ] 用户 **必须点选并编辑** 后才可发送；**禁止** AI 自动代发
- [ ] 发送路径仍为 `POST /posts/:id/comments`（公开评论）
- [ ] `aiGenerated: true` · 合规一行

**Scene**：`recruit_apply_compose`

**依赖**：US-Q2-04 ✅ · US-Q2-31（或 REST 映射）

---

### US-Q2-45 · 活动 Tab 自然语言搜节 P2 · M · 🔲

**Story**  
作为 nomad 用户，我想用自然语言（如「7 月欧洲 techno」）在活动 Tab 搜节，以便比关键词更快缩小范围。

**验收标准**

- [ ] 活动 Tab 搜索：规则解析优先（仿 `buddy-post-search.util.ts`）；复杂句 LLM 降级
- [ ] 结果：客户端 filter + `insight_line` 展示解析条件
- [ ] 0 结果引导换词或浏览全部（无对话 Tab 兜底）

**Scene**：`events_nl_search`

**依赖**：US-Q2-13 ✅ · US-Q2-36 ✅

---

### US-Q2-46 · 双节对比卡 P2 · S · 🔲

**Story**  
作为首次选节用户（含在沪外国人），我想对比两场节的 **地点、曲风、预算档、签证提示**，以便做决策。

**验收标准**

- [ ] 结构化对比表（规则数据）；LLM 仅润色导语
- [ ] 入口：活动 Tab 或详情「与相似节对比」（≥2 场 catalog）
- [ ] 不卖票、不承诺体验；带来源与免责

**Scene**：`festival_compare` · effect `inline_card`

**依赖**：US-Q2-36 ✅

---

### US-Q2-47 · 官宣前往年规律洞察 P2 · XS · 🔲

**Story**  
作为等待阵容官宣的用户，我想看到 **往年公布规律** 的提示，以便减少空等焦虑并被引导先去浏览公开招募。

**验收标准**

- [ ] `lineupPublished=false` 时资讯区 `insight_line`（**L0 规则**，不调 LLM）
- [ ] 示例：「往年阵容约提前 6～8 周公布；可先浏览公开招募」
- [ ] **不承诺** 今年官宣时间；可链订阅（现网）

**Scene**：`lineup_announce_hint`

**依赖**：US-Q2-36 ✅ · US-Q2-34 ✅

---

### US-Q2-48 · 节别生存指南（攻略增强） P2 · S · 🔲

**Story**  
作为生成出行攻略的用户，我想看到该节的 **签证、换汇、天气、场内禁忌** 等生存提示，以便实用且可分享。

**验收标准**

- [ ] 攻略生成后或 Prep 区：一节一模板卡（泰/欧/国内分模板 + 用户出发地变量）
- [ ] `AI_TRAVEL_GUIDE_DISCLAIMER` 同行；无代购/订票表述
- [ ] （可选）`en-US` 简短版

**Scene**：`guide_survival` · effect `inline_card`

**依赖**：US-Q2-35 ✅ · 出行攻略 REST

---

## 建议迭代顺序

### Sprint 1～2 — ✅ 已完成

合规基线 · 招募卡片 · 申请加入 · 首页双 CTA · Festival Plan 跳转

### Sprint 3 — ✅ 已收口

US-Q2-22 去对话化 · US-Q2-13 活动搜索 · US-Q2-14 新用户引导 · 取消 09/10/11

### Sprint 4 — ✅ 已收口（开发）

招募字段 · AI 找队 · 详情 IA · 合规文案

### Sprint 5（上线冲刺 · ～2 周 · 目标 2026-07-06 前提审）

> **产能假设**：**3～4 个大需求/天**（S/M = 1 项 · L ≈ 1 天）· **D1 = 2026-06-23（今天）** · 提审日 **07-06 不变**

| 天 | 日期 | 周 | 大需求（3～4 项/天） | ID |
|----|------|-----|----------------------|-----|
| — | — | — | ~~组队动态口径终检~~ · ~~合规文案~~ · ~~全球节讯目录~~ · ~~Prep Nudge~~ · ~~招募筛选/进度~~ · ~~攻略预算选档~~ | Q2-06/01/36/34/25/26/35 ✅ |
| **D1** | 06-23 | W1 | 种子招募帖上线 · 偏好 Full 收口 · 攻略预填收口 · 主路径走通（找队→申请→发帖） | **Q2-21** · **Q2-27** · **Q2-30** · — |
| **D2** | 06-24 | W1 | 人格测完 CTA · 分享卡片终检+埋点 · 结构化申请 Sheet · 发帖场景字段 | **Q2-17** · **Q2-18** · **Q2-23** · **Q2-24** |
| **D3** | 06-25 | W1 | DJ 无感解读 · AI 辅助发招募 · 翻招募卡 · Scene Agent（启动） | **Q2-33** · **Q2-28** · **Q2-29** · **Q2-31** |
| **D4** | 06-26 | W1 | Scene Agent 收口 · 招募墙动态 Chip · Raver 模式 · 室内 catalog seed | **Q2-31** · **Q2-32** · **Q2-37** · **Q2-38** |
| **D5** | 06-27 | W1 | 本地城市 Hub · 室内活动详情 · `rg` 合规终检 · 类目/协议材料 | **Q2-39** · **Q2-40** · Q2-01 · — |
| D6～D7 | 06-28～29 | W1 | **缓冲**：P0 bug · 种子帖补量 · 裂变推流（18 现网链路）· 联调回归 | Q2-21 · Q2-18 |
| D8～D10 | 06-30～07-02 | W2 | **缓冲**：遗留项收口 · 艺人串联（若解阻）· 冷启动双轨运营配合 | Q2-19? · Q2-21 |
| **D11** | 07-03 | W2 | `RELEASE-SMOKE.md` 全量冒烟（上午）· P0 bug 修复（下午） | — |
| **D12** | 07-04 | W2 | 冒烟回归 · 体验走查 · 种子帖/热门活动终检 | Q2-21 |
| **D13** | 07-05 | W2 | 微信类目/文案终检 · 提审包打包 · 驳回修改预留 | — |
| **D14** | 07-06 | W2 | **提审** | — |

**砍 scope 时（仍保 07-06 提审 · 只做 4 件）**

1. **US-Q2-21** 种子招募帖  
2. **US-Q2-27** Full（或至少 Lite 已交付部分）  
3. **US-Q2-06** 口径终检 + 冒烟  
4. **合规 grep** + 提审材料  

**砍 scope 时的推迟顺序（从 D5 往前砍）**

D5 本地轴（37～40）→ D4 Scene（31～32）→ D3 增长（28～29）→ D2 体验（23～24）→ D2 裂变（17～18）

### Sprint 6（上线后 1～2 周 · Scene + 转化）

**Q2-31** scene-run · **Q2-43** 必看 set · **Q2-44** 申请评论 AI · **Q2-47** 官宣规律 · **Q2-19** 艺人串联（解阻后）· 行为看板 · **Q2-27** 偏好 A/B

### Sprint 7（增长 · 查节叙事 + 裂变）

**Q2-41** 节故事 MVP · **Q2-42** 哪场适合我 · **Q2-48** 生存指南 · **Q2-39** Hub 跨场 API · 翻卡/发帖串联收口

### Sprint 8（深化 · 搜节 + 多城）

**Q2-45** NL 搜节 · **Q2-46** 双节对比 · 深圳/香港 seed · 翻卡跨场 · **Q2-20** 下线清理 · 艺人 Tab 深度串联

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
