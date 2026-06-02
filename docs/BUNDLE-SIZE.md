# 微信小程序包体

主发布端：`npm run build:weapp` → `dist-weapp/`。

## 测量

```bash
npm run build:weapp:size
```

构建后按分包输出大小，超过软阈值则非零退出（见 `scripts/size-weapp.mjs`）。

## 静态检查（无需构建）

```bash
npm run verify:bundle
```

- 禁止在 `src/components/icons` 之外 `import 'lucide-react-taro'`（统一走 `@/components/icons`）
- 禁止主包 Tab 相关目录 import 地图绘制、行程壁纸、分包页面实现等重模块

已并入 `npm run check`。

## 阈值（`scripts/size-weapp.mjs`）

| 项 | 软阈值 |
|----|--------|
| 主包 | 1100 KB |
| 各分包 | 2000 KB |
| 合计（不含 .map） | 4500 KB |

上传时在 `project.config.json` → `packOptions.ignore` 排除 `*.map`。

## 微信「代码质量」扫描

| 项 | 要求 | 本项目 |
|----|------|--------|
| 组件按需注入 | `lazyCodeLoading: "requiredComponents"` | `src/app.config.ts` |
| 主包图片+音频 | ≤ 200 KB | `npm run size:weapp` 会校验 |

若扫描仍报主包图片超限，多为 **`dist-weapp/assets` 旧构建残留**（历史本地图未再引用）。处理：`npm run clean:weapp && npm run build:weapp` 后在开发者工具点「重新扫描」。

## 治理约定

| 主题 | 约定 |
|------|------|
| 图标 | 仅从 `@/components/icons` 引入；新增图标时在 `components/icons/index.ts` 登记 |
| Canvas | 壁纸/攻略用 `@/utils/offscreenCanvas`；地图页用 `components/event-map/*`（留在 event 分包） |
| 分包 | 地图 / 独家行程 / 我的行程页面逻辑放在 `packageEvent/pages/*`，勿被主包 `pages/*` 直接 import |
| 活动图资源 | `packageEvent/assets/`（如 storm-logo），勿打进主包 `assets/` |

`config/index.ts` 已开启 `usedExports` + `sideEffects` 以利于 tree-shaking。

## CI

`sync-app/.github/workflows/ci.yml`：`check` job 后执行 `npm run build:weapp:size`。

## 基线

| 日期 | 主包 | packageEvent | packageAi | packageProfile | 主包 assets |
|------|------|--------------|-----------|----------------|-------------|
| 2026-06-01 P0 CI | ~971 KB | ~167 KB | ~71 KB | ~40 KB | ~389 KB |
| 2026-06-01 包体优化后参考 | ~582 KB | ~267 KB | ~73 KB | ~41 KB | 0 |

PR 若主包上涨 >50 KB，请在 PR 说明原因并更新上表（可选）。
