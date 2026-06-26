# PLUR / PLURR · 产品方案（SYNC 小程序）

> **关联**：[PRODUCT.md](./PRODUCT.md) · [Q2-USER-STORIES.md](./Q2-USER-STORIES.md)（US-Q2-55～66）· [POST-LIFECYCLE.md](./POST-LIFECYCLE.md)  
> **决策日期**：2026-06-25（UX 终版 · 2026-06-26）· **目标**：2026-07-06 提审前完成上线包  
> **Story 索引**：见 [Q2-USER-STORIES.md § Epic K](./Q2-USER-STORIES.md#epic-k--plurplurr-锐舞文化--上线包)

---

## 一、战略定位

### 1.1 PLUR 在 SYNC 里是什么

SYNC 对外一句话：**电音节资讯与公开组队招募；招募支持 AI 筛选**。

PLUR 不是「锐舞百科」或独立社交社区，而是 **找队文化的操作系统**：

| 层级 | 作用 |
|------|------|
| **品牌认同** | 老 Raver 感到「这 App 懂圈」 |
| **行为约束** | Peace / Respect 写入规范与交互，降低戾气、站外引流 |
| **找队增效** | **Unity 是主轴**——表达「我们是一伙的」，而非「平台帮你配对」 |
| **行前责任** | PLURR 的 Responsibility 落在 Festival Plan，不新增社交功能 |

### 1.2 设计原则

1. **一核四辅，Unity 居中** — Unity 与「找队」同构；Peace / Love / Respect 是 Unity 的前提；Responsibility 是节前行前延伸。
2. **文化进流程，不进 Banner** — 嵌在发招募、申请加入、社区规范、Festival Plan、分享文案；不在首页大 Banner 堆 PLUR 大字。
3. **说人话，不说教** — 每条文案对应一个可执行动作（如 Respect = 确认公开回复、不留联系方式）。
4. **可度量，但不打分** — Unity 指数展示**活动级聚合**，不对个人评级。
5. **同一时刻只有一个阻断层** — L1 入口与 L2 引导 **串联互斥**；分享落地 **bypass** 首进链。
6. **找队 30 秒内可达** — 从打开小程序起，任何跳过路径都应在约 30s 内能进详情/招募墙。

### 1.3 三层产品架构（UX 终版）

| 层级 | 回答的问题 | 载体 | Story |
|------|------------|------|-------|
| **L1 · 表达层** | 这 App 懂不懂锐舞？ | PLUR 入口壳 + 四镜头 H5 | **62 · 64 · 65** |
| **L2 · 引导层** | 我第一步该点什么？ | 3 步筹备引导 Sheet（现网 onboarding） | **61 · 66** |
| **L3 · 行为层** | 发帖/回复时规矩是什么？ | 规范、标签、确认、指数、PLURR | **55～60** |

**L1 不替代 L2；L2 不讲四核长文；L3 零额外弹窗。**

### 1.4 合规红线（与 PRODUCT.md §1.3 一致）

| 不做 | 原因 |
|------|------|
| PLUR 信用分 / Raver 等级 / 匹配度 | 撮合承诺 |
| 虚拟 kandi 交换、站内好友、点赞 | 社交网络平台 |
| 「配对成功」「缘分队友」「平台担保」 | 合规 |
| 站内私信、「联系队友」 | 私密 UGC + 撮合 |

| 可以做 | 表述方式 |
|--------|----------|
| Unity 标签筛选公开招募 | 检索 / 筛选公开帖 |
| Respect 公开回复确认 | 确认公开评论，非组队协议 |
| Unity 指数 | 「N 条公开招募 · M 人关注这场」 |
| PLURR 责任清单 | 个人行前勾选，非平台承诺 |

---

## 二、PLUR 四核 · 原版释义与 SYNC 映射

### 2.1 Peace · 平和

**锐舞文化释义**

- 核心：摒弃冲突、放下敌意
- 现场：不推搡、不吵架、不抢位置、不针对陌生人；磕碰主动退让
- 延伸：整个舞池无争吵、无对立的和谐氛围

**SYNC 产品映射**

| 触点 | Story |
|------|-------|
| 社区规范 Peace 条款 | US-Q2-55 |
| 出行攻略生成后 Peace 提示条 | US-Q2-60 |
| 申请/评论语气引导（平和、非歧视） | US-Q2-57 |

### 2.2 Love · 热爱 / 善意

**锐舞文化释义**

- 核心：发自内心的温柔与善意，对所有人释放善意
- 行为：扶摔倒的人、递水、帮看物品、安慰情绪低落的 raver
- 标志：交换 kandi 手链传递 Love
- 延伸：对电音、舞池、身边每一个人的温柔爱意

**SYNC 产品映射**

| 触点 | Story |
|------|-------|
| 申请加入 Love 语气模板 | US-Q2-57 |
| AI 发招募 Love 语气选项 | US-Q2-56（标签含「欢迎新手」等）· US-Q2-28 串联 |
| Set / 人格分享 Love·Unity 文案 | US-Q2-63 |
| 四镜头短片 Love 镜头 / 文化说明页 | US-Q2-64 · US-Q2-62 |

**不做**：虚拟 kandi 交换、站内礼物。

### 2.3 Unity · 团结 / 一体（**产品主轴**）

**锐舞文化释义**

- 核心：所有人不分彼此，舞池是一个整体
- 行为：同享节拍、搭肩挥手、We Are One
- 延伸：抛开身份、贫富、圈层差异，来到现场我们都是同类

**SYNC 产品映射**

| 触点 | Story |
|------|-------|
| 招募帖 Unity 标签（可选 Chip） | US-Q2-56 |
| 活动详情 Unity 指数 | US-Q2-58 |
| 新用户引导 Unity 步骤 | US-Q2-61 |
| AI 找队空状态 Unity 文案 | US-Q2-58 · 现网增强 |

### 2.4 Respect · 尊重

**锐舞文化释义**

- 核心：双向尊重所有人与现场规则
- 尊重陌生人：不随意触碰、不偷拍、不强行搭讪
- 尊重 DJ 与音乐、尊重场地、尊重差异

**SYNC 产品映射**

| 触点 | Story |
|------|-------|
| 社区规范 Respect 条款 | US-Q2-55 |
| 申请加入 Respect 轻确认（勾选） | US-Q2-57 |
| 现有 UGC 联系方式拦截 | 现网 `assertPostHasNoContactInfo` |

### 2.5 Responsibility · 责任（PLURR 第五词）

**锐舞文化释义**

- 狂欢同时照顾自己、照顾身边陌生人、爱护场地环境
- 不惹麻烦、互相帮扶

**SYNC 产品映射**

| 触点 | Story |
|------|-------|
| Festival Plan PLURR 责任清单（可折叠勾选） | US-Q2-59 |
| 行程记账分摊 disclaimer | US-Q2-52 ✅（已有，文案对齐 Responsibility） |

---

## 三、首进编排链（US-Q2-66）

首页 `useDidShow` 由 **FirstRunOrchestrator** 统一决策（概念模块；实现可并入 `useNewUserOnboarding` + 新 hook）。

### 3.1 决策树

```text
进入首页 useDidShow
│
├─ A. 分享落地？（share=1 · setVote · personality · 深链 intent）
│     → 跳过 L1 + 跳过 L2 → 直达目标页
│
├─ B. 未登录 或 未 hasLegalConsent()？
│     → 不弹 L1/L2
│
├─ C. 已登录 + 已 consent + 未 plurEntrySeen
│     → US-Q2-62 L1 入口全屏（与 L2 底栏 Sheet 视觉区分）
│        · 观看短片 / 跳过 / 文字说明
│     → mark plurEntrySeen（跳过与观看等价）
│
└─ D. plurEntrySeen + 未 onboarding:v1
      → US-Q2-61 L2 三步引导 Sheet（现网 NewUserOnboardingSheet）
      → mark onboarding seen
│
└─ E. 均已处理 → 正常首页
```

**互斥规则**

- C 与 D **永不同时 open**
- 从 64 H5 返回：若用户已在 64 点「去找队」→ **跳过 D**，直进详情；否则进入 D（若未 seen）
- **同一 session 最多**：L1 一次 + L2 一次

### 3.2 用户时间线（追节新用户 · 理想路径）

```text
0s   打开 → 登录/协议（若需要）
3s   L1 入口全屏（1 键可跳过）
     ├─ 跳过 ─────────────────────────────┐
     └─ 观看 → 64 H5 ~10s ────────────────┤
15s  L2 三步引导底栏 Sheet（可跳过）       ← 与 L1 串联，不叠弹
30s  活动详情招募墙 / 发招募
```

### 3.3 分享落地 bypass 条件

以下 query / storage intent **必须**跳过 L1+L2（与 US-Q2-61 验收一致）：

- `share=1` · 人格 `primaryType` / `soulDjId`
- Set 票选分享 path（`setVote` / `voterPicks` 等现网参数）
- 深链 `focusPosts` · `openBuddyPost` · `event-detail` 直链

---

## 四、信息架构与动线

```text
                    ┌─────────────────────────────────────┐
                    │  设置/关于 · PLUR 短片（可重复看）      │  ← 62/63/64
                    └─────────────────────────────────────┘
                                      ▲
┌──────────────┐    ┌─────────────────┴─────────────────┐
│ L1 入口壳   │───▶│ L1 四镜头 H5 (64) · web-view (65)   │
│ (62) 可跳过 │    │ 10s · 静音默认 · 可跳过              │
└──────┬───────┘    └─────────────────┬─────────────────┘
       │ skip                          │ CTA: 去找队
       ▼                               ▼
┌─────────────────────────────────────────────────────────┐
│ L2 · 3步引导 Sheet (61) · NewUserOnboardingSheet         │
│  ①选活动  ②Unity找队  ③生成攻略                          │
│  [跳过]                                                  │
└────────────────────────────┬────────────────────────────┘
                             ▼
                    ┌─────────────────┐
                    │ 首页 · 活动详情   │
                    │ L3: 标签/指数/确认 │
                    └─────────────────┘
```

**首屏不放 PLUR Banner / 不自动播视频。** L1 仅首进或设置主动进入。

---

## 五、L1 · PLUR 四镜头（US-Q2-64）

**形态**：独立 H5（HTML + GSAP + SVG），经 **US-Q2-65** web-view 打开；**不**嵌入 Taro 主包。

**时间轴驱动**（非页面滚动）；总时长 ~10s；默认 **静音**；角上「开启声音」才播 BGM + 简易可视化。

| 镜头 | 时间 | 屏幕文案 | 动效要点 |
|------|------|----------|----------|
| **Peace** | 0–2.5s | Peace・放下争执，温柔共存 | 蓝光粒子慢漂、✌️ 淡入、低音波纹扩散、冲突光斑分开；**无频闪** |
| **Love** | 2.5–5s | Love・释放温柔，善待每一个人 | Kandi 汇聚、爱心粒子上浮、递串珠光带 |
| **Unity** | 5–7.5s | Unity・不分你我，万众一体 · We Are One | 手相扣、光墙闭环、人群光波 |
| **Respect** | 7.5–10s | PEACE LOVE UNITY RESPECT | 敬礼手势、DJ/耳机/音符/环保符号、四色光束 |

**播控**

- 右上角常驻 **跳过**
- 默认播 **1 遍** 后出 CTA；「再看一遍」可选；**不强制**粒子分解无限循环
- 10s 末 PLUR 定格 1.5s → 可选粒子分解 → CTA

**结束 CTA（优先级）**

1. **去找队** → `event-detail?focusPosts=1`（featured / query `activityLegacyId`）
2. **继续了解 SYNC** → 关 H5 → 若 onboarding 未 seen 则开 L2
3. **阅读社区规范** → 55 法律文档

**64 未上线时（仅极端 fallback）**：62「观看」→ 文化说明页；**提审目标仍为 64+65 全量上线。**

**工程路径**：`h5/plur-film/`（与 Taro 主包隔离）· 素材可用即梦静帧/背景。

---

## 六、L2 · 三步引导（US-Q2-61）

保留现网 **NewUserOnboardingSheet** UI（推荐活动卡 + numbered steps + 跳过），只改步骤语义。

| 步 | 标题 | 主按钮 |
|----|------|--------|
| **1** | 选一场活动 | 查看 {活动名} / 去活动列表 |
| **2** | **Unity · 找同行** | **浏览招募墙**（`focusPosts=1`）/ 发招募 |
| **3** | 生成出行攻略 | 为 {活动} 生成攻略 |

- 顶部标题可改为 **「3 步开始 · 查节找队」**；副标题保留合规句
- 底部弱提示：`想了解 PLUR 精神？设置 → PLUR 短片`（小字）
- **不在此 Sheet 内嵌四镜头或四核长文**

---

## 七、Story 分期与排期（07-06 提审前 · 全量）

> **产品决策（2026-06-26）**：**US-Q2-55～66 全部在提审前完成**，含四镜头 H5（64）与 web-view（65）。

| 阶段 | 目标日 | Story | 优先级 | 交付物 | 状态 |
|------|--------|-------|--------|--------|------|
| 文化基建 | D5～D6 | US-Q2-55 · US-Q2-56 | **P0** | 社区规范四核 · Unity 标签 | ✅ |
| 找队 Unity | D6～D7 | US-Q2-57 · US-Q2-58 | **P1** | Love 模板 + Respect · Unity 指数 | ✅ |
| 准备 PLURR | D7～D8 | US-Q2-59 · US-Q2-60 | **P1** | PLURR 清单 · Peace 条 | ✅ |
| 首进 UX | D8～D9 | US-Q2-66 · US-Q2-61 · US-Q2-62 | **P1** | 编排链 · L2 引导 · L1 入口壳 | 🔲 |
| 四镜头 H5 | **D9～D10** | **US-Q2-64** · **US-Q2-65** | **P1** | GSAP 四镜 · web-view · deeplink | 🔲 |
| 增长收口 | D10～D11 | US-Q2-63 | **P1** | 分享静帧 · 关于页 · 全链路联调 | 🚧 待测试 |
| 冒烟提审 | D11～D14 | — | — | RELEASE-SMOKE · 域名 · **07-06 提审** | 🔲 |

### D9～D10 · 64 并行节奏（可与 61/62 分轨）

| 日 | 64 H5 | 小程序侧 |
|----|-------|----------|
| D8 | 脚手架 · Peace 镜 · 静帧导出供 62 封面 | 66 · 61 |
| D9 | Love + Unity 镜 | 62 入口壳 |
| D10 AM | Respect + PLUR 定格 + CTA | 65 web-view 接入 |
| D10 PM | CDN 部署 · 65 联调 · 63 分享封面 | 首进全链路冒烟 |

### 提审全量验收（D11 必过）

- [x] **L3**：55 规范 ✅ · 56 标签发帖 ✅ · 57 申请确认 ✅ · 58 指数 ✅ · 59 PLURR ✅ · 60 Peace 条 ✅
- [x] **L2**：66 分享 bypass · 61 三步 Unity 步 · 跳过/完成 storage（61 ✅；66 最小编排已接；62/64 全链路待联调）
- [ ] **L1**：62 入口 → **65 → 64** 观看 → CTA「去找队」deeplink · fallback 文化页
- [ ] **63**：分享卡片 · 关于页链短片（**代码已合入 · 真机待验收**）
- [ ] 微信 **业务域名**（65）· 合规 grep · 真机低端机 64 可播

### 极端砍 scope（仅 D11 仍缺口时）

1. **US-Q2-55** + **US-Q2-56** + **US-Q2-57** + **US-Q2-66** + **US-Q2-61** + **US-Q2-62**
2. **US-Q2-64 Lite**：Peace + Unity **两镜**（无 BGM · 无无限循环）+ **US-Q2-65** 仍必交付
3. 推迟 59 · 60 · 63 · 58 至提审后 **24h 热修**（需产品签字）

**默认：不启用极端砍 scope。**

---

## 八、Unity 标签词表（US-Q2-56）

发帖可选 **最多 3 个** Chip；用于卡片展示与 AI 找队 filter。

| key | zh-CN | en-US | 说明 |
|-----|-------|-------|------|
| `welcome_newbie` | 欢迎新手 | Welcome newcomers | Love + Unity |
| `women_friendly` | 女生友好 | Women-friendly | Respect |
| `multi_day` | 多日联票 | Multi-day pass | Unity |
| `same_departure` | 同出发地优先 | Same departure city | Unity · 与 departureCity 互补 |
| `pure_rave` | 纯 Rave | Pure rave | 偏好表达 |
| `afterparty_ok` | Afterparty 随缘 | Afterparty optional | 偏好表达 |
| `early_bird` | 早鸟组队 | Early bird team-up | 时间阶段 |
| `budget_friendly` | 预算友好 | Budget-friendly | 与 budget 偏好互补 |

**数据**：`recruitUnityTags: string[]`（Post 扩展字段，见 US-Q2-56 验收标准）。

**种子帖**：运营种子帖（US-Q2-21）带 2～3 个标签，示范用法。

---

## 九、Unity 指数（US-Q2-58）

招募区标题旁 **一行弱展示**（非个人分数）：

> **Unity · 12 条公开招募 · 28 人关注这场**

| 指标 | 数据源 | 说明 |
|------|--------|------|
| 公开招募数 | `activity.recruitPostCount` · 招募墙首屏后与列表 `max` | `resolveUnityRecruitCount` |
| 关注这场 | `activity.attendees`（register 聚合） | 匿名聚合；**非**微信订阅消息人数 |
| （可选 P1.1）准备中 | Festival Plan 至少完成 1 项的用户数 | 需 API 扩展时可 Phase B |

**Dev**：TML mock 招募帖不产 register · `enrichDevUnityAttendees` 仅 dev 抬高关注数展示下限。

**禁止**：「你的 Unity 分 85」、用户排名、匹配度。

---

## 十、文案库（i18n 参考）

### 10.1 合规表述

| 场景 | ✅ 可用 | ❌ 禁止 |
|------|---------|---------|
| 招募墙 | 「12 条公开招募 · 同场 We Are One」 | 「智能匹配 12 位搭子」 |
| 申请 | 「公开回复，一起 Rave」 | 「投递申请，等待队长审核」 |
| 分享 | 「我投了这 3 场 Set，你呢？」 | 「找到你的灵魂队友」 |
| 规范 | 「Respect：不留联系方式，线下见面自行判断风险」 | 「平台保障你的安全」 |
| Respect 确认 | 「我了解这是公开回复，不含联系方式」 | 「同意组队协议」 |

### 10.2 申请加入 Love 模板（US-Q2-57 · 预填可编辑）

```
你好，我也去这场，想一起 Rave。
人数：{headcount} 人 · 出发：{departure} · 时间可配合。
（公开回复，请勿留联系方式）
```

英文：

```
Hi, I'm going too and would love to rave together.
Party size: {headcount} · From: {departure} · Flexible on timing.
(Public reply — no contact info please.)
```

### 10.3 L1 入口壳（US-Q2-62 · 首进可跳过）

```
[Peace 静帧背景]

PLUR
Peace · Love · Unity · Respect

观看 PLUR 短片（约 10s）
跳过，开始使用
了解 PLUR 是什么 → 文字说明页
```

### 10.4 攻略 Peace 条（US-Q2-60）

```
Peace · 大型现场人多，保持平和：不争抢、不推搡，遇摩擦先退让。仅供参考。
```

---

## 十一、PLURR 责任清单项（US-Q2-59）

Festival Plan 折叠区新增 **「PLURR · 行前责任」**（勾选型，非强制，持久化到 activity-scoped `plurResponsibility.storage`）：

| key | zh-CN |
|-----|-------|
| `hydration` | 补水 / 电解质 |
| `tell_someone` | 告知亲友行程 |
| `earplugs_shoes` | 备耳塞、舒适鞋 |
| `exit_plan` | 散场交通方案 |
| `leave_no_trace` | 垃圾随身带走 |
| `look_out` | 照顾同队与身边陌生人（线下） |

与现有三步 `攻略 → 发招募 → 行程` **并列折叠**，不替换 checklist 顺序。

---

## 十二、指标（上线后 4 周内观测）

| 指标 | 目标 / 说明 |
|------|-------------|
| 分享落地被 L1/L2 挡住 | **0%**（硬指标） |
| 首进 30s 内进详情/招募墙 | ≥ 40%（含跳过 PLUR 用户） |
| L2 onboarding 完成任一步 | ≥ 25% |
| Unity 标签 Adoption | 新发招募带 ≥1 标签的比例 |
| Respect 确认完成率 | 申请流程勾选后成功发送率 |
| PLUR 短片完播率 | 观测，不 KPI 考核 |
| 招募 → 公开回复转化 | 与 PLUR 上线前对比 |
| 规范页 UV | 设置 → 社区规范 PLUR 节 |
| PLURR 清单完成率 | 勾选 ≥3 项的用户占比 |
| 违规率 | 含联系方式 / 辱骂评论占比是否下降 |

**不看**：PLUR 分、握手次数排名、个人 Unity 等级。

---

## 十三、工程索引

| 领域 | 文件 / 模块 |
|------|-------------|
| **首进编排** | `useFirstRunOrchestrator.ts`（新）· `useNewUserOnboarding.ts` · `onboardingStorage` · `plurEntryStorage` |
| 社区规范 | `src/legal/community-guidelines.ts` · `src/legal/en/community-guidelines.ts` |
| L1 入口壳 | `PlurEntrySheet.tsx`（新）· `PlurCulturePage.tsx` |
| L1 四镜头 H5 | `h5/plur-film/` · GSAP timeline · `packageProfile/pages/plur-film-webview/`（65） |
| Unity 标签 | `AiBuddyPostSheet` · `buddyPostForm.ts` · `post.schema.ts` · `EventPostCard` |
| 申请模板 | `buildRecruitApplyCommentDraft.ts` · `PostCommentSection` |
| Respect 确认 | `PostCommentSection` · `plurRespectConfirm.storage.ts` |
| Unity 指数 | `event-detail` 招募区 · `GET /activities/:id/stats`（或前端聚合） |
| PLURR 清单 | `plurResponsibilityChecklist.ts` · `plurResponsibility.storage.ts` · `EventDetailPlurrChecklist.tsx` |
| Peace 攻略条 | `TravelGuidePeaceBanner.tsx` · `shouldShowPeaceBanner.ts` · `useAiTravelGuidePage` |
| L2 引导 | `NewUserOnboardingSheet` · `useNewUserOnboarding.ts` |
| 分享文案 | `personalityWechatShare.util.ts` · `setVoteWechatShare.util.ts` · `plurShareImage.util.ts` |
| 关于页 | `AboutSettings.tsx` · `settings?section=about` · `aboutPageVersion.util.ts` |
| i18n | `src/i18n/messages/zh-CN.ts` · `en-US.ts` · `plur.*` · `onboarding.*` |

**提审前 grep**

```bash
rg '联系队友|配对成功|平台担保|智能配对|buddy-matching|PLUR分|Unity分|匹配度' src/
```

应无新增命中。

---

## 十四、版本记录

| 日期 | 变更 |
|------|------|
| 2026-06-25 | 初版：四核释义、Story 映射、词表、文案库、排期 |
| 2026-06-26 | UX 终版：L1/L2/L3 三层 · 首进编排链（66）· 四镜头 H5（64/65）· 62 改为入口壳 · 61 三步改版 |
| 2026-06-26 | **全量提审**：55～66 全部纳入 07-06 前提审包；64/65 从 Sprint 6 前移至 D9～D11 |
| 2026-06-26 | **US-Q2-55·56 验收**：社区规范 PLUR 四核（`LEGAL_CONSENT_VERSION` 2026-06-26.1）· 招募帖 Unity 标签全栈 · 种子帖 `db:seed-ops-buddy-posts` |
| 2026-06-26 | **US-Q2-57·58 验收**：申请 Love 预填模板 + Respect 勾选（`plurRespectConfirm.storage`）· 活动详情 Unity 指数（`EventDetailUnityIndex` · `resolveUnityRecruitCount`）；dev TML mock 场 `enrichDevUnityAttendees` 抬高关注数展示 |
| 2026-06-26 | **US-Q2-59·60 验收**：Festival Plan PLURR 行前责任清单（`EventDetailPlurrChecklist` · activity-scoped storage）· 出行攻略 Peace 提示条（`TravelGuidePeaceBanner` · session dismiss）· zh/en i18n |
| 2026-06-26 | **US-Q2-63 开发收口**：Set/人格分享 Love·Unity 标题 · Peace 静帧 `imageUrl` · 关于 SYNC（精神说明 · 阅读说明 · 条件短片 · 版本号含开发版回退）· **🚧 待真机验收** |
