# 帖子发布与展示全链路

本文梳理 **模板发帖**、活动留言列表展示与 **删除** 的端到端路径，便于联调与回归。

> **2026-06 变更**：帖子 **点赞 / 编辑（PATCH）** 已从前后端移除；活动详情保留模板发帖、列表展示、评论与删自己的帖。留言板 **纯前端搜索**（`messageBoardPostSearch`）与 `GET /posts/:id/navigation-target` 深链解析已下线；通知跳转直接使用 `meta.activityLegacyId`（见 `navigateFromNotification`）。

---

## 一、发帖入口（前端）

| 入口 | 组件 / Hook | 说明 |
|------|-------------|------|
| 活动详情 · 模板发帖 | `useEventDetailBuddyPost` + `EventDetailTemplatePostFab` | 右下角「+」打开 `AiBuddyPostSheet`，提交后 `publishBuddyPostFromForm` |
| AI 帮写（Sheet） | `useBuddyPostCompose` | `POST /api/ai/scene-run`（`scene=recruit_compose`）生成候选文案 |

活动详情 **无** 独立自由文本留言 composer；留言区展示的是结构化 **模板帖**（组队）。

### 前端发帖数据流（模板帖）

```
AiBuddyPostFormValues
  → buildBuddyPostBody / buddyPostHashTags
  → POST /api/posts  (api/sync/posts.createPost)
  → prependItem（乐观帖）→ replaceItem（服务端帖）→ refetch({ silent: true })
```

**正文格式**（`buddyPostForm.ts`）：

```
组队，6.13-6.14，上海，2人，女生优先

#组队
```

- 段内字段以中文逗号 `，` 连接
- 标签以 `\n\n` 与正文分隔，并同步写入 `tags`

关键文件：

- `src/utils/publishBuddyPost.ts` — 组装 body、tags、`listedInFeed`、乐观帖
- `src/utils/buddyPostForm.ts` — 表单 → 正文与标签
- `src/domains/partner-feed/hooks/useEventDetailBuddyPost.ts` — 活动页发帖编排
- `src/components/ai-chat/AiBuddyPostSheet.tsx` — 发帖表单 UI

---

## 二、发帖落库（后端）

```
POST /api/posts
  → PostController.create
  → PostService.createPost
  → PostWriteService.createPost
```

`PostWriteService` 主要步骤：

1. 解析用户资料、活动信息（`activityLegacyId` → `eventTitle` / `location`）
2. 微信 UGC 文本安全（`msg_sec_check`，若启用）
3. 票务敏感词拦截（`isTicketPublishProhibited`）
4. 风控 `assessPost`：
   - **模板帖**（带 `tags`）→ `{ rulesOnly: true }`
   - 不通过 → `status: hidden`
5. `assertPostHasNoContactInfo` 拒绝含联系方式的正文（手机号、微信号、QQ、邮箱、链接等）
6. 写入 `departureCity`（可由正文/地点推断）
7. 同活动相近帖 / 发帖上限（默认 8 篇）校验
8. 对最终正文及关联字段走微信 `msg_sec_check` 文本审核
9. `repository.create`，状态 `active`

`listedInFeed: false` 的帖 **不入** 活动公开列表（API 仍支持；前端发帖 UI 暂未暴露开关）。

---

## 三、活动帖列表

- `GET /api/posts?activityLegacyId=&limit=&cursor=&anchorPostId=` — 分页 `{ items, nextCursor?, hasMore }`
- 过滤：`status: active`、`listedInFeed !== false`
- 前端：`useEventPostsInfiniteQuery` + `useEventDetailPosts`（窗口化首屏 6 条、步进 +6）
- **评论**：活动帖卡片底部评论 icon 展开/收起；`PostCommentSection` + `GET|POST /api/posts/:id/comments`
  - 前端：`useUgcPublishGuard`（账号风控 + 合规确认）+ 本地联系方式校验（`ugcContactValidation`）
  - 后端：`assertCommentBodySafe` — 禁联系方式、票务敏感词、微信 `msg_sec_check`、规则风控
- 删帖：`DELETE /api/posts/:id`（仅自己的帖）

`EventDetailPost` 核心字段：`id`, `userId`, `name`, `avatar`, `location`, `createdAt`, `body`, `tags`, `comments?`

---

## 四、正文展示（前端）

| 环节 | 文件 | 说明 |
|------|------|------|
| 剥离 | `utils/postBodyContact.ts` | 展示前移除 `联系方式：` 段（兼容历史数据） |
| 使用处 | `EventPostCard`、`ProfilePostsSection` | 活动详情 / 个人页 |

活动详情页底部固定合规提示（`event-detail/index.tsx`）与首页底部（`pages/index/index.tsx`）均使用 `constants/platformDisclaimer.ts` 中的 `PLATFORM_DISCLAIMER_TEXT`（单点维护，勿在 UI 硬编码）。

---

## 五、个人页

- `GET /api/profile/posts` — 我的帖子
- `DELETE /api/posts/:id` — 删除自己的帖
- 展示逻辑与活动详情相同

---

## 六、API 速查（帖子）

| 动作 | 方法 | 路径 |
|------|------|------|
| 发帖 | POST | `/posts` |
| 活动帖列表 | GET | `/posts?activityLegacyId=` |
| 我的帖子 | GET | `/posts`（owner 过滤）/ `GET /profile/posts` |
| 删帖 | DELETE | `/posts/:id` |
| 评论列表 | GET | `/posts/:id/comments` |
| 发表评论 | POST | `/posts/:id/comments` |
| AI 搭伴检索 | POST | `/api/ai/scene-run`（`scene=recruit_search`） |

**已移除**（勿再对接）：`PATCH /posts/:id`、`POST /posts/:id/like`、`GET /posts/:id/navigation-target`

---

## 八、消息通知

- `GET /api/notifications` — 站内信列表（**过滤** 历史点赞/评论/组队申请类通知）
- `GET /api/notifications/unread-count` — 未读数（同上过滤）
- 前端 Tab：**全部** / **系统**（活动变更、审核结果、帖子隐藏等）
- 深链：`navigateFromNotification`（`src/utils/route.ts`）— 读取通知 `meta.activityLegacyId` / `postId`，**不再**请求 `/posts/:id/navigation-target`
  - `activity_update` / `comment` / `comment_reply` / 含 `activityLegacyId` → `goEventDetail(legacyId, { postId? })`
  - `post_rejected` → AI 助手（带活动上下文）
  - `post_hidden` → 个人页

**评论通知**：用户评论帖子 → 通知发帖人（`type: comment`）；发帖人回复评论 → 通知被回复用户（`type: comment_reply`）。不发给自己；尊重用户「消息通知」开关。

- **站内信**：`navigateFromNotification` 对 `comment` / `comment_reply` 跳转活动详情，`postId` + `focusPosts=1` + `openComments=1`（自动滚动并展开评论）
- **微信订阅消息**：后端 `WechatSubscribeMessageService`（需 `WECHAT_SUBSCRIBE_COMMENT_TEMPLATE_ID`）；用户发帖/评论成功后前端 `requestSubscribeMessage` 授权
- **首页「我的下一场」**：`GET /api/home` → `myNextEventPostEngagement.unreadReplyCount` 展示「你的招募帖有 N 条新公开回复」

---

## 九、自动化测试

| 范围 | 文件 |
|------|------|
| 前端发帖组装 | `test/unit/utils/publishBuddyPost.test.ts` |
| 前端正文剥离 | `test/unit/utils/postBodyContact.test.ts` |
| 评论联系方式校验 | `test/unit/utils/ugcContactValidation.test.ts` |
| 通知深链跳转 | `test/unit/utils/route.notificationNavigate.test.ts` |
| 后端写帖 | `test/unit/modules/partner/application/buddy-post-write-flow.spec.ts` |
| 后端评论 UGC | `test/unit/modules/partner/application/post-comment.service.spec.ts` |
| 通知展示 | `test/unit/utils/notificationDisplay.test.ts` |

本地执行：

```bash
# 前端
cd sync-app && npm test -- publishBuddyPost postBodyContact route.notificationNavigate

# 后端
cd sync-app-backend && CI=true npm test -- --watchman=false --testPathPattern="buddy-post-write-flow|risk.agent"
```

---

## 十、联调检查清单

- [ ] 模板发帖后列表首条为刚发内容
- [ ] 帖子正文不展示联系方式
- [ ] 评论 icon 可展开/收起；发帖人可回复一级评论
- [ ] 删自己的帖成功；他人帖无删除按钮
- [ ] 无点赞入口；`PATCH /posts/:id` 接口 404
- [ ] 通知页无「点赞/评论」Tab；历史点赞/评论通知不展示、不计入未读
- [ ] 通知深链不依赖 `/posts/:id/navigation-target`

---

## 十一、Dev mock 组队帖（仅开发 / 联调）

后端 `PostDevMockSeedService` 在 **非 production** 启动时为 Tomorrowland Thailand（`activityLegacyId = 1`）写入演示组队帖，便于空列表联调。

| 条件 | 行为 |
|------|------|
| `NODE_ENV=production` | **永不 seed**（上架默认安全） |
| `DISABLE_DEV_MOCK_POSTS=true` | 跳过 seed（本地 / staging 也可关闭） |
| 否则（dev 默认） | 启动时 upsert mock 帖 |

**识别 mock 数据**：`userId` 前缀 `demo-mock-tml-`（`DEV_MOCK_TML_POST_USER_PREFIX`），活动 `legacyId=1`。

实现：`sync-app-backend/src/modules/partner/application/post-dev-mock-seed.service.ts`

### 上架验收

- [ ] 生产实例 `NODE_ENV=production`，启动日志**无** `Dev mock buddy posts for TML Thailand`
- [ ] 生产活动详情帖 API 返回列表中**无** `userId` 以 `demo-mock-tml-` 开头的帖子
- [ ] 本地需关闭 mock 时：`.env` 设 `DISABLE_DEV_MOCK_POSTS=true` 后重启后端

---

## 十二、运营种子招募帖（生产冷启动 · US-Q2-21）

热门活动招募墙在上线初期需有可见结构化示例帖，避免「空城」。生产环境**不**使用 §十一 dev mock，改由运维**手动**执行种子脚本或运营账号在小程序发帖。

### 与 dev mock 对比

| 项 | §十一 dev mock | §十二 运营种子 |
|----|----------------|----------------|
| 触发 | 后端启动 `OnModuleInit`（非 production） | 手动 `npm run db:seed-ops-buddy-posts` |
| `userId` 前缀 | `demo-mock-tml-` | `ops-seed-` |
| 适用环境 | 本地 / staging 联调 | **生产**（及 staging 预演） |
| 覆盖活动 | 仅 `legacyId=1` | `1` · `4` · `5` · `16`（共 10 帖） |

### 覆盖活动与帖数

| legacyId | 活动 | 招募中 | 已满 |
|----------|------|--------|------|
| 1 | Tomorrowland Thailand 2026 | 2 | 1 |
| 4 | 风暴电音节 深圳站 2026 | 2 | 1 |
| 5 | EDC Thailand 2026 | 2 | 0 |
| 16 | The Magic Of Tomorrowland 上海 2026 | 2 | 0 |

帖子字段与 US-Q2-16 一致：`recruitStatus` · `slotsTotal` · `slotsFilled`；正文格式同 §一模板（`组队，日期，出发地，人数，备注`），无联系方式。

实现：`sync-app-backend/src/modules/partner/data/ops-seed-buddy-posts.util.ts`

### 执行（运维）

```bash
cd sync-app-backend

# 预览（不写库）
MONGODB_URI='<目标库连接串>' npm run db:seed-ops-buddy-posts -- --dry-run

# 幂等 upsert（可重复执行）
MONGODB_URI='<目标库连接串>' npm run db:seed-ops-buddy-posts
```

- **必须**显式设置 `MONGODB_URI`（或 `MONGO_URI`），脚本拒绝默认 localhost
- 按 `{ userId, activityLegacyId }` upsert，同 slot 重复执行会覆盖正文
- 种子作者为虚拟 `ops-seed-*` 账号，**无法**登录小程序维护；已满状态在数据定义中预设

### 验收

MongoDB / Compass：

```js
db.posts.countDocuments({ userId: /^ops-seed-/, activityLegacyId: 1 })
db.posts.countDocuments({ userId: /^ops-seed-/, activityLegacyId: 4 })
// … 5、16 同理，各应 ≥ 2
```

REST（无需登录）：

```bash
curl -s "$API_BASE/api/posts?activityLegacyId=1&limit=10" | jq '.items | length'
```

- [ ] 生产无 `demo-mock-tml-` 前缀帖（§十一）
- [ ] `legacyId` 1 / 4 / 5 / 16 详情招募墙各有可见 `ops-seed-` 帖
- [ ] 招募卡展示招募中/已满与人数进度

### 补量

脚本种子为冷启动基线。后续可由运营账号在活动详情 FAB 按 §一模板手动发帖；或扩展 `ops-seed-buddy-posts.util.ts` 后重新 upsert。
