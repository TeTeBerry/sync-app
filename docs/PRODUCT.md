# SYNC 小程序 · 产品说明

> **当前实现**与**目标形态**合一文档。Q1 交付见 [Q1-USER-STORIES.md](./Q1-USER-STORIES.md)；**Q2 整改与推广主轴**见 [Q2-USER-STORIES.md](./Q2-USER-STORIES.md)。REST/WS 契约见 [API.md](./API.md)。

**最后更新**：2026-06-26（§1.6 PLUR 全量提审 55～66 · L1/L2/L3 · §2.6 冷启动三轨）

---

## 一、战略定位

### 1.1 对外一句话（Q2 目标）

**电音节资讯与公开组队招募；招募支持 AI 筛选。**

（历史口径「用 AI 查电音节」已收口为：**活动 Tab 列表搜索** + **活动详情资讯**，不再提供多轮 AI 对话入口。）

### 1.2 双主轴 + 一底座

| 层级 | 用户故事 | 产品形态 |
|------|----------|----------|
| **主轴 A · 查节** | 我想查某场节的时间、地点、阵容 | **活动 Tab 列表搜索** + 活动详情资讯 |
| **主轴 B · 找队** | 我想找人一起去 | **公开组队招募墙** + **AI 检索公开帖** + **公开评论**互动 |
| **底座** | 一切围绕「某场活动」 | 选活动 / 绑活动；攻略·行程降为**个人观演准备工具** |

### 1.3 主体与合规边界

| 项 | 说明 |
|----|------|
| **主体资质** | OPC · **仅 ICP 备案**（非经营性），无 ICP 经营许可证 |
| **服务性质** | 免费的信息与工具服务（见 `src/legal/user-agreement.ts`） |
| **平台免责** | `constants/platformDisclaimer.ts` · 首页/详情底部常驻 |

**合规红线（全程不突破）**

| 不做 | 原因 |
|------|------|
| 付费会员 / 付费 AI / 付费匹配 | 经营性 |
| 站内私信、队内私密评论、「联系队友」、展示联系方式 | 撮合 + 私密 UGC |
| 「配对成功」「平台担保」「智能匹配最佳搭子」 | 撮合承诺 |
| 票务销售、返佣购票 | 票务资质 |
| 点赞 | 已移除；无社交互动信号 |

**允许的能力与表述**

| 可以做 | 表述方式 |
|--------|----------|
| AI 找队 | **检索 / 筛选公开组队招募帖**，展示解析条件（出发地、日期、人数） |
| 申请加入 | 卡片主按钮 **「申请加入」** → 展开评论区并 **预填模板** → 发送为**公开评论**（非私密申请） |
| 组队招募帖 | **招募中 / 已满** 状态 + 人数进度（帖主自维护，平台不保证组满） |

> 历史曾实现 `team-chat`、申请 inbox、邀请接受/拒绝等能力，已回撤（`refactor(partner): remove team chat`）。Q2 **不恢复**私密组队通讯路线。

### 1.4 推广话术自检

**对外一句话**

- ✅ 电音节资讯与公开组队招募；招募支持 AI 筛选
- ✅ 帮你在**某场节的公开招募**里找同行（活动详情招募墙）
- ❌ 用 AI 查电音节 / AI 匹配找搭子（作主 slogan，已废弃）
- ❌ 发现电音节 · 找同好结伴（Q1 口径，已废弃）

**应用内 CTA / 按钮**

| 场景 | ✅ 可用 | ❌ 禁止 |
|------|---------|---------|
| 首页双 CTA | 查电音节 / 找组队 | 观演准备（作为主 CTA）、智能配对 |
| 招募卡片 | 申请加入、查看公开回复 | 联系队友、私信、投递 inbox |
| AI 找队结果 | 找到 N 条合适的公开招募 | 找到 N 条匹配、配对成功 |
| 发帖成功 | 招募帖已发布 · 公开信息展示 | 已为你匹配到队友 |

**分享 / 海报 / 推送**

| 场景 | ✅ 可用 | ❌ 禁止 |
|------|---------|---------|
| 小程序分享标题 | `{活动名} · 电音节资讯` | 保证组满、平台担保 |
| 人格测试海报 | 测测你的本命 DJ | 无 disclaimer 的 buddy-matching |
| **Set 票选分享** | `{活动名} · 我投了这 3 场 Set` | 投票找最佳队友、品味匹配 |
| 推送文案 | 你的招募帖有 N 条新公开回复 | 3 人想联系你、接受邀请 |

**英文（en-US）特别注意**

- ✅ public recruit discovery / public recruit posts
- ❌ buddy-matching（`platform.disclaimer` 已移除）

**上线前 grep 自检（`src/`）**

```bash
rg '联系队友|配对成功|平台担保|智能配对|buddy-matching' src/
```

应无命中（docs 历史描述除外）。

### 1.5 国际化与用户体系（合规 · 2026-06）

**结论**：同一 OPC + ICP 备案 + 微信小程序 → **一套用户体系**（`openid` 单表），**不拆**中外籍两套用户管理。

| 做法 | 合规 |
|------|------|
| `preferredLocale`（`zh-CN` / `en-US`）+ 双语法律文档 | ✅ 产品分层，非法律分层 |
| `homeCity` · `raverMode` 等产品字段 | ✅ 同表扩展 |
| 同意时记录 `legalConsent.version` + **locale**（建议服务端留证） | ✅ 推荐 |
| 英文隐私政策与中文版 **实质等价**（权利义务对齐） | ✅ 在沪外国人可读 |
| 两套 User 表 / 两个小程序 / 外籍数据存境外 | ❌ 义务不减；境外存储触发 PIPL 跨境合规 |

上海外国人若使用本小程序，通常仍有微信账号 → 与境内用户相同 PIPL + 微信内容安全路径。GDPR 等域外规则若适用，应在**同一系统**补齐删除/导出权利，而非拆库。

**代码**：`src/i18n/` · `src/legal/en/` · `user.schema.ts` · `legalConsentStorage.ts`

### 1.6 PLUR / PLURR（锐舞文化 · 2026-06-25 · UX 终版 2026-06-26）

**结论**：锐舞文化 **PLUR** + **PLURR** 纳入 Q2 提审包，作为 **找队主轴（Unity）** 的产品化表达。完整方案见 [PLUR-PRODUCT.md](./PLUR-PRODUCT.md)；Story 见 [Q2-USER-STORIES.md § Epic K](./Q2-USER-STORIES.md#epic-k--plurplurr-锐舞文化--上线包)（**US-Q2-55～66**）。

**三层架构**

| 层 | 职责 | Story |
|----|------|-------|
| **L1 表达** | PLUR 入口壳 + 四镜头 H5 | 62 · 64 · 65 |
| **L2 引导** | 3 步筹备 Sheet + 首进编排 | 61 · 66 |
| **L3 行为** | 规范 / 标签 / 申请 / 指数 / PLURR | 55～60 |

**首进顺序**：L1 入口（可跳过）→ L2 三步引导（可跳过）；**分享落地 bypass** 两者（66）。**首页不放 PLUR Banner / 不自动播视频。**

| 词 | 在 SYNC 的角色 |
|----|----------------|
| **Peace** | 规范 + 攻略提示 + 四镜头第一镜 |
| **Love** | 申请/分享语气 + 四镜头第二镜 |
| **Unity** | **主轴**：标签、指数、引导 Step 2、四镜头第三镜 |
| **Respect** | 规范 + 申请确认 + 四镜头第四镜 |
| **Responsibility** | Festival Plan PLURR 责任清单 |

**合规**：PLUR 不引入信用分、匹配度、虚拟 kandi、点赞或站内私信；Unity 指数仅为**活动级聚合**。

**提审全量包（2026-06-26）**：**US-Q2-55～66 全部在 07-06 提审前完成**，含 **US-Q2-64** 四镜头 H5 与 **US-Q2-65** web-view。D11 冒烟覆盖 L1→64→L2 全链路 + L3 行为层。

**进度（2026-06-26）**：**US-Q2-55**（社区规范 PLUR 四核）· **US-Q2-56**（招募帖 Unity 标签）已验收 ✅；L3 其余项进行中。

**极端砍 scope（仅 buffer 耗尽）**：64 可降为 Peace+Unity 两镜 Lite；65 web-view 仍必交付。详见 [PLUR-PRODUCT.md §七](./PLUR-PRODUCT.md#七story-分期与排期0706-提审前--全量)。

---

## 二、信息架构

### 2.1 主包 Tab（3 个）

| Tab | 路由 | 文案 | 当前职责 |
|-----|------|------|----------|
| 首页 | `pages/index/index` | 首页 | 精选、我的下一场、**双 CTA（搜节/找队）**、示例 Chip |
| 活动 | `pages/events/index` | 活动 | 列表 / 日历 / 艺人；**列表 Tab 搜索过滤**（艺人串联见 US-Q2-19） |
| 我的 | `pages/profile/index` | 我的 | 资料、帖、设置 |

底栏：`components/navigation/BottomNav`（3 Tab）。`packageAi/pages/ai-assistant` 遗留深链 → 重定向首页或活动 Tab（带搜索 intent）。

### 2.2 分包页面

| 分包 | 页面 | 说明 |
|------|------|------|
| `packageEvent` | `event-detail` | **组队招募墙（Q2 主战场）**、阵容、攻略、准备清单（折叠） |
| | `exclusive-itinerary` | 专属时间表（依赖官宣；未出时可订阅，不阻塞找队） |
| | `my-itinerary` | 已生成行程 |
| | `personality-test` | 人格测试 → 同步曲风偏好 → 找队/发招募（官宣前可用） |
| | `ai-travel-guide` | 出行攻略详情 |
| `packageProfile` | `profile-activities` / `profile-posts` / `settings` / `legal-document` / `notifications` | 同现网 |

### 2.3 页面职责（Q2 终局）

```text
                         ┌──────────────────────────────────────┐
                         │  首页（双 CTA；raverMode 调主次）       │
                         └───────────────────┬──────────────────┘
                                             │
              ┌──────────────────────────────┼──────────────────────────────┐
              ▼                              ▼                              ▼
     ┌─────────────────┐          ┌─────────────────┐          ┌─────────────┐
     │  活动 Tab        │          │  本地 Hub        │          │  我的        │
     │  catalog 全量    │          │  （local 找队主路径）│          │  资料/设置   │
     └────────┬────────┘          └────────┬────────┘          └─────────────┘
              │                            │
              ▼                            ▼
     ┌─────────────────┐          ┌─────────────────┐
     │  festival 详情   │          │  单场轻详情/Sheet │
     │  资讯+攻略+招募  │          │  艺人+招募墙      │
     │  （nomad 主路径） │          │  （帖绑 activityId）│
     └─────────────────┘          └─────────────────┘
```

**底座不变**：UGC（招募帖、公开评论）一律绑定 **`activityLegacyId`**；Hub 仅为浏览聚合层。

### 2.4 ~~准备 Tab 方案 C~~（已下线 · US-Q2-22）

**2026-06**：移除底栏「准备」Tab 与 WebSocket 多轮对话。查节改由 **活动 Tab 列表搜索**；找队改由 **活动详情招募区**；攻略/行程/发招募在详情 Sheet 或分包页完成。

### 2.5 Festival Plan（观演准备 · 降优先级）

三项**个人准备记录**（非平台承诺）。UI checklist 固定展示顺序为 `攻略 → 发招募 → 行程`（见 `festivalPlanTaskDefs.ts`），与下节真实时间线一致：组队可早于排专属时间表。

| 任务 | Q2 统一跳转 |
|------|-------------|
| `travel_guide` | 活动详情开 Sheet → 生成 |
| `itinerary` | `exclusive-itinerary` |
| `buddy_post` | 活动详情发**招募帖** |

**行程记账 · 人均试算（US-Q2-52 · P0 · W2）**：`my-itinerary` 小票 OCR / 手动记一笔 → **分摊 Sheet**（2～8 人统一均分，可关 = 仅个人）→ StatsBar 展示 **预计花费 + 人均** → **复制分摊摘要** 到微信线下结算。默认人数来自攻略 `headcount`（US-Q2-30/35）。**不经手资金、不代收代付、不绑招募队友**；完整 AA 账本 / 最小转账路径见上线后。

进度条展示：**首页「我的下一场」+ 活动详情折叠区**。

**PLURR 责任清单（US-Q2-59 · ✅）**：在折叠区增加可勾选「行前责任」项（补水、告知亲友、耳塞、散场交通、垃圾随身、照顾同队等），与三步 checklist **并列**，不替换顺序。详见 [PLUR-PRODUCT.md §十一](./PLUR-PRODUCT.md#十一plurr-责任清单项us-q2-59)。

**Peace 攻略提示条（US-Q2-60 · ✅）**：出行攻略详情页顶部 info banner，提示大型现场保持平和；session 内可关闭，不阻塞正文。详见 [PLUR-PRODUCT.md §10.4](./PLUR-PRODUCT.md#104-攻略-peace-条us-q2-60)。

#### 真实时间线

专属时间表依赖**主办方官宣阵容 / 发布 timetable**，通常临近开场才可用；公开组队招募往往在**官宣前**就已发生。Checklist 顺序 `攻略 → 发招募 → 行程` 与此一致；Prep Nudge（US-Q2-34）仍按阶段分支推荐（如阵容未官宣时弱化行程 nudge）。

| 阶段 | 距离开场 | 用户典型行为 | 平台可用信号 / 能力 |
|------|----------|--------------|---------------------|
| **早鸟 / 官宣前** | 数周～数月 | 找同行、发招募、聊风格/暗号 | **人格测试**（曲风 `favorGenres`）· AI 找队 · 招募墙 · ~~翻招募卡~~（**US-Q2-29** ⏸） |
| **有出行意向** | 不定 | 规划交通住宿 | **出行攻略**（出发地/预算 → 预填找队或发帖，US-Q2-30） |
| **官宣后 / 临行前** | 临近开场 | 排 set、对 timetable | **专属时间表**（阵容未出时展示订阅，**不阻塞**找队） |

**早期找队信号优先级**（均用于公开帖检索次排序或预填，非配对撮合）：

| 信号 | 何时可用 | 找队用途 |
|------|----------|----------|
| 人格测试 | 随时（约 5 分钟） | 同步 `favorGenres`、发帖预填、招募墙 CTA（**US-Q2-27 / 17**）；翻卡加权 **US-Q2-29** ⏸ |
| 设置页偏好 | 用户手改后 | 同左；覆盖人格默认值 |
| 出行攻略 | 填表 / 选预算档后 | 出发地、预算预填搜索与发帖（US-Q2-30 / 35） |
| 专属时间表 | 官宣后 | 个人观演准备为主；对找队为弱信号 |

**对用户的一句话**：阵容和时间表往往临近才公布，但找队友可以更早开始；测人格或浏览公开招募即可，系统用你自愿填的偏好帮你**检索和排序公开帖**；等官方时间表出来后再排专属行程。

#### 出行攻略 · 境外地图（日韩 · 2026-06）

| 区域 | 地图 POI | 上线前方案 | Story |
|------|----------|------------|-------|
| **中国大陆** | 高德 `place/around` · geocode | 现网 | — |
| **泰国等已有 Hot Path** | 跳过高德 + **精选兜底 POI** | 现网（legacyId 1/5） | — |
| **日本 / 韩国** | 高德境外 POI **不可用** | **Hot Path 预置场馆 + 枢纽 + 兜底酒店/夜宵** | **US-Q2-49**（D2～D3 · P0） |
| **其他境外** | 同上 | 无 Hot Path 则隐藏入口或「筹备中」 | Q2-49 Phase C |
| **动态境外 POI** | Google Places 等 | **上线后** | **US-Q2-50** Sprint 6 |

**提审前最低保**：**EDC Korea（legacyId 8）** 可完整生成攻略；禁止用户对热门日韩场看到裸 `503`。

### 2.6 冷启动（三轨）

上线初期同时跑三条互补轨道，避免「空城」「无新用户」或「有用户无供给」：

| 轨道 | 目标 | 负责 | Story |
|------|------|------|-------|
| **种子招募帖** | 热门活动招募墙有可见内容 | 运营发帖 | US-Q2-21 |
| **本命 Set 票选裂变** | **零用户期主拉新** · 绑活动阵容话题 · 沉淀偏好 | 产品 / 增长 | **US-Q2-53** |
| **人格测试微信裂变** | 泛化拉新 + 曲风 `favorGenres` | 产品 / 增长 | US-Q2-18 · 17 · 27 |

**决策（2026-06-24）**：冷启动无真实用户时，人格测试偏泛化；**Set 票选**绑定热门活动 + 阵容，分享动机更强（「我投了这 3 场 Set，你呢？」），升为 **P0**，与人格裂变并行推流。

#### Set 票选裂变漏斗（微信分享 · US-Q2-53）

```text
A 在活动详情选 3 场必看 Set → 分享小程序卡片 / 海报
  → B 点开（落地页展示 A 的心愿 + 全场 TOP 榜 teaser）
  → B 自己完成投票 + 登录提交
  → 可选写入 favorGenres（所选 DJ 曲风 → US-Q2-27）
  → 主 CTA 进有种子的活动招募墙 / 预填发招募
```

**重要**：分享链接只携带**分享者**的心愿用于 teaser；**新用户偏好**须在该用户**自己投完并提交**后才写入；全场榜为聚合统计，不暴露他人投票明细。

#### 人格裂变漏斗（微信分享）

```text
A 测完 → 分享小程序卡片 / 海报（现网 `onShareAppMessage` 已有）
  → B 点开（落地页展示 A 的类型 teaser：share=1 · primaryType · soulDjId）
  → B 自己完成测试 + 登录提交
  → 写入 favorGenres（类型 genreTags → US-Q2-27，待接）
  → 主 CTA 进有种子的活动招募墙 / 预填发招募（US-Q2-17）
```

**重要**：分享链接只携带**分享者**的类型用于 teaser；**新用户偏好**须在该用户**自己测完并提交**后才写入，点开未测完不算拿到偏好。

#### 现网 vs 待收口

| 能力 | 状态 |
|------|------|
| 微信卡片 / 朋友圈分享、分享 path、好友 teaser（人格） | ✅ 已有（`personalityWechatShare.util.ts`） |
| 保存 / 分享海报（人格） | ✅ 已有 |
| 首页人格测试入口 | ✅ `HomePersonalityTestEntry` |
| **Set 票选（投票 + 榜 + 分享 + 招募墙 CTA）** | ✅ **US-Q2-53（P0）** |
| 测完写 `favorGenres` | ✅ US-Q2-27 Lite |
| 结果页主 CTA → 招募墙转化 | 🔲 US-Q2-17 |
| 分享卡片视觉与合规终检（人格） | 🔲 US-Q2-18 |

#### 裂变文案合规

| ✅ 可用 | ❌ 禁止 |
|---------|---------|
| 测测你的本命 DJ / Raver 人格 | 测测你的搭子、缘分队友 |
| 我是「XX 型」Raver（分享标题现网） | 匹配度、配对成功 |
| `{活动名} · 我投了这 3 场 Set` | 投票决定你的最佳队友 |
| 找同风格公开招募（测完/投完 CTA） | 智能匹配最佳队友 |
| 全场必看 Set 人气榜（聚合数据） | 你和 TA 品味合不合 |

**代码**：`personalityWechatShare.util.ts` · `PersonalityResultView.tsx` · `usePersonalityTestPage.ts` · `personality-types.ts`（`genreTags`）· `setVoteWechatShare.util.ts` · set-vote API

---

### 2.7 Raver 模式（本地 / 追节）

首进或设置中选择用户类型，**同一 App、同一路由**；仅调整首页/活动 Tab **模块顺序、双 CTA 主次、默认跳转**，不拆两套小程序。

| 模式 | `raverMode` | 典型用户 | 双 CTA 主次 |
|------|-------------|----------|-------------|
| **本地 Raver** | `local` | 主要在同城 club / 室内局 | **找组队** 主 · 查活动 次 |
| **追节 Raver** | `nomad` | 跨城追 festival | **查活动** 主 · 找组队 次 |
| 中性（跳过） | `balanced` | 未选择 | 现网同等权重 |

**本地模式能力开关**

| 能力 | local | nomad |
|------|-------|-------|
| 出行攻略 / 专属时间表 / Festival Plan 三步 | **默认隐藏** | ✅ 保留 |
| 本地城市 Hub（§2.9） | ✅ 找组队默认入口 | 可选进入 |
| 活动详情 `event-detail`（festival） | 可进，不主推攻略 | ✅ 主路径 |
| 人格测试 / 裂变 / `favorGenres` | ✅ | ✅ |
| **Set 票选裂变** | ✅（阵容官宣活动） | ✅ |
| `homeCity`（如上海） | 默认写入，联动找队 | 可选常驻地 |

**首进交互**：一屏两卡（「主要在本地玩」/「我会追外地电音节」）+ **稍后再说**；人格分享落地不强制挡选择。设置页可改 `raverMode` · `homeCity`。

**合规**：表述「本地玩 / 追节 overseas」，禁止「匹配度」「缘分队友」。

Story：[US-Q2-37](./Q2-USER-STORIES.md#us-q2-37--raver-模式本地--追节-p1--m--)

---

### 2.8 室内活动 Catalog（按活动收录 · 非按店）

**Catalog 一级单位 = 一场活动**；场馆（INS、Abyss 等）是 `location` / 可选 `venueName` 字段，**不是**目录节点或独立详情根。

| 字段 | 说明 |
|------|------|
| `activityType` | `festival` \| `indoor`（已有 schema） |
| `name` | 活动/厂牌名（非店名） |
| `date` · `location` | 含「城市 · 场馆」 |
| `city` | 上海 / 深圳 / 香港（Phase 1 结构化，便于筛选） |
| `alias[]` | 城市、场馆、曲风、艺人，供搜索 |
| `lineup` / performances | 绑定艺人（单场常 1 主咖） |

**命名**：`{活动名} · {城市}` 或 `{系列} @ {场馆}`；❌ 不要用「INS 新乐园」单独作 activity name。

**多城扩展**：上海冷启动 → 深圳（可与 Storm 并存）→ 香港（`region=hmt`）；同一 Tab，**城市 Chip 或搜索**，不拆城市小程序。

**室内详情模板**（仍可用 `event-detail` 或半屏 Sheet，见 §2.9）：

- 资讯：日期 · 场馆 · **艺人介绍**（Headliner，`DjService.profile` / US-Q2-33）
- 主 CTA：**查看艺人介绍**（非「专属时间表」）
- **不展示**：攻略、行程、Festival Plan 折叠区（`raverMode=local`）
- 下半：**招募墙 + AI 找队**（与 festival 相同，帖仍绑 `activityLegacyId`）

Story：[US-Q2-38](./Q2-USER-STORIES.md#us-q2-38--室内活动-catalog-收录与多城-p1--m--) · [US-Q2-40](./Q2-USER-STORIES.md#us-q2-40--室内活动详情--艺人介绍-p1--m--)

---

### 2.9 本地城市 Hub（聚合浏览 · 单场 UGC）

本地 Raver **找组队**默认进入 **「{city} · 本周」Hub**，而非逐场打开全屏详情；**发帖、评论、通知仍绑单场 `activityLegacyId`**。

```text
首页 [找组队·主] → 上海 · 本周 Hub
  ├─ 顶栏：AI 找队（范围=同城 indoor 活动帖，待 API 扩展）
  ├─ Chip：周五 | Techno | 仅招募中
  ├─ 区块：SYSTEM @ INS · 06/21
  │     艺人条 · 招募预览 · [看这场] [发招募]
  └─ 区块：Abyss Session · …
```

| 动作 | 页面 |
|------|------|
| 浏览多局 | Hub |
| 跨场 AI 搜 | Hub（`activityLegacyIds[]` 或 city+indoor，上线后） |
| 发招募 / 申请加入 / 分享 | 必须带 **单场 ID**（Sheet 或轻详情半屏） |
| 追节 / festival | 仍 **一活动一详情**，不走 Hub |

Story：[US-Q2-39](./Q2-USER-STORIES.md#us-q2-39--本地城市-hub-聚合页-p1--l--)

### 2.10 首页与活动 Tab（分模式）

#### 首页

| 模块 | local | nomad |
|------|-------|-------|
| 双 CTA | 找组队 **大** · 查活动 小 | 查活动 **大** · 找组队 小 |
| 找组队默认 | → **本地 Hub**（`homeCity`） | → 我的下一场 / featured festival 招募墙 |
| 区块 | 本周 · {city} indoor · 人格 · 热门 festival（次要） | 倒计时 · featured · 我的下一场 · Festival Plan |
| 隐藏 | 攻略/行程/Plan 进度 | — |
| 合并入口 | 人格测一项；可砍重复 QuickActions | 同左 |

#### 活动 Tab（同一页，默认 filter 不同）

| | local | nomad |
|--|-------|-------|
| 类型 Chip 默认 | **室内活动** | 电音节 |
| 地区 | 国内 | 全部 |
| 列表 | 「近期 · {city}」区块 + 全部活动 | 热门横滑 + festival 列表 |
| 搜索占位 | 活动、城市、场馆、艺人 | 节名、国家、日期 |
| 日历 | **含 indoor**（现网日历仅 festival，待改） | festival 为主 |
| 卡片 | 无「AI 攻略」tag；展示招募条数 | 阵容 badge（已官宣阵容 / 待官宣阵容）· 地区 |

详见 [Q2-USER-STORIES.md](./Q2-USER-STORIES.md) US-Q2-36 ✅ · US-Q2-37 · US-Q2-39 · US-Q2-40。

---

## 三、组队招募（Q2 核心改版）

### 3.1 命名

| 现网 | Q2 |
|------|-----|
| 发帖 / 活动帖子 | **发招募 / 组队招募** |
| 模板帖 | **招募帖**（结构化字段 + 公开列表） |

### 3.2 招募帖卡片（对齐设计稿 · 合规裁剪）

**保留**

- 用户信息、正文、`#组队` 标签
- 状态角标：**招募中** / **已满**（帖主切换）
- 人数进度：**2/3**（`slotsFilled` / `slotsTotal`）
- 主按钮：**申请加入**（入口）→ 展开评论区 + **预填可编辑模板**（实现）→ `POST /posts/:id/comments`
- 评论 icon + 数量（**全员可见**，可浏览全部公开讨论）
- FAB **+** 发招募
- **无点赞**（现网已移除 like）

**不做（相对设计稿）**

| 设计稿元素 | Q2 处理 |
|------------|---------|
| 「联系队友」 | **删除** |
| 私密「投递」inbox | → **「N 条公开回复」**，跳转帖+评论区 |
| 组队邀请 接受/拒绝 | **不做**；邀请 = 公开评论 |
| 申请仅队长可见 | **不做**；申请 = 点主按钮后发**公开评论** |

### 3.3 AI 找队

| 入口 | 实现 |
|------|------|
| 活动详情招募区 | **已有**：帖列表上方 `EventDetailPostSearchBar` + 城市 chip；`POST /posts/ai-search`；结果替换列表 |
| 本地 Hub（上线后） | 跨场检索同城 indoor 招募帖（`local_hub_recruit_search`，见 US-Q2-39） |
| 人格测试 → 找队 | 结果页主 CTA 进招募墙 / 预填发帖；测完同步曲风偏好（US-Q2-17 / 27） |
| ~~准备 Tab 对话~~ | **已移除**（US-Q2-22） |
| Q2 待优化 | 洞察行「已参考你的偏好」、无结果引导发招募、Prep Nudge 分阶段推荐（US-Q2-34） |
| **申请加入评论 AI**（post-launch） | 「申请加入」展开评论区时横滑 2～3 条公开评论草稿（**US-Q2-44**） |

后端：`PostSearchService` · `BuddyPostSearchParseService` · **关键词相关性优先**，再结合用户资料（城市 / 曲风偏好，含人格测试写入的 `favorGenres`）作**次要排序**；非付费匹配。官宣前无行程时，**人格偏好是早期找队的主要可用信号**（见 §2.5）。

### 3.4 评论与互动

- 全站**公开评论**（`GET|POST /posts/:id/comments`）
- 禁联系方式 · 票务词 · `msg_sec_check`
- 通知：`comment` / `comment_reply` + 微信订阅；首页 `myNextEventPostEngagement`

详见 [POST-LIFECYCLE.md](./POST-LIFECYCLE.md)。

---

## 四、AI 查节（主轴 A）

| 能力 | 实现 |
|------|------|
| 列表搜索 | 活动 Tab 搜索框 + 客户端 filter（`filterActivitiesForEventsSearch`） |
| 目录筛选 | 地区 chip（全部/国内/海外/港澳台）· 时间 chip（即将开始/本月/热门）· 热门横滑（`hot === true`，≥3 场） |
| **艺人目录** | 活动 Tab 第三子 Tab；按 DJ 反查出场活动 → 活动详情（**US-Q2-19** post-launch） |
| 详情资讯 | `EventDetailInfoSection`：状态 pill · 类型/地区/更新于 · 来源 · 免责；CTA → `activity-lineup`（US-Q2-36 ✅） |
| 阵容深页 | `activity-lineup`：演出时间表 / 阵容艺人卡 / 未官宣订阅；点 DJ → 艺人半屏（US-Q2-19 / 33）；专属行程 → `exclusive-itinerary` |
| ~~Agent 对话查节~~ | **已下线**（后端 WS 默认关闭，见 US-Q2-22） |
| 信任 | US-Q1-04 信息来源（`infoSource` · `infoUpdatedAt`）；未官宣可订阅（`lineupPublished`） |
| **节故事**（post-launch） | 详情资讯区折叠「关于这场节」：起源 · 里程碑 · 曲风气质；`infoSource` + 免责（**US-Q2-41**） |
| **哪场节适合我**（post-launch） | 人格 + 偏好 + 档期 → 推荐活动卡 + `insight_line`（**US-Q2-42**；非匹配队友） |
| **自然语言搜节**（post-launch） | 活动 Tab：「7 月欧洲 techno」→ 解析 filter（**US-Q2-45**） |
| **双节对比**（post-launch） | 结构化对比卡（地点/曲风/预算档/签证提示）（**US-Q2-46**） |
| **赛后文字回忆**（post-launch） | 绑活动、纯文字结构化字段；详情折叠「赛后回忆」（**US-Q2-51**） |
| **现场精选**（post-launch） | 独立模块：投稿待审 → 人工发布精选图；详情折叠「现场精选」（**US-Q2-54**）；非招募帖配图 |

详情资讯区分三层：**事实**（时间地点来源）· **阵容**（`activity-lineup`）· **叙事**（节故事，默认折叠，不挡招募墙首屏）。赛后层：**文字回忆**（US-Q2-51）与 **视觉精选**（US-Q2-54）均折叠弱曝光，与招募区分轨。

### 4.1 艺人 Tab（查节第三条入口 · US-Q2-19）

**定位**：「这个艺人今年在 catalog 里哪几场出场」→ 终点仍是 **活动详情 + 公开招募**，不是听歌 App 或交友匹配。

```text
活动 Tab · 艺人
├── （Phase C）搜索艺人名 · 曲风 chip · 偏好洞察行（排序，非匹配）
├── 艺人列表（默认：即将出场优先）
│     └── 卡片：头像 · 名 · 曲风 · N 场 · 最近一场（可选）
└── 点击 → ArtistProfileSheet（半屏，与阵容 / 室内局复用）
      ├── 简介摘要 + 免责
      ├── （Phase B）代表曲目（曲名，不播完整音频）
      ├── 出场活动列表 → event-detail
      └── CTA：查看最近一场 · 公开招募在活动详情
```

| 阶段 | 范围 |
|------|------|
| Phase A | 可点 · 半屏 · 出场活动 → 详情 |
| Phase B | Discogs / `query_dj_info` 简介（US-Q2-33） |
| Phase C | 搜索 · 曲风 chip · `favorGenres` 目录加权 |

**合规**：无「配对队友 / 匹配度 / 平台担保」；偏好仅用于目录排序或预填 AI 找队检索。

**现网**：`EventsActivityArtistsTab` + `GET /activities/lineup-artists` 已展示不可点排行榜；串联待 US-Q2-19。

---

## 五、现网功能摘要（截至 Q1 完成）

### 活动详情（当前）

- 静默 `POST /activities/:legacyId/register`
- **资讯区**（首屏）：状态 pill · 时间地点 · 类型/地区/更新于 · 「查看阵容与时间表」→ `activity-lineup` · 来源 + 免责（US-Q2-36 / Q2-12）
- 组队招募区：城市 chip + **AI 找队搜索条**（与帖列表同区，`EventDetailPostSearchBar` → `POST /posts/ai-search`）
- 观演准备折叠区：出行攻略卡片、Festival Plan 条
- **现场精选**（post-launch · **US-Q2-54**）：独立照片墙；用户投稿 → 人工审核 → 平台精选发布；绑单场 `ended` 活动、详情折叠入口；**无点赞**；与招募帖 / 文字回忆分轨
- `lineupPublished === false` 时资讯区展示订阅横幅

### 活动 Tab

- 列表 / 日历 / 艺人（**地图组件已实现未挂载**）
- Q2（US-Q2-13）：顶部搜索框 → **即时过滤活动列表**；0 结果时引导换关键词或浏览全部（无 AI 对话兜底）
- Q2（US-Q2-36 ✅）：地区 + 时间 chip · 热门横滑 · 卡片地区/阵容 badge · 日历全量展示（默认当前月、过期置灰、点日期过滤）
- **艺人（US-Q2-19 🔲）**：现网仅排行榜展示；post-launch 可点进半屏 · 出场活动 → 详情
- **Gap（US-Q2-38）**：类型 Chip（电音节/室内活动）；日历含 indoor — post-launch

### 首页（目标 · US-Q2-37）

- **local**：找组队主 CTA → 本地 Hub；本周 indoor · 人格 · 次要 festival 横滑
- **nomad**：查活动主 CTA → featured festival；Festival Plan / 我的下一场

### 微信能力

- 订阅消息、Cloud Run REST/WS、DarkMode

### 工程

- 分包预加载、详情 seed 缓存、AI 超时 60s · 见 [BUNDLE-SIZE.md](./BUNDLE-SIZE.md)
- **观演资料包离线（规划）**：按活动持久化阵容 / 时间表 / 专属行程；招募帖在线优先 · [ARCH-REFACTOR-STORIES.md US-ARCH-19](./ARCH-REFACTOR-STORIES.md#us-arch-19--观演资料包离线缓存阵容时间表优先-p1--m--fe--)

---

## 六、Q2 路线图摘要

| 阶段 | 周期 | 重点 |
|------|------|------|
| **0–4** | 已完成 | 合规、招募改版、去对话化、AI 找队、招募字段 |
| **5 上线冲刺** | ～2 周（目标 07-06 前提审） | 种子帖、冒烟提审、可选偏好洞察/Prep Nudge；**全球节讯目录 ✅**；人格分享链路现网可用，转化收口见 17/27 |
| **6 上线后** | 2～4 周 | Scene Agent 基建、**境外 Google Places（Q2-50）**、结构化申请、**Raver + 室内 catalog**；阵容必看 set（Q2-43）· 申请评论 AI（Q2-44）· 官宣规律（Q2-47） |
| **7 增长** | 有数据后 | 本地 Hub、人格裂变、**翻招募卡（Q2-29，帖量门槛）**、AI 发帖；**哪场节适合我（Q2-42）** · **节故事 MVP（Q2-41）** · 生存指南（Q2-48） |
| **8 本地深化** | 上海验证后 | 跨场 AI 找队、多城 seed；**NL 搜节（Q2-45）** · **双节对比（Q2-46）** · 艺人 Tab 串联 |

完整 Story 与验收：[Q2-USER-STORIES.md](./Q2-USER-STORIES.md)。

---

## 七、关键指标（Q2）

| 指标 | 说明 |
|------|------|
| AI 找队使用率 | 详情 AI 搜索 / 进详情 UV |
| 招募 → 公开回复转化 | 「申请加入」后发公开评论比例 |
| 发招募转化 | 浏览招募墙后发帖率 |
| 活动搜索使用 | 活动 Tab 搜索 / 首页 Chip CTR |
| 查节 → 选活动 | 搜索后进详情或 register 率 |
| **人格裂变** | 分享次数 · 分享落地 UV · 落地→测完率 · 测完→进招募墙率 |
| **偏好沉淀** | 测完且已写 `favorGenres` 的用户占比（US-Q2-27） |
| **本地 Hub**（上线后） | local 用户 Hub 进入率 · Hub→发招募 / 申请加入转化（US-Q2-39） |
| **节故事**（上线后） | 故事展开率 · 展开者 register / AI 找队率 vs 未展开（US-Q2-41） |
| **申请评论 AI**（上线后） | 使用草稿的用户「申请加入→发评论」转化率（US-Q2-44） |
| 合规 | 类目/资质驳回 0；联系方式拦截正常 |

---

## 八、待办与决策项

### 8.1 Scene AI 增强路线图（无感 Agent · 2026-06）

> 原则：**不恢复对话 Tab**；AI 嵌在用户正在做的场景，产出可点击 effect。详见 [SCENE-AGENT.md](./SCENE-AGENT.md)。

| 层级 | 说明 | 示例 |
|------|------|------|
| **L0 规则** | 不调 LLM | Prep Nudge、官宣往年规律（Q2-47） |
| **L1 单轮 scene-run** | 单次 LLM + effects | 帮写帖/评论、节故事摘要、DJ 解读 |
| **L2 长任务 REST** | 独立进度 | 攻略生成、行程优化（`itinerary-schedule.service.ts`） |

| 吸引主轴 | Scene / Story | Sprint | 核心 effect |
|----------|---------------|--------|-------------|
| **查节** | `festival_recommend` · Q2-42 | 7 | 活动卡 + insight_line |
| **查节** | `festival_story` · Q2-41 | 7 | inline_card（折叠） |
| **查节** | `events_nl_search` · Q2-45 | 8 | prefill_query + 过滤列表 |
| **查节** | `festival_compare` · Q2-46 | 8 | inline_card 对比表 |
| **找队** | `recruit_apply_compose` · Q2-44 | 6 | candidates 公开评论草稿 |
| **找队** | 已有 recruit_* | 5～7 | 搜帖 / 帮写 / ~~翻卡~~（Q2-29 ⏸）/ Chip |
| **准备/粘性** | `lineup_picks` · Q2-43 | 6 | 高亮 DJ → open_sheet 行程 |
| **准备** | `guide_survival` · Q2-48 | 7 | 攻略后节别生存指南卡 |
| **资讯** | `lineup_announce_hint` · Q2-47 | 6 | insight_line（规则） |

**明确不做**：全站聊天、匹配度/最佳搭子、AI 自动代发（须用户选草稿确认）、付费 AI、塔罗抽队友。

### 自 Q1 延续

| ID | 功能 | 状态 |
|----|------|------|
| US-Q1-04 | 活动信息来源标注 | Q2 Epic D |
| US-Q1-05 | 官方购票外链 | 继续暂缓 |
| US-Q1-16 | 人格测试分享 | Q2 Epic G |
| US-Q2-20 | 活动 Tab 地图 | **MVP 不做**（建议下线未挂载代码） |

### 本地趣味功能（合规 · Sprint 7～8）

~~翻招募卡（US-Q2-29，⏸ 用户/帖量门槛后）~~ · AI 暗号候选 · 申请评论草稿（US-Q2-44）· 节故事 hook（US-Q2-41）· 赛后回忆（US-Q2-51）· **现场精选**（US-Q2-54）· Hub「今晚 N 场 · M 条招募」· 艺人卡 + 曲目 · 招募海报 · 曲风 Chip — **不做**匹配/塔罗/站内私信/点赞。

### 明确不做（Q2）

- 队内私密评论、team-chat、私信、「联系队友」
- 私密投递 inbox、邀请接受/拒绝协议
- 点赞、付费匹配、票务返佣

---

## 九、代码索引

| 领域 | 路径 |
|------|------|
| 组队招募 / 帖流 | `src/domains/partner-feed/` |
| 现场精选（post-launch） | 🔲 US-Q2-54 · `packageEvent/pages/activity-photo-wall/`（待定）· 后端 `activity-photo` 模块（待定） |
| AI 找队搜索 | `useEventDetailPostSearch.ts` · `api/sync/posts.ts` |
| 后端 AI 搜索 | `sync-app-backend/.../post-search.service.ts` |
| Festival Plan | `src/domains/festival-plan/` |
| 出行攻略 | `src/domains/travel-guide/` |
| 人格测试 / 微信分享 | `domains/personality-test/` · `personalityWechatShare.util.ts` |
| Raver 模式 / 本地 Hub | 🔲 US-Q2-37 · US-Q2-39 · `pages/index/` · 新 Hub 分包页（待定） |
| 室内 catalog / 艺人 | `activityType` · `DjService` · US-Q2-38 · US-Q2-40 |
| 活动搜索 | `pages/events/` · `filterActivitiesForEventsSearch.ts` |
| Agent 工具 | `sync-app-backend/src/ai/agent/tools/` |
| 发帖链路 | [POST-LIFECYCLE.md](./POST-LIFECYCLE.md) |
| 无感 Scene Agent | [SCENE-AGENT.md](./SCENE-AGENT.md) |
| 路由 | `src/utils/route.ts` |
