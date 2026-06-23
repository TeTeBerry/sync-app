# Spike: TanStack Query 迁移评估（WeApp）

> **Story**: US-ARCH-15 · P3 · FE  
> **日期**: 2026-06-24  
> **状态**: Spike 完成，待团队确认决策

---

## 背景与触发条件

自研 [`useApiQuery`](../src/hooks/useApiQuery.ts) 已覆盖 in-memory cache、请求 dedupe、prefix invalidation、optimistic patch（`setCacheData` / `broadcastCacheData`）与 prefetch。当前 pain points：

| 痛点 | 说明 |
|------|------|
| Mutation 无标准 | 各域手写 `async fn` + cache patch + invalidate（如 [`notifications.ts`](../src/hooks/sync/notifications.ts)） |
| 无 DevTools | 排查 cache 状态需 console / 读源码 |
| 乐观更新分散 | 每个域独立 `*Cache.ts` 模块 |
| 无限滚动 | 自研 [`useApiInfiniteQuery`](../src/hooks/useApiInfiniteQuery.ts)，无社区生态参考 |

**触发条件**（ARCH story）：自研缓存 bug 频发；或需要 mutation/devtools/乐观更新标准化。

**前置依赖**：US-ARCH-05 缓存分层 ✅ — notifications 属 Layer-1（进程内 server state），不涉及 Layer-3 持久化（见 [DATA-LAYER.md §缓存分层](../DATA-LAYER.md#缓存分层)）。

---

## 自研 vs TanStack 能力矩阵

| 自研 `useApiQuery` | TanStack Query 等价 | 备注 |
|--------------------|---------------------|------|
| `globalCache` + `staleTime` | `QueryClient` + `staleTime` | 行为接近 |
| `inflightByKey` dedupe | 内置 request deduplication | TanStack 默认开启 |
| `invalidateCache(['notifications'])` | `queryClient.invalidateQueries({ queryKey: ['notifications'] })` | prefix 匹配需 `queryKey` 设计一致 |
| `setCacheData` + `broadcastCacheData` | `queryClient.setQueryData` | TanStack 自动通知订阅者 |
| `prefetchToCache` | `queryClient.prefetchQuery` | launch prefetch 可迁移 |
| `useStaleBackgroundRefetch` | 无直接等价 | 需保留 Taro `useDidShow` 适配层 |
| `useApiInfiniteQuery` | `useInfiniteQuery` | cursor 分页可迁移 |
| 手写 mutation helpers | `useMutation` + `onMutate` / `onSettled` | 标准化 optimistic update |

---

## 包体对比（`npm run build:weapp:size`）

测量环境：Taro 4.2.0 · production · 2026-06-24

| 指标 | Baseline（自研） | + TanStack POC | Delta |
|------|-----------------|----------------|-------|
| 主包 (main) | 849.8 KB | 886.0 KB | **+36.2 KB (+4.3%)** |
| 分包 packageEvent | 420.4 KB | 420.4 KB | 0 |
| 分包 packageProfile | 94.0 KB | 94.0 KB | 0 |
| 合计 (不含 .map) | 1364.9 KB | 1401.2 KB | **+36.3 KB (+2.7%)** |

POC 范围：`QueryClientProvider` + notifications 域 2 query + 4 mutation（临时分支测量，**未合并 main**）。

阈值参考（[BUNDLE-SIZE.md](../BUNDLE-SIZE.md)）：主包 soft limit 1100 KB，合计 4500 KB。当前 delta 占主包余量约 **14%**（849.8 → 1100 余 250 KB 中的 36 KB）。

---

## WeApp 特有风险

| 风险 | 影响 | 缓解 |
|------|------|------|
| 无 `refetchOnWindowFocus` | 小程序无 window focus 事件 | 保留 `useStaleBackgroundRefetch` + `useDidShow` |
| QueryClient 内存生命周期 | 小程序单页长驻，cache 可能累积 | 设 `gcTime`（原 `cacheTime`）+ logout 时 `queryClient.clear()` |
| DevTools 不可用 | 生产无法 attach | 仅 H5 dev 可用；WeApp 仍靠 logging |
| 双栈并存 | 混合模式下两套 cache 不互通 | 域级隔离：要么全 TanStack 要么全自研，避免交叉 invalidate |
| Tree-shaking | `@tanstack/react-query` core ~12 KB gzip，runtime 更大 | 仅引入必要 API；避免 `@tanstack/react-query-devtools` |

---

## Notifications POC 设计（未合并，供参考）

**选型理由**：Layer-1 only、2 个简单 query、4 个 mutation、2 个 UI 消费方（首页 badge + 通知列表页）。

### QueryClientProvider

```tsx
// src/providers/QueryProvider.tsx（POC only）
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

export default function QueryProvider({ children }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
export { queryClient };
```

### Query hooks

```tsx
export function useNotificationsQuery() {
  const enabled = isLiveApi();
  const userId = resolveRequestUserId();
  return useQuery({
    queryKey: notificationListQueryKey(userId),
    queryFn: () => fetchNotifications(),
    enabled,
    staleTime: 30_000,
  });
}
```

### Optimistic mutation（mark as read）

```tsx
export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (id) => {
      const userId = resolveRequestUserId();
      queryClient.setQueryData<AppNotification[]>(
        notificationListQueryKey(userId),
        (prev) => prev?.map((item) =>
          item.id === id ? { ...item, read: true } : item,
        ),
      );
      queryClient.setQueryData<number>(
        notificationUnreadQueryKey(userId),
        (count) => (count !== undefined ? Math.max(0, count - 1) : count),
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
```

### 与 `queryInvalidation.ts` 衔接

logout / 跨域 invalidation 需在 `clearSession` 路径增加：

```tsx
queryClient.removeQueries(); // 或 invalidateQueries({ queryKey: ['notifications'] })
```

自研 `invalidateNotifications()` 与 TanStack `invalidateQueries` 在混合模式下需双写，直到全量迁移。

---

## 决策建议

**推荐：混合（Hybrid）**

| 选项 | 评估 |
|------|------|
| **全量迁移** | 包体 +36 KB/域起步，15+ 调用点 rewrite 成本高；收益主要在 devtools / mutation 标准化 |
| **保持自研** | 零包体增量，现有能力已满足 90% 场景；mutation 标准缺失持续 |
| **混合 ✅** | 新域或 mutation 复杂域（如 posts CRUD、travel-guide 轮询）按需引入 TanStack；主路径（activities、home feed）继续自研；待包体预算明确或 bug 频发再扩 |

**行动项（若采纳混合）**：

1. 暂不合并 TanStack 到 main
2. 下一个 mutation 重构 PR（如 posts）时试点 `useMutation`
3. 提取共享 `useTaroStaleRefetch` 适配层
4. 每引入一域 re-run `build:weapp:size` 累计追踪

---

## 团队确认

- [ ] 决策：**迁移 / 保持自研 / 混合** — 建议 **混合**
- [ ] Reviewer: _______________
- [ ] 日期: _______________
