# 微信 AI · 官方工具链对照（ai-mode-skills）

> 官方仓库：[wechat-miniprogram/ai-mode-skills](https://github.com/wechat-miniprogram/ai-mode-skills)  
> 调试指南：[开发辅助 · SkillHub](https://developers.weixin.qq.com/miniprogram/dev/ai/debugging.html#三、开发辅助)

官方推荐工作流：

```
小程序源码 ──▶ wxa-skills-generate ──▶ skills/ ──▶ wxa-skills-validate ──▶ 真机/渲染 ──▶ wxa-skills-eval ──▶ 评测报告
```

本仓库（Taro + 独立后端）在**同一规范**下做了路径与架构适配，见下表。

## 三件套与本仓库

| 官方 Skill | 作用 | 本仓库状态 |
|------------|------|------------|
| [wxa-skills-generate](https://github.com/wechat-miniprogram/ai-mode-skills/tree/master/wxa-skills-generate) | 从页面/接口源码**生成**原子接口 + 组件 + `mcp.json` | **已试跑**：见 [GENERATE-TRIAL.md](./GENERATE-TRIAL.md)（`tools/generate-trial/`，未替换现网） |
| [wxa-skills-validate](https://github.com/wechat-miniprogram/ai-mode-skills/tree/master/wxa-skills-validate) | V001~V016 静态校验 + CLI compile + execute/render | **已接入**：`npm run validate:wechat-ai`（浅克隆至 `tools/ai-mode-skills/`） |
| [wxa-skills-eval](https://github.com/wechat-miniprogram/ai-mode-skills/tree/master/wxa-skills-eval) | 对话意图 / 轨迹 / 答案质量评测 | **已接入**：`npm run eval:wechat-ai`（见 [EVAL.md](./EVAL.md)） |

## 目录与命名对照

| 官方约定 | 本仓库 | 说明 |
|----------|--------|------|
| `skills/{name}/` | `packageAgentSkills/{name}-skill/` | Taro 通过 webpack 拷贝进 `dist-weapp/packageAgentSkills/` |
| `skills/_shared/` | `packageAgentSkills/shared/` | 分包内公共模块（`callAgentCapability`、`componentModelContext`） |
| `app.json` `agent.skills[].path` | `src/app.config.ts`（`WECHAT_AI_SKILLS=1`） | 构建时写入 `dist-weapp/app.json` |
| 独立分包 `skills` + `independent: true` | `packageAgentSkills` + `independent: true` | 一致 |
| 原子接口 → `wx.request` 业务 API | 原子接口 → `/api/agent-capabilities/*` | 后端 `AgentCapabilitiesService` 门面，契约见 `@sync/agent-capabilities-contracts` |

## 已对齐的官方规范（手写实现）

以下与 [COMPONENT_TEMPLATES.md](https://github.com/wechat-miniprogram/ai-mode-skills/blob/master/wxa-skills-generate/references/COMPONENT_TEMPLATES.md) / [VALIDATE_RULES.md](https://github.com/wechat-miniprogram/ai-mode-skills/blob/master/wxa-skills-validate/references/VALIDATE_RULES.md) 一致：

- `mcp.json`：`inputSchema` / `outputSchema` / `_meta.ui.componentPath` / `components[].relatedPage`（`/` 开头）
- `index.js`：`createSkill` + `registerAPI(函数)`
- 组件四件套 + `NotificationType.Result` → `setData`（`shared/componentModelContext.js`）
- `NotificationType.Overflow` 监听 + `[ai-mode]` 日志
- 禁止 `getApp()`；配置走 `sync_api_base` storage
- `lazyCodeLoading: requiredComponents`（AI 构建开启）

## 本仓库命令速查

```bash
# 构建 AI 包
npm run build:weapp:ai

# 官方 validate（静态 + 编译 preview）
npm run validate:wechat-ai
# 报告：cli-agent-run/validate-report.json

# DevTools：编译模式选「小程序 AI 编译」，基础库 3.16.1，服务端口开启
```

校验时项目路径为**仓库根目录**（`miniprogramRoot: dist-weapp/`），不要对 `dist-weapp` 单独 `cli preview`。

## 何时用 generate（官方建议）

适合：

- 新增一块**尚未手写**的业务（例如「活动阵容投票」「心愿单分享」）
- 从 `src/packageEvent/pages/event-detail` 等页面**对照源码**补组件样式（`STYLE_MIGRATION.md`）

不适合一次性覆盖现有只读 skill（会与 `AgentCapabilitiesService`、合规文案冲突）。

在 Cursor 中安装 [wxa-skills-generate/SKILL.md](https://github.com/wechat-miniprogram/ai-mode-skills/blob/master/wxa-skills-generate/SKILL.md) 后示例提示：

```
使用 wxa-skills-generate，基于 sync-app 源码，仅生成「活动详情公开招募墙」对应的 recruit-discovery 扩展；
技能目录放在 packageAgentSkills/，原子接口必须调用已有 /api/agent-capabilities/*，不要新建 publish 接口。
生成后交棒 wxa-skills-validate。
```

## 何时用 eval

对话表现不稳定（漏调接口、卡片不展示、话术不合规）时，用 **wxa-skills-eval** 自动模拟用户多轮对话。详见 [EVAL.md](./EVAL.md)。

```bash
npm run build:weapp:ai
# 首次：编辑 tools/ai-mode-skills/wxa-skills-eval/.env 填入 LLM
npm run eval:wechat-ai          # 默认 3 case，只读 skill：festival-search,recruit-discovery
npm run eval:wechat-ai:serve    # 仅开 Web UI，手动配置后发起
```

## 与官方的差异（有意保留）

| 项 | 原因 |
|----|------|
| 接口不直接 `wx.request` 业务 URL | 统一走后端门面，便于鉴权、限流、合规 |
| `SKILL.md` 偏路由说明，非 generate 五段模板 | 与 `AGENTS.md` / 产品合规一致，可逐步改成官方五段式 |
| eval 需自备 LLM API | 微信不代付；在 `wxa-skills-eval/.env` 配置 OpenAI 兼容端点 |

## 参考

- [GENERATE-TRIAL.md](./GENERATE-TRIAL.md) — wxa-skills-generate 试验报告
- [VALIDATION.md](./VALIDATION.md) — 校验与排错
- [SKILL-SKELETON.md](./SKILL-SKELETON.md) — 目录骨架
- [CHECKLIST.md](./CHECKLIST.md) — 提审与内测清单
