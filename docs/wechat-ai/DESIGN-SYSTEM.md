# 微信 AI · 原子组件设计规范

> 与主包 [`EventCard.scss`](../../src/components/event/EventCard.scss) 对齐。  
> 实现：`packageAgentSkills/shared/cardTokens.wxss`

## 视觉语言

每张卡统一 **三段式结构**：

```
┌─ card-accent-bar（粉→青渐变顶条）────────────┐
│  card-kicker + 主标题 + 元信息 / 横滑内容区   │
├─ card-foot-bar（深色底栏 + 粉药丸 CTA）─────┤
└ card-disclaimer ────────────────────────────┘
```

| 元素 | 用途 |
|------|------|
| `card-accent-bar` | 品牌识别，霓虹渐变顶条 |
| `card-kicker` | 区块眉标（LINEUP / AI 草稿） |
| `card-count-badge` | 数量胶囊 |
| `card-status-chip` | 准备态 / 成功 / 错误 |
| `card-cta-pill` | 主行动（粉底白字，非 button） |
| `card-cta-ghost` | 次要行动（分享 / 场地） |
| `card-quote-panel` | 招募摘要 / 草稿预览引用区 |
| `card-info-callout` | 微信授权等提示（青色左边线） |

## 只读卡片分工

| 组件 | 表面 | 特色 |
|------|------|------|
| `event-card` | `card-surface` | 封面占位渐变 + 底栏粉药丸 |
| `search-results-card` | `card-surface` | 单场资讯 / 多场对比横滑 |
| `event-compare-strip` | `card-surface` | （保留）竖版海报 tile 横滑 |
| `artist-lineup-strip` | `card-surface-list` | 艺人头像霓虹描边 |
| `recruit-list-card` | `card-surface-list` | 活动摘要 + 招募摘要引用框 |

## 约束

- 不用 `button` / `open-type`；CTA 用 `view` + `card-cta-pill`
- 不用 `:active` / `:hover`；按压用 `hover-class="card-hover"`
- 横滑仅 `scroll-view scroll-x="true"`
