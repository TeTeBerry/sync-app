# 微信 AI 接入检查清单

> P0：完成「文档 + 后端原子能力门面」项。  
> P3：完成「SKILL 分包 + 内测提审」项。

## P0 · 开放入口预留（主分支可合入）

- [ ] `@sync/agent-capabilities-contracts` 包创建
- [ ] `AgentCapabilitiesService` 门面 + 单测
- [ ] `docs/wechat-ai/AGENTS.md` 合规提示词定稿
- [ ] `docs/wechat-ai/page-meta.json` 与现网路由对齐
- [ ] REST 别名端点（可选）：`/api/agent-capabilities/*` 供未来 wx 原子接口调用
- [ ] **未** 修改主分支 `app.json` 添加 `agent` 字段
- [ ] **未** 添加 `packageAgentSkills/` 至提审包

## 内测申请

- [ ] 小程序管理后台 → **基础功能 → AI 能力** → 选择 **开发模式**
- [ ] 或在 **微信开发者助手 → 管理 → 微信 AI 管理** 申请
- [ ] 下载 **微信开发者工具 Nightly** 用于 SKILL 调试

## P3 · SKILL 开发（独立分支 `feat/wechat-ai-skills`）

- [ ] 创建 `packageAgentSkills/` 独立分包
- [ ] 每个 SKILL：`SKILL.md` + `mcp.json` + `index.js` + apis + components
- [ ] 原子接口仅调 `AgentCapabilitiesService`
- [ ] 原子组件 `relatedPage` 指向活动详情 / 阵容页
- [ ] 活动详情可选：`wx.openAgent` 入口（`wx.checkIsSupportAgent` 守卫）
- [ ] 知识库（可选）：上传 PLUR / 合规 FAQ PDF 至公众平台 AI 知识库

## 提审隔离

- [ ] 官方允许前：**勿** 将 `agent` / `packageAgentSkills` 合入 `main` 提审
- [ ] 内测包使用体验版 / 开发版验证
- [ ] 正式版用户路径仍仅为小程序 + 推送（P0 Goal 闭环）

## 合规自检

```bash
rg '联系队友|配对成功|平台担保|智能配对|buddy-matching|publishRecruit' \
  packageAgentSkills/ docs/wechat-ai/
```

- [ ] 无 `publishRecruitPost` / `publishPost` 原子接口
- [ ] 所有 recruit 相关 `description` 含「公开招募」「非配对」
- [ ] 草稿 SKILL 含「须用户确认后发布」

## 参考链接

- [小程序 AI 开发模式接入指南](https://developers.weixin.qq.com/miniprogram/dev/ai/guide)
- [接入方式（SKILL / 原子接口 / 原子组件）](https://developers.weixin.qq.com/miniprogram/dev/ai/integration.html)
- [AGENT-ROADMAP.md](../AGENT-ROADMAP.md)
