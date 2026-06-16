# 帖子发布与展示全链路

本文梳理 **模板发帖**、活动留言列表展示与 **删除** 的端到端路径，便于联调与回归。

> **2026-06 变更**：帖子 **点赞 / 评论 / 编辑（PATCH）** 已从前后端移除；活动详情仅保留模板发帖、列表展示、搜索与删自己的帖。

---

## 一、发帖入口（前端）

| 入口 | 组件 / Hook | 说明 |
|------|-------------|------|
| 活动详情 · 模板发帖 | `useEventDetailBuddyPost` + `EventDetailTemplatePostFab` | 右下角「+」打开 `AiBuddyPostSheet`，提交后 `publishBuddyPostFromForm` |
| AI 助手 | `useAiBuddyPost` | 对话收集槽位或表单，`runPublish` → 同一 `publishBuddyPostFromForm` |
| AI WebSocket | 后端 `create-post-from-chat` | 与 REST 共用 `PostWriteService.createPost` |

活动详情 **无** 独立自由文本留言 composer；留言区展示的是结构化 **模板帖**（组队）。

### 前端发帖数据流（模板帖）

```
AiBuddyPostFormValues
  → buildBuddyPostBody / buddyPostHashTags / buddyPostContentTypes
  → POST /api/posts  (api/sync/posts.createPost)
  → prependItem（乐观帖）→ replaceItem（服务端帖）→ refetch({ silent: true })
```

**正文格式**（`buddyPostForm.ts`）：

```
组队，6.13-6.14，上海，2人，女生优先

#组队
```

- 段内字段以中文逗号 `，` 连接
- 标签以 `\n\n` 与正文分隔，并同步写入 `tags`、`contentTypes`

关键文件：

- `src/utils/publishBuddyPost.ts` — 组装 body、tags、contentTypes、`listedInFeed`、乐观帖
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
   - **模板帖**（同时带 `contentTypes` + `tags`）→ `{ rulesOnly: true }`
   - 不通过 → `status: hidden`
5. `assertPostHasNoContactInfo` 拒绝含联系方式的正文（手机号、微信号、QQ、邮箱、链接等）
6. 推断 `contentTypes`、写入 `departureCity`（可由正文/地点推断）
7. 同活动相近帖 / 发帖上限（默认 8 篇）校验
8. 对最终正文及关联字段走微信 `msg_sec_check` 文本审核
9. `repository.create`，状态 `active`

`listedInFeed: false` 的帖 **不入** 活动公开列表（API 仍支持；前端发帖 UI 暂未暴露开关）。

---

## 三、活动帖列表

- `GET /api/posts?activityLegacyId=&limit=&cursor=&anchorPostId=` — 分页 `{ items, nextCursor?, hasMore }`
- 过滤：`status: active`、`listedInFeed !== false`、排除 `share` 类型现场帖
- 前端：`useEventPostsInfiniteQuery` + `useEventDetailPosts`（窗口化首屏 6 条、步进 +6）
- **搜索**：纯前端模糊匹配 `messageBoardPostSearch.ts`（仅 `body` / `location` / `tags`，不含昵称）；搜索激活时自动 `loadMore` 直至无更多页
- 删帖：`DELETE /api/posts/:id`（仅自己的帖）

`EventDetailPost` 核心字段：`id`, `userId`, `name`, `avatar`, `location`, `createdAt`, `body`, `tags`, `contentTypes`, `images?`

---

## 四、正文展示（前端）

| 环节 | 文件 | 说明 |
|------|------|------|
| 剥离 | `utils/postBodyContact.ts` | 展示前移除 `联系方式：` 段（兼容历史数据） |
| 使用处 | `EventPostCard`、`FeedPostList`、`ProfilePostsSection` | 活动详情 / 首页 / 个人页 |

活动详情页底部固定合规提示（`event-detail/index.tsx`）与首页底部（`pages/index/index.tsx`）：

> 本平台仅免费展示电音节资讯，不组团、不收款、不提供线下撮合中介，用户线下自发结伴风险自行承担。

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
| 热门帖 | GET | `/posts/popular` |
| 我的帖子 | GET | `/posts`（owner 过滤）/ `GET /profile/posts` |
| 删帖 | DELETE | `/posts/:id` |
| 深链导航 | GET | `/posts/:id/navigation-target` |

**已移除**（勿再对接）：`PATCH /posts/:id`、`POST /posts/:id/like`、`GET|POST /posts/:id/comments`

---

## 八、消息通知

- `GET /api/notifications` — 站内信列表（**过滤** 历史点赞/评论/组队申请类通知）
- `GET /api/notifications/unread-count` — 未读数（同上过滤）
- 前端 Tab：**全部** / **系统**（活动变更、审核结果、帖子隐藏等）
- 深链：`navigateFromNotification` — `activity_update` → 活动详情；`post_rejected` → AI 助手；`post_hidden` → 个人页

**已移除**：点赞/评论通知推送（`NoticeAgent.notifyLike|notifyComment` 已删除）

---

## 九、自动化测试

| 范围 | 文件 |
|------|------|
| 前端发帖组装 | `test/unit/utils/publishBuddyPost.test.ts` |
| 前端正文剥离 | `test/unit/utils/postBodyContact.test.ts` |
| 前端留言搜索 | `test/unit/domains/partner-feed/utils/messageBoardPostSearch.test.ts` |
| 后端写帖 | `test/unit/modules/partner/application/buddy-post-write-flow.spec.ts` |
| 通知展示 | `test/unit/utils/notificationDisplay.test.ts` |

本地执行：

```bash
# 前端
cd sync-app && npm test -- publishBuddyPost postBodyContact messageBoardPostSearch

# 后端
cd sync-app-backend && CI=true npm test -- --watchman=false --testPathPattern="buddy-post-write-flow|risk.agent"
```

---

## 十、联调检查清单

- [ ] 模板发帖后列表首条为刚发内容
- [ ] 帖子正文不展示联系方式
- [ ] 搜索仅匹配留言正文，不匹配昵称
- [ ] 删自己的帖成功；他人帖无删除按钮
- [ ] 无点赞/评论入口；`PATCH` 接口 404
- [ ] 通知页无「点赞/评论」Tab；历史点赞/评论通知不展示、不计入未读
