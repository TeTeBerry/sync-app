# 帖子发布与互动全链路

本文梳理 **模板发帖**、**留言板** 与 **点赞 / 评论 / 编辑 / 删除** 的端到端路径，便于联调与回归。

## 一、发帖入口（前端）

| 入口 | 组件 / Hook | 说明 |
|------|-------------|------|
| 活动详情 · 模板发帖 | `useEventDetailBuddyPost` | 打开 `AiBuddyPostSheet`，提交后 `publishBuddyPostFromForm` |
| 活动详情 · 节中 | `publishOnsiteIntent` + 现场快捷芯片 | 预填打开 `AiBuddyPostSheet`，确认后 `publishBuddyPostFromForm` → `POST /posts` |
| AI 助手 | `useAiBuddyPost` | 对话收集槽位或表单，`runPublish` → 同一 `publishBuddyPostFromForm` |
| AI WebSocket | 后端 `create-post-from-chat` | 与 REST 共用 `PostWriteService.createPost` |
| 活动详情 · 留言板 | `publishMessageBoardPost` | `contentTypes: ['other']`，活动页留言区独立 composer |

### 前端发帖数据流（模板帖）

```
AiBuddyPostFormValues
  → buildBuddyPostBody / buddyPostHashTags / buddyPostContentTypes
  → POST /api/posts  (api/sync/posts.createPost)
  → invalidatePostQueries + 活动帖列表 refresh
```

关键文件：

- `src/utils/publishBuddyPost.ts` — 组装 body、tags、contentTypes、`listedInFeed`
- `src/utils/buddyPostForm.ts` — 表单 → 正文与标签
- `src/utils/publishMessageBoardPost.ts` — 留言板发帖
- `src/packageEvent/pages/event-detail/useEventDetailBuddyPost.ts` — 活动页模板发帖

## 二、发帖落库（后端）

```
POST /api/posts
  → PostController.create
  → PostService.createPost
  → PostWriteService.createPost
```

`PostWriteService` 主要步骤：

1. 解析用户资料、活动信息（`activityLegacyId` → `eventTitle` / `location`）
2. 票务敏感词拦截（`isTicketPublishProhibited`）
3. 可选风控 `assessPost`（不通过则 `status: hidden`）
4. 推断 `contentTypes`、写入 `matchCriteria` / `departureCity`
5. 同活动发帖上限（默认 8 篇）
6. `repository.create`，状态 `active`（历史库中的 `recruiting` / `completed` 会在读时归一化为 `active`）

## 三、活动帖列表

- `GET /api/posts?activityLegacyId=` — 分页 feed，`liked` 等由当前用户注入
- 帖状态：`active`（可见）/ `hidden`（风控或作者隐藏）
- 用户编辑自己的帖：`PATCH /api/posts/:id` — 仅更新正文、图片等字段，**不含**状态流转

## 四、留言板

- 前端：`EventDetailMessageBoardComposer` → `publishMessageBoardPost`
- 后端：与普通帖同一 `POST /posts`，`contentTypes` 含 `other`
- 在活动详情留言区展示，与模板帖共用点赞 / 评论能力

## 五、互动（点赞 / 评论）

| 动作 | 方法 | 路径 |
|------|------|------|
| 点赞切换 | POST | `/api/posts/:id/like` |
| 评论列表 | GET | `/api/posts/:id/comments` |
| 发表评论 | POST | `/api/posts/:id/comments` |

- 点赞 / 评论成功后响应 `{ post: EventDetailPost }`，前端更新缓存
- 评论通知帖主（`meta.type: comment`）；点赞同理（`meta.type: like`）

## 六、个人页管理

- `GET /api/profile/posts` — 我的帖子（不含现场分享帖）
- `PATCH /api/posts/:id` — 编辑正文 / 图片
- `DELETE /api/posts/:id` — 删除帖子及关联点赞、评论（历史申请数据一并清理）

## 七、API 速查

| 动作 | 方法 | 路径 |
|------|------|------|
| 发帖 | POST | `/posts` |
| 活动帖列表 | GET | `/posts?activityLegacyId=` |
| 编辑 | PATCH | `/posts/:id` |
| 删除 | DELETE | `/posts/:id` |
| 点赞 | POST | `/posts/:id/like` |
| 评论 | GET/POST | `/posts/:id/comments` |

## 八、自动化测试

| 范围 | 文件 |
|------|------|
| 前端发帖组装 | `src/utils/publishBuddyPost.test.ts` |
| 前端留言板 | `src/utils/publishMessageBoardPost.test.ts`（如有） |
| 后端写帖 | `test/unit/.../buddy-post-write-flow.spec.ts` |
| 后端互动 | `test/unit/.../post-interaction.service.spec.ts` |

本地执行：

```bash
# 前端
cd sync-app && npm test -- --run src/utils/publishBuddyPost.test.ts

# 后端
cd sync-app-backend && CI=true npm test -- --watchman=false --testPathPattern="buddy-post-write-flow|post-interaction|PostWriteService"
```
