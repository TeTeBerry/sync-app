# wxa-skills-generate 试验报告

> 日期：2026-06-30  
> 官方仓库：[wechat-miniprogram/ai-mode-skills](https://github.com/wechat-miniprogram/ai-mode-skills)

## 做了什么

按 [wxa-skills-generate/SKILL.md](../../tools/ai-mode-skills/wxa-skills-generate/SKILL.md) 执行了**缩小版** generate 流程（未用 Cursor 安装官方 skill 包，由 Agent 按同一契约手跑阶段 0–5）：

| 阶段 | 产出 |
|------|------|
| 0 业务澄清 | `.ai-mode-skills/scope.json` |
| 1–3 扫描/合并 | `.ai-mode-skills/merged-result.json`（跳过 probe：契约已由 `agent-capabilities` 确定） |
| 4 接口设计 | 与现网 `mcp.json` 三接口一致 |
| 5 代码生成 | `tools/generate-trial/skills/festival-search-skill/` |
| 6 配置集成 | **未做**（试验产物不写入 `app.config.ts`） |

## 生成物路径

```
tools/generate-trial/skills/festival-search-skill/
├── SKILL.md              # 官方五段式路由说明
├── mcp.json
├── index.js
├── utils/util.js         # successResult / errorResult
├── utils/request.js      # agent-capabilities 请求（SYNC 适配）
├── apis/*.js             # 含 [ai-mode] 日志
└── components/event-card # 横版卡片 + api/call 上行
```

## 与现网 `packageAgentSkills/` 的差异（generate 教会我们的）

| 项 | 手写现网 | generate 试验版 |
|----|----------|-----------------|
| **SKILL.md** | 自定义章节 + apiName | 官方五段式（触发原话 / 不适用 / 前置 / 顺序） |
| **utils 分层** | `shared/callAgentCapability` | skill 内 `utils/util.js` + `utils/request.js` |
| **组件点击** | `wx.navigateTo` 进详情 | `sendFollowUpMessage` + `api/call` 调 `getEvent` / `getLineup`（[官方推荐](https://github.com/wechat-miniprogram/ai-mode-skills/blob/master/wxa-skills-generate/references/COMPONENT_TEMPLATES.md)） |
| **卡片布局** | 竖版 16:9 大图 | 横版，迁移自 `EventCard.scss` |
| **接口日志** | 部分 | 入口/出口统一 `[ai-mode]` |

## probe（automator）为何跳过

官方 generate 在 T1–T6 或接口不确定时会跑 `scripts/probe.mjs` 抓 `wx.request`。  
SYNC 的原子接口**不直连业务 URL**，而是固定走 `/api/agent-capabilities/*`，契约在 `@sync/agent-capabilities-contracts` 与 OpenAPI 中已定义，probe 对 Taro 编译产物价值有限（且需额外安装 `miniprogram-automator`）。

若要对**主包页面**抓真实 `wx.request`（例如未来直连 posts API 的 skill），可按官方文档：

```bash
cd tools/ai-mode-skills/wxa-skills-generate/scripts
npm install miniprogram-automator
node probe.mjs --project /path/to/sync-app --plan .ai-mode-skills/probe/plan.json
```

前置：Nightly 已登录 + 服务端口开启。

## 如何完整跑官方 generate（推荐给你本地试）

1. 从 [SkillHub](https://developers.weixin.qq.com/miniprogram/dev/ai/debugging.html#三、开发辅助) 或 GitHub 安装 **wxa-skills-generate** 到 Cursor Skills
2. 提示词示例：

```
使用 wxa-skills-generate，分析 /Users/berry/sync/sync-app：
仅生成「公开招募检索」recruit-discovery-skill，输出到 tools/generate-trial/skills/；
原子接口必须 POST/GET /api/agent-capabilities/*，禁止 publish；
完成后交棒 wxa-skills-validate 校验仓库根目录。
```

3. `npm run validate:wechat-ai`

## 是否合并到现网？

**已合并**（2026-06-30）。择优并入 `packageAgentSkills/`，未整包替换试验目录：

| 项 | 现网状态 |
|----|----------|
| **SKILL.md** | 四个 skill 均已改为官方五段式（能力域定位 / 触发场景 / 不适用 / 前置 / 顺序） |
| **组件交互** | `event-card` 横版布局 + `api/call`（`getEvent` / `getLineup`）；`recruit-list-card` / `draft-candidates-card` / `prep-status-card` 用 `openDetailPage` 替代 `wx.navigateTo` |
| **共享辅助** | `shared/componentModelContext.js` 新增 `sendApiCall` / `openDetailPage` / `sendTextFollowUp` |
| **接口日志** | 七个 `apis/*.js` 统一 `[ai-mode]` 入口/出口/失败日志 |
| **request 分层** | 仍用 `shared/callAgentCapability.js`，未拆入各 skill 的 `utils/` |

试验目录 `tools/generate-trial/` 仅作对照，默认不接入 `WECHAT_AI_SKILLS=1` 构建。详见 [SKILL-SKELETON.md](./SKILL-SKELETON.md)。
