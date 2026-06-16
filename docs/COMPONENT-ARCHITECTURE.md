# 组件与类型分层

> 改造进度与 Button 待办清单见 [FRONTEND-REFACTOR-CHECKLIST.md](./FRONTEND-REFACTOR-CHECKLIST.md#组件架构)。

## 四层放置

| 层级 | 路径 | 用途 |
|------|------|------|
| UI 原语 | `src/components/ui/` | 无业务语义；包装 Taro 原语 + BEM/`cn` |
| 跨页业务 | `src/components/`（`auth/`、`ai-chat/`、`profile/`、`navigation/` 等） | 多 Tab / 多分包复用的轻量 UI |
| 活动域 | `src/domains/`（`travel-plan/`、`performance-itinerary/`、`live-info/`、`travel-guide/`、`partner-feed/`） | 与后端 ActivityExperience 对齐的重逻辑域 |
| 页面壳 | `src/pages/**/`、`src/package*/pages/**/` | 路由入口、薄编排 |

### 依赖方向（必须遵守）

```text
pages / package pages  →  domains/*  →  components/*  →  components/ui
@sync/*-contracts、types/*  ← 任意层（类型不反向依赖 pages）
```

主包 Tab **不得**直接 import `domains/*` 内重组件（见 `scripts/verify-bundle-boundaries.mjs`）。

- `components/**` **不得** import `pages/**` 或 `package*/pages/**`

## 类型

| 文件 | 内容 |
|------|------|
| `src/types/backend.ts` | API 契约与 DTO（与后端对齐） |
| `src/types/countdown.ts` | 倒计时展示类型（`CountdownPart`） |

## 领域模块

### Profile

- 目录：`src/components/profile/`
- 对外 API：`src/components/profile/index.ts`（barrel）
- 页面入口：`src/pages/profile/index.tsx`（仅编排与 Tab 壳）
- 样式：`src/components/profile/profile.scss`（分包页 `import` 同一路径）

Barrel 导出分包/活动详情需要的组件与逻辑；仅主 profile 页使用的块（如 `ProfileActionCard`）不放入 barrel。

纯函数/常量单测优先直引子模块（如 `profileSummaryUtils.ts`），避免 `import from '@/components/profile'` 拉起 Taro 组件树。

### Navigation（跨页导航壳）

- 目录：`src/components/navigation/`
- 内容：`PageNavigation`、`TabPageHeader`、`BottomNav`（`BottomNavSlot`）、`NavigationLoadingOverlay`
- Barrel：`src/components/navigation/index.ts`（可选；页面也可直引子模块）

### Event

- 目录：`src/components/event/`
- 内容：`EventCard`、`ActivityStatusBadge`
- Barrel：`src/components/event/index.ts`

### 活动详情

- 页面：`packageEvent/pages/event-detail/index.tsx`（薄壳：路由编排、live-info lazy 包装）
- 编排：`useEventDetailPage.ts`
- 域：`domains/partner-feed/`（活动详情 AI 咨询入口、行程菜单）、`domains/live-info/`、`domains/travel-guide/`

## 决策表

| 你要加的是… | 放哪 |
|-------------|------|
| 通用按钮/输入，无业务文案 | `components/ui/` |
| 只在首页用的区块 | `pages/index/components/` |
| 个人中心 + profile 分包共用 | `components/profile/` |
| 活动详情 AI 咨询 / 行程入口 | `domains/partner-feed/` |
| 活动详情页级弹窗 / fallback | `packageEvent/.../event-detail/components/` |
| 顶栏 / 底栏 / Tab 页头 | `components/navigation/` |
| 活动列表卡片 / 状态徽章 | `components/event/` |

**何时从页面局部升格？** 当**第二个消费者**（含分包页）需要 import 时，再迁入对应域（`profile/`、`navigation/`、`event/` 等）并改走 barrel。

## Input 约定

业务输入框优先 `components/ui/Input`（内部包装 Taro `Input`）。支持 Taro 的 `onInput`（`e.detail.value`）、`onConfirm` 与 `variant`（如 `events-search`、`chat`）。无 variant 时仅透传 `className`。

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

- [DATA-LAYER.md](./DATA-LAYER.md) — REST / React Query 分层与 P0 身份切换
- [CONTRIBUTING.md](./CONTRIBUTING.md) — 分支与 `npm run check`
- [API.md](./API.md) — 接口契约
