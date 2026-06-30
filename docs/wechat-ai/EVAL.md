# 微信 AI · 对话评测（wxa-skills-eval）

用官方 **wxa-skills-eval** 自动构造用户任务，模拟与小程序 Agent 的多轮对话，评测意图命中、调用链路与回复质量。

> 官方文档：[评测指南](https://developers.weixin.qq.com/miniprogram/dev/ai/evaluation-guide) · [ai-mode-skills/wxa-skills-eval](https://github.com/wechat-miniprogram/ai-mode-skills/tree/master/wxa-skills-eval)

## 前置条件

| 项 | 说明 |
|---|---|
| **构建** | `npm run build:weapp:ai` |
| **开发者工具** | Nightly，基础库 3.16.1，编译模式「小程序 AI 编译」 |
| **服务端口** | 工具 → 设置 → 安全设置 → **开启服务端口** |
| **LLM** | 自备 OpenAI 兼容 API（评测与模拟用户均消耗 token） |
| **后端** | 本地或联调环境需可访问 `/api/agent-capabilities/*` |

## 1. 首次安装

首次执行 `npm run eval:wechat-ai` 会：

1. 浅克隆 `tools/ai-mode-skills/`（与 validate 同源，已在 `.gitignore`）
2. 从 `.env.example` 生成 `tools/ai-mode-skills/wxa-skills-eval/.env`

编辑以下**任一**文件，填入三项必填：

```bash
# 方式 A：仓库根目录 .env（与 Taro 环境变量放一起，推荐）
# 方式 B：tools/ai-mode-skills/wxa-skills-eval/.env

WXA_SKILL_EVAL_LLM_BASE_URL=https://api.openai.com/v1
WXA_SKILL_EVAL_LLM_API_KEY=sk-...
WXA_SKILL_EVAL_LLM_MODEL=gpt-4o
```

`WXA_SKILL_EVAL_*` 行**不要在同一行写 `#` 注释**（官方 eval 会把注释拼进 URL）；需要说明请单独起一行。

可选：新版开发者工具会自动探测 `wechatidecli`；旧版可取消注释 `DEVTOOLS_ENV_APP_PATH`。

## 2. 运行评测

```bash
npm run build:weapp:ai
npm run eval:wechat-ai
```

默认行为：

- 项目路径：仓库根目录（`miniprogramRoot: dist-weapp/`）
- 参与 skill：`festival-search`、`recruit-discovery`、`recruit-draft`、`festival-prep`
- case 数：`3`（正式回归建议每 skill ≥ 30）

启动后会打开 Web UI（默认 `http://localhost:3200`），跑完可在页面或产物目录查看 `eval_report.html`。

### 仅开 Web UI（手动点跑）

```bash
npm run eval:wechat-ai:serve
```

`serve` 会**自动**写入 `DEVTOOLS_ENV_SKIP_AUTO_LAUNCH=1`，复用你已手动打开的开发者工具，不会再弹第二个窗口。请先：

1. 手动打开 Nightly，导入**仓库根目录**（含 `miniprogramRoot: dist-weapp/`）
2. 编译模式选 **「小程序 AI 编译」**，开启 **服务端口**
3. 再执行 `npm run eval:wechat-ai:serve`，在 Web UI（默认 `http://localhost:3200`）里发起评测

若 `npm run eval:wechat-ai`（非 serve）也想复用已打开的工具，在根目录 `.env` 加 `DEVTOOLS_ENV_SKIP_AUTO_LAUNCH=1`。

### 传参示例

```bash
# 只测活动检索，5 条 case
npm run eval:wechat-ai -- --skills festival-search --cases 5

# 自定义对话场景（跳过自动探索）
npm run eval:wechat-ai -- --custom-testcases docs/wechat-ai/eval-cases.sample.json

# CI / 无界面
npm run eval:wechat-ai -- --headless --cases 1
```

产物目录：`tools/ai-mode-skills/wxa-skills-eval/data/runs/<runId>/`。

## 3. 与 validate 的区别

| 命令 | 作用 |
|---|---|
| `npm run validate:wechat-ai` | 静态规则 + 编译，**不**模拟对话 |
| `npm run eval:wechat-ai` | LLM 扮演用户，**多轮对话** + 质量报告 |

## 4. 常见问题

| 现象 | 排查 |
|---|---|
| `AI_MODEL_NOT_FOUND` / LLM 404 | 检查 `BASE_URL` 行尾是否误带了 `# 注释`；`hy3-preview` 须在 CloudBase 控制台已开通；脚本会写入 `cli-agent-run/eval-llm.env` 去注释副本 |
| `agent compile mode is disabled` | 开发者工具须切到 **「小程序 AI 编译」** + 基础库 **3.16.1**；公众平台开通 AI「开发模式」；见下方专节 |
| `entity_pool` / LLM 本地超时 60000ms | CloudBase `hy3-preview` 摘要较慢；在 `.env` 或 `eval-llm.env` 设 `WXA_SKILL_EVAL_LLM_TIMEOUT=180`（秒），续跑 `--from entity_pool` |

### `agent compile mode is disabled` 处理步骤

评测 `explore` / `gen_trajectory` 会通过 DevTools **execute** 调原子接口；若工具处于普通「小程序编译」，一律返回该错误。

1. 安装并打开 **[开发者工具 Nightly](https://developers.weixin.qq.com/miniprogram/dev/devtools/nightly.html)**（不要用稳定版凑合）
2. 打开项目：`/Users/berry/sync/sync-app`（推荐，含 `miniprogramRoot: dist-weapp/`）或 `dist-weapp/`
3. 顶部 **编译模式** 下拉 → 选 **「小程序 AI 编译」**（若没有此项：到 [公众平台 → 基础功能 → AI 能力](https://mp.weixin.qq.com/) 申请「开发模式」，重新登录工具）
4. **调试基础库** 切到 **3.16.1**（可先切别的版本再切回，触发资源下载）
5. **设置 → 安全设置 → 开启服务端口**
6. 左侧进入 **原子接口**，手动跑 `searchFestivals` + `{ "query": "EDC Korea" }`，确认不再报 `agent compile mode is disabled`
7. 再跑评测；`serve` 已默认 `SKIP_AUTO_LAUNCH`；`run` 可在根目录 `.env` 加 `DEVTOOLS_ENV_SKIP_AUTO_LAUNCH=1`

`npm run build:weapp:ai` 后 `app.json` 里已有 `agent.skills`；缺的是 **DevTools 编译模式**，不是代码。

### `CLI_INNER_TIMEOUT` / `Executing agent atomic tool` ✖

DevTools CLI 在默认 **20s** 内没跑完原子工具（冷启动、首次编译常见）。

1. **先手动打开** Nightly，切 **小程序 AI 编译**，打开 `/Users/berry/sync/sync-app`
2. 在模拟器里 **点一次编译/刷新**，等主包加载完（可选，现已支持 develop 下 API 兜底）
3. `cli-agent-run/eval-llm.env` 增加（评测脚本也会默认写入 60/90/30）：
   ```bash
   DEVTOOLS_ENV_SKIP_AUTO_LAUNCH=1
   DEVTOOLS_ENV_CALL_TOOL_TIMEOUT=60
   DEVTOOLS_ENV_CHAT_TIMEOUT=90
   DEVTOOLS_ENV_LAUNCH_TIMEOUT=30
   ```
4. 重跑 eval；`ReferenceError: t0 is not defined` 是 eval 0.1.18 处理超时时的次生 bug，根因仍是 CLI 超时

### `API 未配置，请进入小程序重试`

eval 的 `execute` **不会走主包 `onLaunch`**，storage 里没有 `sync_api_base`。

- **已修复**：`callAgentCapability.js` 在 `envVersion === develop` 时兜底 `http://127.0.0.1:3000/api`（需 `npm run build:weapp:ai` 重建）
- 手测：DevTools 控制台执行 `wx.getStorageSync('sync_api_base')` 或直接在 **原子接口** 页再跑 `searchFestivals`
- 确保 **sync-app-backend dev** 在 `:3000` 运行
| 连不上 DevTools | 开启服务端口；或 `export WECHAT_DEVTOOLS_CLI=.../cli` |
| `agent.skills` 为空 | 先 `build:weapp:ai`；确认根目录 `app.json` 链接逻辑正常 |
| 对话里接口 401 | 小程序内需登录；公开检索接口应免登录 |

## 参考

- [OFFICIAL-TOOLCHAIN.md](./OFFICIAL-TOOLCHAIN.md)
- [VALIDATION.md](./VALIDATION.md) — 静态校验与 DevTools「对话流程」手测
- [eval-cases.sample.json](./eval-cases.sample.json) — 自定义评测集样例
