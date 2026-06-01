# 组件与类型分层

> 改造进度与 Button 待办清单见 [FRONTEND-REFACTOR-CHECKLIST.md](./FRONTEND-REFACTOR-CHECKLIST.md#组件架构)。

## 三层放置

| 层级 | 路径 | 用途 |
|------|------|------|
| UI 原语 | `src/components/ui/` | 无业务语义；包装 Taro 原语 + BEM/`cn` |
| 跨页业务 | `src/components/`（`auth/`、`ai-chat/`、`profile/`、`Post*` 等） | 多页面/分包复用的领域 UI |
| 页面局部 | `src/pages/**/components/`、`src/package*/pages/**/components/` | 仅单页或单功能使用 |

### 依赖方向（必须遵守）

```text
pages / package pages  →  components/*  →  components/ui
types/post.ts、types/backend.ts  ← 任意层（类型不反向依赖 pages）
```

- `components/**` **不得** import `pages/**` 或 `package*/pages/**`
- 帖子类型从 `src/types/post.ts` 导入，不从 `pages/index/homeData` 等页面路径导入

## 类型

| 文件 | 内容 |
|------|------|
| `src/types/backend.ts` | API 契约与 DTO（与后端对齐） |
| `src/types/post.ts` | 帖子相关类型的 UI 层统一导出入口 |
| `src/types/home.ts` | 首页展示类型（`CountdownPart`、`FeaturedEvent`） |

`HomeFeedPost`（首页热帖）与 `EventDetailPost`（活动详情帖）字段不同，**不要**强行合并为单一 interface；需要展示层适配时用 mapper（如 `utils/eventPostDisplay.ts`）。

## 领域模块

### Profile

- 目录：`src/components/profile/`
- 对外 API：`src/components/profile/index.ts`（barrel）
- 页面入口：`src/pages/profile/index.tsx`（仅编排与 Tab 壳）
- 样式：`src/components/profile/profile.scss`（分包页 `import` 同一路径）

Barrel 导出分包/活动详情需要的组件与逻辑；仅主 profile 页使用的块（如 `ProfileActionCard`）不放入 barrel。

纯函数/常量单测优先直引子模块（如 `profilePackageData.ts`），避免 `import from '@/components/profile'` 拉起 Taro 组件树。

### 活动详情

- 页面：`packageEvent/pages/event-detail/index.tsx`
- 局部组件：`packageEvent/pages/event-detail/components/`（如 `EventDetailComposerSection`、`EventPostsVirtualList`）

## 决策表

| 你要加的是… | 放哪 |
|-------------|------|
| 通用按钮/输入，无业务文案 | `components/ui/` |
| 只在首页用的区块 | `pages/index/components/` |
| 个人中心 + profile 分包共用 | `components/profile/` |
| 只在活动详情用的块 | `packageEvent/.../event-detail/components/` |
| 跨多 Tab/多活动的帖子 UI | `components/` 根目录 `Post*` / `FeedPostList` |
| 新帖子 TypeScript 类型 | `types/post.ts` |

**何时从页面局部升格到 `components/profile/`？** 当第二个页面（含分包页）需要 import 时，立即迁入 profile 域并改走 barrel。

## Button 约定

业务代码优先：

```ts
import { Button } from '@/components/ui';
```

`Button` 是对 Taro `<Button>` 的薄封装，保留原有 `className` / `hoverClass` 即可。

### 允许直接使用 Taro `Button` 的例外

1. `components/ui/Button.tsx` 实现本身
2. 需要 `open-type`（如 `getPhoneNumber`）且 wrapper 尚未透传该属性
3. 第三方/遗留代码在专门的重构 PR 前（见 checklist「组件债」）

### 迁移时注意

- 不要改 BEM class 名；必要时用 `block` + `element` + `modifiers`（见 `Button` 的 JSDoc）
- 图标按钮、tab 按钮、清空按钮均属业务 UI，仍应走 `components/ui`

## 相关文档

- [CONTRIBUTING.md](./CONTRIBUTING.md) — 分支与 `npm run check`
- [API.md](./API.md) — 接口契约
