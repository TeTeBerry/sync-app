# 微信 AI · SKILL 分包骨架（P3 内测分支）

> P0 仅文档占位；P3 在独立分支创建 `packageAgentSkills/`。  
> 原子接口 **必须** 调用 `AgentCapabilitiesService`，Schema 对齐 `@sync/agent-capabilities-contracts`。

## 目录结构

```bash
packageAgentSkills/                    # 独立分包 root
├── festival-search-skill/
│   ├── SKILL.md                       # 业务流程 · 意图分流 · 跨接口约束
│   ├── mcp.json                       # searchFestivals · getEvent · getLineup
│   ├── index.js                       # wx.modelContext.createSkill + registerAPI
│   ├── apis/
│   │   ├── searchFestivals.js
│   │   ├── getEvent.js
│   │   └── getLineup.js
│   └── components/
│       └── event-card/
├── recruit-discovery-skill/
│   ├── SKILL.md
│   ├── mcp.json                       # searchPublicRecruits
│   ├── apis/searchPublicRecruits.js
│   └── components/recruit-list-card/
├── recruit-draft-skill/
│   ├── SKILL.md                       # 强调：仅草稿，须进小程序确认
│   ├── mcp.json                       # draftRecruitPost（无 publish）
│   └── components/draft-candidates-card/
└── festival-prep-skill/
    ├── mcp.json                       # subscribeLineupUpdates · generateTravelGuide
    └── components/prep-status-card/
```

## app.json 片段

见 [AGENT-ROADMAP.md §6.3](../AGENT-ROADMAP.md#63-小程序-appjson-扩展p3-分支)。

## 原子接口实现模板

```javascript
// apis/searchPublicRecruits.js — thin wrapper
async function searchPublicRecruits({ activityLegacyId, query }) {
  const res = await wx.request({
    url: `${API_BASE}/agent-capabilities/search-public-recruits`,
    method: 'POST',
    header: { Authorization: `Bearer ${token}` },
    data: { activityLegacyId, query },
  });
  const data = res.data?.data;
  return {
    isError: false,
    content: [
      {
        type: 'text',
        text: `已检索到 ${data.totalMatched} 条公开招募帖。平台不保证组满。接下来为用户展示招募列表卡片。`,
      },
    ],
    structuredContent: data,
  };
}
```

## SKILL.md 必备章节

1. 适用意图与不适用意图
2. 接口调用顺序（与 mcp.json 节点名一致）
3. 合规话术（禁止匹配/配对）
4. 登录态缺失时的兜底
5. 与半屏页面 / `sendFollowUpMessage` 的衔接

## 原子组件约束（官方）

- 卡片宽高比 4:1～1:1；仅 tap 事件
- `relatedPage` 必填 → 活动详情
- 发布类操作 **不得** 在卡片内一键完成 → 引导进小程序 Sheet
