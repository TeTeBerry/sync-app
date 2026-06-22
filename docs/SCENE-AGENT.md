# Scene Agent · 无感 AI 产品说明

> **定位**：不用线性对话 Tab，把 Agent 能力嵌进用户正在做的场景（找队、发帖、看阵容、观演准备）。  
> **原则**：单次任务、结构化输出、用户可改可拒；合规表述为 **检索 / 生成 / 预填**，非配对撮合。  
> **关联**：[Q2-USER-STORIES.md](./Q2-USER-STORIES.md)（US-Q2-31～34）· [PRODUCT.md](./PRODUCT.md) · 后端 [orchestration/README.md](../sync-app-backend/src/ai/orchestration/README.md)

**最后更新**：2026-06-22

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
| `trigger` | `search` · `chip` · `sheet_submit` · `page_enter` |

**时间线原则**：专属时间表通常临近开场才可用；公开组队可在**官宣前**进行。Scene Run 在 `festivalPlan.itinerary` 为空时，应优先使用 `personalityType` / `prefs.favorGenres` 作为找队排序与预填信号，**不要求**用户先完成行程。详见 [PRODUCT.md §2.5](./PRODUCT.md#25-festival-plan观演准备--降优先级)。

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
| `recruit_compose` | 发帖 Sheet | 「AI 帮写」 | LLM 候选文案 | **Q2-28** |
| `recruit_flip` | 翻招募卡页 | 翻卡 | 帖池加权 shuffle | **Q2-29** |
| `guide_to_recruit` | 攻略完成 | CTA | `travelGuideFormToBuddyPrefill` | **Q2-30** |
| `personality_next` | 人格结果 / 分享落地 | 主 CTA · 测完提交 | 偏好同步 + 路由至有种子的招募墙 | **Q2-17** · **Q2-18** |
| `lineup_dj` | 活动详情阵容 | 点 DJ | `query_dj_info` | **Q2-33** |
| `prep_nudge` | 观演准备折叠区 | 进详情 | 分阶段规则（阵容是否官宣 · 偏好 · 招募进度）；可选 LLM | **Q2-34** |
| `recruit_filters` | 招募墙 | 进入 / 有偏好 | 动态 Chip | **Q2-32** |

**不做**：全站聊天、跨活动匹配队友、首页招募信息流 Agent。

---

## 四、与现网 API 的关系

| 现网 | Scene 演进 |
|------|------------|
| `POST /posts/ai-search` | 首期保留；**Q2-31** 可包一层 `scene=recruit_search` |
| `POST …/travel-guide/generate` | 长任务独立 REST + 进度，不塞进 scene-run |
| WS `client_action` | 前端已无消费者；改为 REST `effects.open_sheet` |
| `ReadOnlyTurnHandler` | 阵容/演出表等 **规则快路径**，能不调 LLM 就不调 |

### 建议 API（上线后实现）

`POST /api/ai/scene-run`

- 请求：`scene` · `intent` · `activityLegacyId?` · `input` · `context?`
- 响应：`effects[]` · `disclaimer?`

上线包 **不阻塞** 于该 API：可用现有 REST + 前端 effect 映射先行（见 Q2 Sprint 5）。

---

## 五、分阶段信号与 Scene 优先级

公开组队与观演准备**不同步**。Prep Nudge / 找队相关 Scene 按下列优先级取信号（均只影响公开帖检索排序或预填，非配对）：

| 用户阶段 | 典型 nudge / effect | 主要信号 |
|----------|---------------------|----------|
| 官宣前 · 未测人格 | 「去招募墙看看公开招募」 | 无偏好，关键词检索 |
| 官宣前 · 已测人格 | 「已参考你的 Techno 偏好，去看看公开招募」 | `personalityType` → `favorGenres` |
| 官宣前 · 未发招募 | 「还差：发一条公开招募」 | `festivalPlan.buddy_post` |
| 有攻略 · 未找队 | 搜索框 `prefill_query`（出发地/人数） | 攻略表单槽位（`guide_to_recruit`） |
| 阵容未官宣 | 行程项弱化或提示订阅；**不阻塞**找队 | `lineupPublished=false` |
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
| **Sprint 6** | 上线后 2～4 周 | **Q2-31** scene-run · **Q2-32** 动态 Chip · **Q2-33** DJ 卡片 |
| **Sprint 7** | 有互动数据后 | **Q2-17/29/28/30** 人格/翻卡/AI 发帖/攻略串联 |

---

## 八、代码索引

| 层 | 路径 |
|----|------|
| Agent 工具 | `sync-app-backend/src/ai/agent/tools/` |
| 编排 | `sync-app-backend/src/ai/orchestration/` |
| AI 找队 | `post-search.service.ts` · `buddy-post-search.util.ts` |
| 前端搜索 | `useEventDetailPostSearch.ts` |
| 原 client_action 类型 | `shared/chat/client-action.types.ts` |
| 用户偏好 | `BuddyPreferencesSettings.tsx` · `user-profile-sync.service.ts` |
