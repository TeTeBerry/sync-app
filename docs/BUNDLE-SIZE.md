# 微信小程序包体

主发布端：`npm run build:weapp` → `dist-weapp/`。微信开发者工具导入 **仓库根目录**（`project.config.json` 的 `miniprogramRoot` 指向 `dist-weapp/`）。

## 微信限制（参考）

| 项 | 限制 |
|----|------|
| 主包 | ≤ 2 MB |
| 单个分包 | ≤ 2 MB |
| 总包（主包 + 全部分包） | ≤ 20 MB（以公众平台当前规则为准） |

上传代码包时 **不要包含 `*.map`**（已在 `project.config.json` → `packOptions.ignore` 配置）。

## 测量

```bash
npm run build:weapp      # 编译
npm run size:weapp       # 统计主包/分包体积（不含 .map）
npm run build:weapp:size # 编译 + 统计
```

本地也可用微信开发者工具 → **详情 → 代码依赖分析** 对照 `scripts/size-weapp.mjs` 输出。

## 脚本阈值（`scripts/size-weapp.mjs`）

| 项 | 软阈值 | 说明 |
|----|--------|------|
| 主包 | 1100 KB | 低于微信 2 MB，留增长空间 |
| 各分包 | 2000 KB | 对齐单分包上限 |
| 合计（不含 .map） | 4500 KB | 全量 dist 粗算 |

超阈值时 `npm run size:weapp` 以 exit code 1 失败，便于 CI 接入。

## 基线记录

在 PR 或发版前跑 `npm run build:weapp:size`，把输出贴到下方（日期 + 分支/commit）。

| 日期 | commit | 主包 | packageEvent | packageAi | packageProfile | 主包 assets |
|------|--------|------|--------------|-----------|----------------|-------------|
| 2026-06-01 | P0（B1/B3/F1/A2） | **582 KB** | 267 KB | 73 KB | 41 KB | 0 |
| _优化前参考_ | — | ~971 KB | ~209 KB | ~117 KB | ~99 KB | ~389 KB |

## 已落地的 P0 优化

| ID | 内容 |
|----|------|
| A2 | `packOptions.ignore` 排除 `*.map`、`.DS_Store` |
| B1 | 活动列表缩略图不再打包 JPEG，仅用 API URL + `PLACEHOLDER_EVENT_HERO` |
| B3 | `storm-logo.png` 迁至 `src/packageEvent/assets/`，仅 event-map 分包引用 |
| F1 | 移除未使用的 `@tanstack/react-virtual` |

## 后续任务（见历史包体评审）

- **P1**：我的 Tab lazy 权益弹层、Mock 动态 import、收紧 `preloadRule`
- **P1**：分包 `sub-common` 重复块、独立分包配置
- **P2**：行程页独立分包、event-map Canvas 延迟加载
- **P3**：产品裁切低频页 / 地图 / 行程模块

更新阈值或主包策略时请同步改 `scripts/size-weapp.mjs` 与本表。
