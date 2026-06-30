# 微信 AI 接入检查清单

> P0：完成「文档 + 后端原子能力门面」项。  
> P3：完成「SKILL 分包 + 内测提审」项。

## P0 · 开放入口预留（主分支可合入）

- [x] `@sync/agent-capabilities-contracts` 包创建
- [x] `AgentCapabilitiesService` 门面 + 单测
- [x] `docs/wechat-ai/AGENTS.md` 合规提示词定稿
- [x] `docs/wechat-ai/page-meta.json` 与现网路由对齐
- [x] REST 别名端点：`/api/agent-capabilities/*` 供 wx 原子接口调用
- [x] **未** 修改主分支 `app.json` 添加 `agent` 字段（`WECHAT_AI_SKILLS=1` 构建开关）
- [x] **未** 将 `packageAgentSkills/` agent 配置合入 main 提审包（构建开关隔离）

## 内测申请

- [ ] 小程序管理后台 → **基础功能 → AI 能力** → 选择 **开发模式**
- [ ] 或在 **微信开发者助手 → 管理 → 微信 AI 管理** 申请
- [ ] 下载 **微信开发者工具 Nightly** 用于 SKILL 调试

## P3 · SKILL 开发（独立分支 `feat/wechat-ai-skills`）

- [x] 创建 `packageAgentSkills/` 独立分包
- [x] 每个 SKILL：`SKILL.md` + `mcp.json` + `index.js` + apis + components
- [x] `mcp.json` 官方格式（`inputSchema` / `outputSchema` / `relatedPage`）
- [x] 原子组件 `index.wxss` 四件套（对齐 wxa-skills-validate V012）
- [x] 原子接口调 `AgentCapabilitiesService` REST（`shared/callAgentCapability.js`）
- [x] 原子组件 `relatedPage` 指向活动详情 / 阵容页
- [x] 活动详情：`wx.openAgent` 入口（`useWechatAgentEntry` + `checkIsSupportAgent` 守卫）
- [ ] 运行 `npm run validate:wechat-ai`（需 Nightly + 服务端口）见 [VALIDATION.md](./VALIDATION.md)
- [ ] 知识库（可选）：上传 PLUR / 合规 FAQ PDF 至公众平台 AI 知识库

## 提审隔离

- [ ] 官方允许前：**勿** 将 `agent` / `packageAgentSkills` 合入 `main` 提审
- [ ] 内测包使用体验版 / 开发版验证（`npm run dev:weapp:ai` / `npm run build:weapp:ai`）
- [x] 正式版用户路径仍仅为小程序 + 推送（P0 Goal 闭环）

## 合规自检

```bash
rg '联系队友|配对成功|平台担保|智能配对|buddy-matching|publishRecruit' \
  packageAgentSkills/ docs/wechat-ai/
```

- [x] 无 `publishRecruitPost` / `publishPost` 原子接口
- [x] 所有 recruit 相关 `description` 含「公开招募」「非配对」
- [x] 草稿 SKILL 含「须用户确认后发布」

## 参考链接

- [小程序 AI 开发模式接入指南](https://developers.weixin.qq.com/miniprogram/dev/ai/guide)
- [接入方式（SKILL / 原子接口 / 原子组件）](https://developers.weixin.qq.com/miniprogram/dev/ai/integration.html)
- [调试指南 · 开发辅助（SkillHub / validate / eval）](https://developers.weixin.qq.com/miniprogram/dev/ai/debugging.html#三、开发辅助)
- [官方 ai-mode-skills 工具集](https://github.com/wechat-miniprogram/ai-mode-skills)
- [本仓库校验说明](./VALIDATION.md)
- [官方 ai-mode-skills 对照](./OFFICIAL-TOOLCHAIN.md)
- [AGENT-ROADMAP.md](../AGENT-ROADMAP.md)
