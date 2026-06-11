# 组队发帖与招募全链路

本文梳理从「发布组队帖」到「申请 → 私信 → 接受组队 → 解散」的端到端业务路径，便于联调与回归。

## 一、发帖入口（前端）

| 入口 | 组件 / Hook | 说明 |
|------|-------------|------|
| 活动详情 | `useEventDetailBuddyPost` | 底部/引导打开 `AiBuddyPostSheet`，提交后 `publishBuddyPostFromForm` |
| 活动详情 · 节中 | `publishOnsiteIntent` + 现场快捷芯片 | 预填打开 `AiBuddyPostSheet`（意图/地点/标签/备注），用户确认后 `publishBuddyPostFromForm` → `POST /posts`；不强制手环；已认证作者帖展示「手环认证」 |
| 活动详情 · 申请前补帖 | `useEventDetailPage` → `handleBuddyPostSheetSubmit` | 无招募帖时先发帖，`listedInFeed` 可为 false（仅用于申请） |
| AI 助手 | `useAiBuddyPost` | 对话收集槽位或表单，`runPublish` → 同一 `publishBuddyPostFromForm` |
| AI WebSocket | 后端 `create-post-from-chat` | 与 REST 共用 `PostWriteService.createPost` |

### 前端发帖数据流

```
AiBuddyPostFormValues
  → buildBuddyPostBody / buddyPostHashTags / buddyPostContentTypes
  → POST /api/posts  (api/sync/posts.createPost)
  → invalidatePostQueries + 活动帖列表 refresh
```

关键文件：

- `src/utils/publishBuddyPost.ts` — 组装 body、tags、contentTypes、`listedInFeed`
- `src/utils/buddyPostForm.ts` — 表单 → 正文与标签
- `src/packageEvent/pages/event-detail/useEventDetailBuddyPost.ts` — 活动页发布

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
6. `repository.create`，状态 `recruiting`

## 三、活动帖列表与状态

- `GET /api/posts?activityLegacyId=` — 分页 feed，`appliedByMe` / `liked` 由当前用户注入
- 帖状态：`recruiting`（招募中）→ `completed`（已组队）/ `hidden`
- 用户编辑自己的帖：`PATCH /api/posts/:id`，`status: recruiting` 会触发 **解散组队**（见下文）

## 四、申请组队

### 前端

1. 校验登录（`requireAuth`）
2. 有招募中帖：打开 `TeamApplySheet`（完整模式），展示 **与帖主帖最匹配** 的自己招募帖（`resolveUserBuddyPreviewForTargetPost`）
3. 无招募中帖：打开 `TeamApplySheet`（轻量模式）— 出发地（必填）、出行天数、性别偏好 + 可选补充说明
4. `POST /api/posts/:id/applications` — 可选 `message`；轻量模式另传 `lightApply: { departureCity, tripDays?, genderPref? }`
5. 轻量申请成功后可选「完善组队帖」；首条私信为合成正文（如「从广州出发，活动 2 天」）
6. 活动帖 CTA 变为「已申请」禁用（不再显示「查看沟通」）

### 后端 `applyToPost`

1. 禁止申请自己的帖
2. 幂等：已申请 → `{ alreadyApplied: true }`
3. 创建 `PostApplication`（`pending`）
4. 通知帖主（`notifyApplication`）
5. **不**自动创建私信会话；申请人无法在私信里发起沟通

### 申请卡片匹配规则

在申请人该活动下所有 `recruiting` 帖中，按帖主帖的 **内容类型 / 标签 / 出发地** 打分选最高分（见 `buddy-post-match.util` / `buddyPostMatch.util`）。

## 五、私信（临时组队会话）

- 会话 ID：`postId:applicantUserId`（`buildTempChatRouteSessionId`）
- **仅帖主**可在「我的组队帖」对某申请人点 **沟通** 发起会话：`POST /api/team-chats/:postId/:applicantUserId/open`（写入 `ownerOpenedChatAt`，并带入申请附言为首条消息）
- 申请人申请时会写入首条留言（计为 24 小时内 1 条）；**帖主回复前**申请人不能再发私信，前端展示提示「对方回复你之前，24小时内最多只能发1条文字消息」
- 帖主回复后双方可正常聊天
- 列表：`GET /api/team-chats`
- 消息：`GET/POST .../messages`，已读 `POST .../read`
- 帖主侧 `buddyPreview`：申请人最佳匹配招募帖；申请人侧：帖主原帖

帖主在聊天页可 **接受组队** → `POST /api/posts/:id/applications/:applicantUserId/accept`

## 六、接受组队

`acceptPostApplication`：

1. 申请 → `accepted`
2. 帖主帖 `completeRecruitment`（`buddy_teamed`）
3. `PostTeamPairService.onOwnerAcceptedApplication`：
   - 查找申请人在同活动的招募帖
   - 将该帖也标为已组队
   - 通知申请人（`teamAccepted`）

## 七、重新招募 / 解散

帖主将 **已组队** 帖改回 **招募中**（`PATCH` `status: recruiting`）：

`PostTeamPairService.reopenRecruitmentAndDissolve`：

1. 双方互相关联的已接受申请改回 `pending`
2. 双方相关帖 `reopenRecruitment`
3. 通知对方（`teamDissolved`）

## 八、API 速查

| 动作 | 方法 | 路径 |
|------|------|------|
| 发帖 | POST | `/posts` |
| 活动帖列表 | GET | `/posts?activityLegacyId=` |
| 申请 | POST | `/posts/:id/applications` |
| 申请列表 | GET | `/posts/:id/applications` |
| 接受 | POST | `/posts/:id/applications/:userId/accept` |
| 改状态 | PATCH | `/posts/:id` |
| 组队会话 | GET | `/team-chats/sessions` |

## 九、自动化测试

| 范围 | 文件 |
|------|------|
| 前端发帖组装 | `src/utils/publishBuddyPost.test.ts` |
| 前端申请卡片匹配 | `src/utils/buddyPostMatch.util.test.ts`, `teamApplyBuddyPreview.test.ts` |
| 前端全链路编排 | `src/utils/postLifecycle.test.ts` |
| 后端写帖 | `test/unit/.../buddy-post-write-flow.spec.ts` |
| 后端匹配 | `test/unit/.../buddy-post-match.util.spec.ts` |
| 后端全链路 | `test/unit/.../post-lifecycle-full-flow.spec.ts` |
| 接受/解散 | `post-team-pair.service.spec.ts`, `post-interaction.service.spec.ts` |

本地执行：

```bash
# 前端
cd sync-app && npm test -- --run src/utils/publishBuddyPost.test.ts src/utils/postLifecycle.test.ts src/utils/buddyPostMatch.util.test.ts src/utils/teamApplyBuddyPreview.test.ts

# 后端
cd sync-app-backend && CI=true npm test -- --watchman=false --testPathPattern="post-lifecycle-full-flow|buddy-post-write-flow|buddy-post-match|post-team-pair|PostInteractionService.applyToPost"
```
