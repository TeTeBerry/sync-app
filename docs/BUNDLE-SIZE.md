# 微信小程序包体

主发布端：`npm run build:weapp` → `dist-weapp/`。

## 测量

```bash
npm run build:weapp:size
```

## 阈值（`scripts/size-weapp.mjs`）

| 项 | 软阈值 |
|----|--------|
| 主包 | 1100 KB |
| 各分包 | 2000 KB |
| 合计（不含 .map） | 4500 KB |

上传时在 `project.config.json` → `packOptions.ignore` 排除 `*.map`。

## 基线

| 日期 | 主包 | packageEvent | packageAi | packageProfile | 主包 assets |
|------|------|--------------|-----------|----------------|-------------|
| 2026-06-01 P0 CI | ~971 KB | ~167 KB | ~71 KB | ~40 KB | ~389 KB |
| 2026-06-01 包体优化后参考 | ~582 KB | ~267 KB | ~73 KB | ~41 KB | 0 |
