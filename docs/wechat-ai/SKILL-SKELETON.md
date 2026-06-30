# 微信 AI · SKILL 分包骨架（P3 内测分支）

> P0 仅文档占位；P3 在独立分支创建 `packageAgentSkills/`。  
> 原子接口 **必须** 调用 `AgentCapabilitiesService`，Schema 对齐 `@sync/agent-capabilities-contracts`。

## 目录结构

```bash
packageAgentSkills/                    # 独立分包 root
├── shared/
│   ├── callAgentCapability.js
│   ├── componentModelContext.js
│   ├── cardTokens.wxss
│   ├── searchContext.js
│   ├── wechatSubscribe.js
│   └── wechatAiBuildConfig.json       # 构建期 materialize
├── festival-search-skill/
│   ├── SKILL.md
│   ├── mcp.json                       # setSearchContext · searchFestivals · getEvent · getLineup
│   ├── index.js
│   ├── apis/
│   └── components/
│       ├── event-compare-strip/       # searchFestivals
│       ├── event-card/                # getEvent
│       └── artist-lineup-strip/       # getLineup
├── recruit-discovery-skill/
│   └── components/recruit-list-card/
├── recruit-draft-skill/
│   └── components/draft-candidates-card/
└── festival-prep-skill/
    └── components/prep-status-card/
```

## app.json 片段

见 [AGENT-ROADMAP.md §6.3](../AGENT-ROADMAP.md#63-小程序-appjson-扩展p3-分支)。

## 原子接口实现模板

```javascript
// apis/searchPublicRecruits.js — thin wrapper（经 shared/callAgentCapability）
async function searchPublicRecruits({ activityLegacyId, query, prefs }) {
  console.info('[ai-mode] searchPublicRecruits 入口', { activityLegacyId, query });
  const result = await requestAgentCapability({
    path: '/agent-capabilities/search-public-recruits',
    method: 'POST',
    data: { activityLegacyId, query, prefs },
  });
  if (result.isError) {
    console.info('[ai-mode] searchPublicRecruits 失败');
    return result;
  }
  console.info('[ai-mode] searchPublicRecruits 出口', result.payload);
  return okResponse(`已检索到 …`, result.payload);
}
```

## SKILL.md 必备章节（官方五段式）

路由说明 **不写** 驼峰 `apiName` / `inputSchema` / MCP 字段名，按 [wxa-skills-generate CODE_TEMPLATES](https://github.com/wechat-miniprogram/ai-mode-skills/blob/master/wxa-skills-generate/references/CODE_TEMPLATES.md) 第五节：

1. `# 能力域定位`（一句话）
2. `## 触发场景`（3–6 条用户原话）
3. `## 不适用范围`（配对/代发帖等红线）
4. `## 前置条件`（公开检索免登录；写操作需登录）
5. `## 使用顺序`（自然语言描述先后，不列接口名）

## 组件交互（`api/call` 与半屏）

原子组件内 **禁止** `wx.navigateTo` / `switchTab`。共享辅助见 `packageAgentSkills/shared/componentModelContext.js`：

| 场景 | 做法 |
|------|------|
| 对话内再调同 skill 原子接口 | `sendApiCall(instance, componentName, text, apiName, args)` → `sendFollowUpMessage` + `api/call` |
| 进入小程序页面（半屏） | `openDetailPage` / `preloadDetailPage` |
| 分享 / 地图 / 预览 | `shareEventInTap` / `openEventLocation` / `previewImageUrl` |
| 用户点选回传模型 | `notifyModelSelection` → `updateModelContext` |
| 无目标页、仅引导对话 | `sendTextFollowUp` |

示例：`event-compare-strip` 点选 → `getEvent`；`event-card` 分享/地图；`artist-lineup-strip` 横滑艺人。招募/草稿/准备卡 tap → `openDetailPage`。

设计规范见 [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)。

卡片根节点须设 `hover-class`（禁用 `:active` 等伪类）。

## 原子组件约束（官方）

- 四件套：`index.js` / `index.json` / `index.wxml` / **`index.wxss`**（非 scss）
- 卡片宽高比 4:1～1:1；仅 tap 事件；禁用 `:active` 等伪类（见 [VALIDATE_RULES V005/V006](https://github.com/wechat-miniprogram/ai-mode-skills/blob/master/wxa-skills-validate/references/VALIDATE_RULES.md)）
- `mcp.json` 中 `components[].relatedPage` 必须以 `/` 开头
- 发布类操作 **不得** 在卡片内一键完成 → 引导进小程序 Sheet

## 校验与调试

见 [VALIDATION.md](./VALIDATION.md)：`npm run validate:wechat-ai` + Nightly「小程序 AI 编译」。
