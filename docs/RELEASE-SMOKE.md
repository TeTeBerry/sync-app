# 小程序发版冒烟（上线包 P0）

合并 `main` 并上传微信后台前（目标：2026-07-06 前提审）。功能对照 [PRODUCT.md](./PRODUCT.md) · Story [Q2-USER-STORIES.md](./Q2-USER-STORIES.md) Sprint 5。

## 构建与环境

- [ ] `cd sync-app && npm run clean:weapp && npm run build:weapp:size` 通过（主包图片+音频 ≤200KB、lazyCodeLoading）
- [ ] 开发者工具导入仓库根目录，`miniprogramRoot` = `dist-weapp/`
- [ ] 上传包不含 `*.map`
- [ ] 后端 `GET /api/health` 正常（目标环境 `NODE_ENV=production`）
- [ ] 生产无 dev mock 帖（`userId` 非 `demo-mock-tml-` 前缀，见 `POST-LIFECYCLE.md` §十一）
- [ ] CI 黄金路径：`sync-app-backend` PR 合并前 `smoke` job 通过（见下文）

## CI 黄金路径（自动化 · US-ARCH-17）

`sync-app-backend` GitHub Actions **`smoke`** job（`main` PR / push）在 Mongo + Redis 上启动 API 后跑 `npm run smoke:suite:wait`：

| 步骤 | 覆盖 |
|------|------|
| health | `GET /api/health` |
| 活动 | 列表 + 详情（`legacyId=4`） |
| 招募帖 | `ops-seed-` 种子帖列表 |
| 攻略 | `POST …/travel-guide/generate-async` → 轮询 job 至 `completed`（Hot Path，无真实 LLM） |
| AI WS | JWT 一轮 `smoke ping`（`AI_CHAT_WS_ENABLED=true`） |

**本地复现**（需 Docker Mongo/Redis）：

```bash
cd sync-app-backend
npm run infra:up && npm run wait:mongo
MONGODB_URI=mongodb://127.0.0.1:27017/sync-dev npm run db:seed-ops-buddy-posts
npm run build && AMAP_KEY=ci-smoke-placeholder AI_CHAT_WS_ENABLED=true node dist/src/main &
SMOKE_USER_ID=smoke-golden-user npm run smoke:suite:wait
```

发版前可选跑全量 REST：`npm run smoke:api:wait`（比 golden 多 itinerary / travel-plan / notifications 等）。

## 导航与主路径（3 Tab · 无准备 Tab）

- [ ] 四个入口可切换：**首页 / 活动 / 我的**（底栏 3 Tab）
- [ ] 活动 Tab：列表 / 日历 / 艺人子视图可切换
- [ ] 首页双 CTA：查节 → 活动 Tab 搜索；找队 → 活动详情招募区（或活动列表）
- [ ] 进入活动详情：首屏为资讯 + **AI 找队搜索** + 组队招募列表（出征准备在折叠区）

## 找队闭环（上线成败线）

- [ ] 热门活动详情有可见招募帖（`legacyId` 1/4/5/16 各有 `ops-seed-` 种子帖，见 `POST-LIFECYCLE.md` §十二 · US-Q2-21）
- [ ] 招募卡展示：招募中/已满、人数进度（有 `slotsTotal` 时）
- [ ] AI 找队：输入示例句 → 结果「找到 N 条合适的公开招募」+ 解析一行
- [ ] 搜索无结果：引导发招募（FAB / Sheet）
- [ ] 「申请加入」→ 展开评论 + 预填 → 发送公开评论
- [ ] 已满帖：「申请加入」置灰
- [ ] 帖主可「标为已满 / 重新招募」
- [ ] 帖主可在自己的招募卡上用 ± 调整 `slotsFilled`（US-Q2-26，下限 1）

## 发帖与 UGC

- [ ] FAB 发招募：模板帖成功出现在列表
- [ ] 发帖/评论无联系方式；触发拦截时有提示
- [ ] 删自己的帖成功

## 出征准备（折叠区 · 非主 CTA）

- [ ] Festival Plan 进度可展开；攻略 Sheet / 行程分包可打开
- [x] （US-Q2-35）生成攻略可不选预算；结果页三档对比卡点选后住宿区与 `budgetLevel` 更新
- [x] Prep Nudge 文案为规则建议，非「匹配」（US-Q2-34）
- [ ] （**US-Q2-49**）**EDC Korea** 详情 → 生成攻略（出发地「上海」）→ 200 · 含住宿方案/交通文案 · 三档预算可点选
- [x] （**US-Q2-49**）**S2O / WDJF / Ultra Japan** 生成攻略不 503（Hot Path Phase B 已收口）
- [x] （**US-Q2-49**）未支持境外场（如 TML 比利时）详情出征准备显示「筹备中」，不裸 503
- [ ] 境外场攻略酒店 `bookingHint` 含 Agoda/Booking 等（非平台代订）
- [ ] （**US-Q2-52**）行程记账：拍小票或手动记一笔 → 分摊 Sheet 选 **4 人** → 保存 → StatsBar 显示人均 → **复制分摊摘要**（含「试算仅供参考」）→ 刷新后分摊字段仍在

## 合规文案

- [ ] `rg '联系队友|配对成功|平台担保|智能配对|buddy-matching|AA收款|代付|向队友收|组队账单' sync-app/src/` 无命中
- [ ] 首页/详情底部 `platformDisclaimer` 常驻
- [ ] AI 相关入口有「仅供参考」类 disclaimer

## 登录与通知

- [ ] 微信登录；首页「我的下一场」（已选活动 + 登录态）
- [ ] 招募帖新公开回复：首页提醒 / 通知深链可进帖+评论区

## 弱网观演资料（US-ARCH-19）

- [ ] Wi‑Fi 打开活动阵容页 → 开发者工具 Storage 可见 `sync:performance-bundle:{legacyId}:v1`
- [ ] 开启飞行模式 → 重进阵容 / 专属行程 / 我的行程 → 仍可查看已缓存内容 + 「本场观演资料 · 更新于 …」
- [ ] 飞行模式下活动详情招募区显示「公开招募需联网查看」，不展示帖列表

## 明确不在上线包验收

- 准备 Tab / AI 多轮对话 WebSocket
- 全站招募帖流 / 首页帖子广场
- Scene Agent `scene-run` API（上线后 US-Q2-31）
