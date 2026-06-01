# 数据层（登录前）

REST 与 React Query 的分层约定，便于 P0 鉴权时只改少数入口。

## 请求身份

| 模块                                                    | 职责                                                                                                         |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [`api/requestContext.ts`](../src/api/requestContext.ts) | **`ownerQueryParams()`** — 无 token 时 demo Query；**有 Bearer 时 `{}`** |
| [`api/handleApiUnauthorized.ts`](../src/api/handleApiUnauthorized.ts) | 401 清 storage + toast（仅当请求前已有 token） |
| [`utils/apiClient.ts`](../src/utils/apiClient.ts)       | **`getAuthHeaders()`** + 解析 envelope 401 |
| [`utils/session.ts`](../src/utils/session.ts)           | `getClientUserId()` / `getClientUserName()` — JWT-aware |

辅助函数：

- `mergeOwnerQueryParams(extra)` — 合并 limit/cursor 等
- `ownerQueryParamsWithActivity(activityLegacyId?)` — profile / entitlements 作用域
- `resolveRequestUserId()` — React Query `queryKey` 中的用户维度
- `notificationQueryParams()` — 通知 API：有 Bearer 时 `undefined`（不传 `userId`）；无 token 时 `{ userId }`

## REST 按域拆分

实现目录 [`src/api/sync/`](../src/api/sync/)：

| 文件               | 路径前缀               |
| ------------------ | ---------------------- |
| `activities.ts`    | `/activities`, `/home` |
| `users.ts`         | `/users`, `/reports`   |
| `posts.ts`         | `/posts`               |
| `profile.ts`       | `/profile`             |
| `notifications.ts` | `/notifications`       |
| `chat.ts`          | `/chat/sessions`       |
| `liveInfo.ts`      | `.../live-info`        |
| `itinerary.ts`     | `.../itinerary`        |

对外仍可从 [`api/syncApi.ts`](../src/api/syncApi.ts) barrel 导入（`import { fetchX } from '../api/syncApi'`）。

## React Query hooks

实现目录 [`src/hooks/sync/`](../src/hooks/sync/)：

| 文件               | 内容                                        |
| ------------------ | ------------------------------------------- |
| `activities.ts`    | 活动列表、首页 summary、详情、报名          |
| `posts.ts`         | 热帖、活动帖、评论、帖互动 mutation         |
| `profile.ts`       | 个人中心、权益、套餐（`profileApiEnabled`） |
| `notifications.ts` | 通知列表与已读                              |

对外仍从 [`hooks/useSyncApi.ts`](../src/hooks/useSyncApi.ts) 导出。

## P0-H5（前端已实现）

- [x] `ownerQueryParams()` — 有 Bearer 时不发 `userId`/`authorName`
- [x] `apiClient` / `uploadImage` — 401 清 session + 后端 `message` toast
- [x] 删除 `session.ownerParams()`；REST 统一走 `api/sync` + `requestContext`

后续（与后端 Guard 对齐时）：生产关闭 demo Query、AI WebSocket body 去 `userId`。

## 依赖方向

```text
pages / components  →  hooks/sync  →  api/sync  →  apiClient
                                    ↘ requestContext → session / authStorage
```

`hooks/sync` **不得** import `pages/**`。
