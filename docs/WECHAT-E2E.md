# 微信小程序 E2E 验收

> 自动化：`sync-app-backend` 的 `npm run smoke:suite:wait`（黄金路径 REST + Scene AI）。  
> 本文档为**人工**真机/开发者工具清单。  
> 对照：[API.md](./API.md#微信小程序) · [FRONTEND-REFACTOR-CHECKLIST.md](./FRONTEND-REFACTOR-CHECKLIST.md)

## 自动化 smoke（CI）

| 项 | 说明 |
|----|------|
| 命令 | `cd sync-app-backend && npm run smoke:suite:wait` |
| 覆盖 | REST 健康检查、活动/招募帖、出行攻略 async、Scene AI（`recruit_search`） |
| 环境 | 本地 `http://localhost:3000/api`；`SMOKE_API_BASE` 可覆盖 |

真机 / 体验版 HTTPS 合法域名配置完成后，再补跑下文 **6 步人工清单**。

## 环境

| 项 | 要求 |
|----|------|
| `TARO_APP_API_BASE_URL` | HTTPS 业务 API（公众平台 request 合法域名） |
| `TARO_APP_CLOUDBASE_ENV_ID` / `TARO_APP_CLOUD_RUN_SERVICE` | 云托管 callContainer（生产） |
| `WECHAT_MINI_APP_ID` / `WECHAT_MINI_APP_SECRET` | 已配置；`POST /api/auth/wechat` 可用 |
| 本地联调 | 开发者工具勾选 **不校验合法域名** 时可用 `http://` 局域网 |
| 真机 / 体验版 | ICP 备案 + HTTPS 合法域名（见 [API.md](./API.md#微信小程序)） |

## 流程

1. **退出登录**（若有）— 确认 `shouldSkipAutoLogin` 后不会自动 `wx.login`
2. **拦截登录** — 活动/个人页 `LoginPromptHero` → 授权昵称头像 → Bearer 写入 storage
3. **登录** — `loginWithWechat()` 仅 `wx.login` → openid，不弹 `getUserProfile`（按钮登录与 `ensureAuth` 一致）
4. **通知** — 打开通知列表；抓包确认请求仅含 Bearer（无 Query `userId`）
5. **Scene AI** — 活动详情招募区 AI 找队：输入关键词 → `POST /api/ai/scene-run`（`scene=recruit_search`）返回排序结果
6. **401 / 过期** — 将 storage 中 token 改为无效值 → 任意 REST → toast「登录已过期」且 session 清空

## 订阅消息（评论 / 活动更新）

### 公众平台配置

1. 登录 [微信公众平台](https://mp.weixin.qq.com/) → 功能 → 订阅消息。
2. 申请模板（类目需与小程序一致，一般为文娱 / 信息查询类）：
   - **评论提醒**：公共模板「新评论提醒」#25486（字段示例 `thing2` 评论内容、`time3` 时间）。
   - **评论回复**：公共模板「评论回复通知」#25365（字段示例 `thing2`、`time4`）。
   - **活动更新**：公共模板「活动预约提醒」#624（`thing2` 活动名称、`date3` 活动日期、`thing10` 变更说明、`amount21` 占位「详见活动页」— 非真实票价）
3. 将模板 ID 写入环境变量（前后端 ID 须一致）：

| 前端 `sync-app` | 后端 `sync-app-backend` |
|-----------------|-------------------------|
| `TARO_APP_SUBSCRIBE_TMPL_COMMENT` | `WECHAT_SUBSCRIBE_COMMENT_TEMPLATE_ID` |
| `TARO_APP_SUBSCRIBE_TMPL_COMMENT_REPLY` | `WECHAT_SUBSCRIBE_COMMENT_REPLY_TEMPLATE_ID` |
| `TARO_APP_SUBSCRIBE_TMPL_ACTIVITY_UPDATE` | `WECHAT_SUBSCRIBE_ACTIVITY_UPDATE_TEMPLATE_ID` |

活动更新字段映射（模板 #624「活动预约提醒」）：

- `WECHAT_SUBSCRIBE_ACTIVITY_FIELD_NAME` → `thing2`（活动名称）
- `WECHAT_SUBSCRIBE_ACTIVITY_FIELD_DATE` → `date3`（活动举办日期，取自活动 `date` 字段）
- `WECHAT_SUBSCRIBE_ACTIVITY_FIELD_LOCATION` → `thing10`（活动地点 / 地址）
- `WECHAT_SUBSCRIBE_ACTIVITY_FIELD_AMOUNT` → `amount21`（占位「详见活动页」，不展示票价）

### 真机验收

1. **评论/回复**：发帖或评论成功后弹出订阅授权；他人互动后收到微信服务通知，点击进入活动详情帖子评论区。
2. **活动更新**：专属时间表页在阵容未官宣时点击「订阅活动更新」并授权；后台活动信息变更后，已选择该活动且已授权用户收到订阅消息，点击进入专属时间表页。

## 失败排查

| 现象 | 检查 |
|------|------|
| REST 仍带 `userId=` Query | 是否真有 Bearer；`hasAuthenticatedRequest()` |
| Scene AI 401 | token 无效；重新微信登录 |
| callContainer 失败 | `TARO_APP_CLOUDBASE_ENV_ID` / `TARO_APP_CLOUD_RUN_SERVICE`；基础库 ≥ 2.23.0 |

## Checklist 勾选

在 [FRONTEND-REFACTOR-CHECKLIST.md](./FRONTEND-REFACTOR-CHECKLIST.md) **P0-Wx** 小节勾选「开发者工具真机预览全流程验收」。
