# 微信小程序 E2E（miniprogram-automator）

基于[微信官方 automator](https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/) + Jest，覆盖 `docs/RELEASE-SMOKE.md` 中的 Tab / 活动详情路径。

## 目录

```
e2e/
  jest.config.cjs          # Jest 配置（与 Vitest 单元测试分离）
  README.md
  miniprogram/
    helpers/
      env.cjs              # 项目路径、CLI、RUN_E2E 开关
      launch.cjs           # automator.launch 封装
      wait.cjs             # 等待工具
      setup.cjs            # Jest 全局超时
      describe-e2e.cjs     # 未设 RUN_E2E 时 describe.skip
    release-smoke.spec.cjs # Tab + 活动详情（单次 launch，对齐 RELEASE-SMOKE）
```

## 前置条件

1. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)（稳定版 ≥ 1.02.1906042）。
2. 开发者工具 → **设置 → 安全设置** → 开启 **服务端口**（CLI / HTTP 调用）。
3. 本机已 `npm run build:weapp`（或 `test:e2e` 会自动执行 `ensure-weapp-dist`）。
4. （推荐）后端已启动，且 `sync-app/.env.local` 中 `TARO_APP_API_BASE_URL` 指向可访问的 API（活动列表用例需要数据）。

## 运行

```bash
cd sync-app

# 先编译小程序（test:e2e 会自动检查 dist-weapp）
npm run build:weapp

# 执行 E2E（必须显式开启，避免 CI/本地误跑）
RUN_E2E=1 npm run test:e2e
```

### 环境变量

| 变量 | 说明 |
|------|------|
| `RUN_E2E=1` | **必填**，否则全部 spec 被 `describe.skip` |
| `WECHAT_CLI_PATH` | 开发者工具 `cli` 绝对路径（macOS 默认自动探测） |
| `E2E_PROJECT_PATH` | 含 `project.config.json` 的目录，默认 `sync-app` 根目录 |
| `E2E_ACTIVITY_ID` | 活动详情直链用 legacyId，默认 `4`（风暴电音节） |
| `E2E_AUTO_PORT` | 已手动 `cli auto --auto-port` 时的 WebSocket 端口 |
| `E2E_LAUNCH_TIMEOUT_MS` | launch 超时，默认 `120000` |

### 手动连接开发者工具（可选）

若 `automator.launch` 连不上，可先启动自动化端口再跑测试：

```bash
# macOS 示例
/Applications/wechatwebdevtools.app/Contents/MacOS/cli auto \
  --project /path/to/sync-app \
  --auto-port 9420

E2E_AUTO_PORT=9420 RUN_E2E=1 npm run test:e2e
```

## 与单元测试的关系

| 命令 | 框架 | 范围 |
|------|------|------|
| `npm test` | Vitest | `src/**/*.test.ts` 纯逻辑 |
| `npm run test:e2e` | Jest + automator | 真机模拟器 UI |

后端 REST 冒烟：`cd sync-app-backend && npm run smoke:api`（见 `docs/RELEASE-SMOKE.md`）。
