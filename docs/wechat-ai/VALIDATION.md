# 微信 AI · SKILL 校验与调试

对照 [微信调试指南 · 开发辅助](https://developers.weixin.qq.com/miniprogram/dev/ai/debugging.html#三、开发辅助) 与官方工具集 [wechat-miniprogram/ai-mode-skills](https://github.com/wechat-miniprogram/ai-mode-skills)。

## 前置条件

| 项 | 说明 |
|---|---|
| **开发者工具** | [Nightly](https://developers.weixin.qq.com/miniprogram/dev/devtools/nightly.html)，基础库 **3.16.1** |
| **编译模式** | 切换到「**小程序 AI 编译**」 |
| **AI 能力** | 公众平台已开通「开发模式」 |
| **服务端口** | 工具 → 设置 → 安全设置 → **开启服务端口**（跑真机 execute/render 必填） |
| **构建产物** | `npm run build:weapp:ai` 或 `npm run dev:weapp:ai` |

## 1. 静态 + 编译校验（wxa-skills-validate）

项目已封装脚本，首次运行会自动浅克隆官方 `wxa-skills-validate` 到 `tools/ai-mode-skills/`：

```bash
npm run build:weapp:ai   # 若 dist-weapp 尚未生成（含 materialize-wechat-ai-config）
npm run validate:wechat-ai
```

构建前会自动执行 `scripts/materialize-wechat-ai-config.mjs`，将 `.env` 中 `TARO_APP_SUBSCRIBE_TMPL_ACTIVITY_UPDATE` 写入 `packageAgentSkills/shared/wechatAiBuildConfig.json`。

脚本会先 `build:weapp:ai`，再从**仓库根目录**调用微信 CLI（`miniprogramRoot: dist-weapp/`）。不要对 `dist-weapp` 直接 `cli preview`，会报 `app.json not found`。

- 通过判据：仓库根目录 `cli-agent-run/validate-report.json` 中 `summary.errors === 0` 且 `summary.buildStatus === "pass"`
- CLI 路径（可选）：`export WECHAT_DEVTOOLS_CLI=/Applications/wechatwebdevtools.app/Contents/MacOS/cli`
- 规则 V001~V016 详见官方 [VALIDATE_RULES.md](https://github.com/wechat-miniprogram/ai-mode-skills/blob/master/wxa-skills-validate/references/VALIDATE_RULES.md)

### 本仓库已对齐的要点

- `mcp.json`：`inputSchema` / `outputSchema` / `_meta.ui.componentPath` / `components[].relatedPage`（以 `/` 开头）
- 原子组件四件套：`index.js` + `index.json` + `index.wxml` + **`index.wxss`**
- `index.js`：`createSkill` + `registerAPI(fn)` 注册**函数**而非模块
- 分包：`packageAgentSkills` + `independent: true` + `lazyCodeLoading: requiredComponents`
- 原子接口 HTTP：经 `packageAgentSkills/shared/callAgentCapability.js`，**不** `getApp()` 依赖主包（用 `sync_api_base` storage）

## 2. 开发者工具内调试

参考 [调试指南 §一](https://developers.weixin.qq.com/miniprogram/dev/ai/debugging.html#一、使用开发者工具)：

1. 打开 `dist-weapp` 项目目录
2. **原子接口** 页：先测 `searchFestivals`，入参 `{ "query": "EDC Korea" }`
3. **原子组件** 页：检查卡片渲染与 `relatedPage` 跳转
4. **对话流程** 页：端到端意图；右上角 **观测平台** 可看 Trace / LLM 重放

## 3. 官方 Coding Agent Skills（可选）

在 Cursor / Claude Code 等支持 Skills 的环境可安装官方三件套：

| Skill | 用途 |
|---|---|
| [wxa-skills-generate](https://github.com/wechat-miniprogram/ai-mode-skills/tree/master/wxa-skills-generate) | 从业务源码生成原子接口/组件 |
| [wxa-skills-validate](https://github.com/wechat-miniprogram/ai-mode-skills/tree/master/wxa-skills-validate) | 静态 → execute → render → DELIVERY.md |
| [wxa-skills-eval](https://github.com/wechat-miniprogram/ai-mode-skills/tree/master/wxa-skills-eval) | 对话效果评测报告 → [EVAL.md](./EVAL.md)：`npm run eval:wechat-ai` |

对本项目校验时，告知 Agent（**项目根目录**，非 `dist-weapp`）：

```
使用 wxa-skills-validate 校验 /Users/berry/sync/sync-app
```

或本地：`npm run validate:wechat-ai`。完整对照见 [OFFICIAL-TOOLCHAIN.md](./OFFICIAL-TOOLCHAIN.md)。

## 4. 常见问题

| 现象 | 排查 |
|---|---|
| 原子接口 tab 黑屏 | `mcp.json` 格式非法；检查 DevTools 控制台 |
| `module ... is not defined` | `index.js` 未解构注册函数；或分包未 `independent` |
| `operateWXData:fail invalid scope` | 开发模式权限 / 未登录；先测原子接口 |
| API 401 | 写操作经 `callAgentCapability` 自动 `wx.login`；token 键为 `sync_access_token` |
| `API 未配置` | 先 `build:weapp:ai`（develop 环境已兜底 `127.0.0.1:3000/api`）；或手动打开主包一次 / 控制台 `wx.setStorageSync('sync_api_base', 'http://127.0.0.1:3000/api')` |

## 参考

- [接入方式](https://developers.weixin.qq.com/miniprogram/dev/ai/integration.html)
- [SKILL-SKELETON.md](./SKILL-SKELETON.md)
- [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)
- [CHECKLIST.md](./CHECKLIST.md)
