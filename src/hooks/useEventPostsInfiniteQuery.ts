import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  eventPostsPageQueryKey,
  EVENT_POSTS_PAGE_SIZE,
} from '../cache/eventPostsPageCache';
import { fetchPostsByActivityPage } from '../api/syncApi';
import { isLiveApi } from '../constants/api';
import type { EventDetailPost } from '../types/backend';
import { STALE_POSTS_FEED_MS } from '../constants/queryCache';
import { getClientUserId } from '../utils/session';
import { useApiInfiniteQuery } from './useApiInfiniteQuery';

function parsePostCreatedAtMs(createdAt?: string): number {
  if (!createdAt) return 0;
  const ms = Date.parse(createdAt);
  return Number.isFinite(ms) ? ms : 0;
}

/** Newest first — matches backend activity feed ordering. */
function sortPostsNewestFirst(posts: EventDetailPost[]): EventDetailPost[] {
  return [...posts].sort((a, b) => {
    const timeDiff =
      parsePostCreatedAtMs(b.createdAt) - parsePostCreatedAtMs(a.createdAt);
    if (timeDiff !== 0) return timeDiff;
    return b.id.localeCompare(a.id);
  });
}

function mergeFetchedPosts(
  fetched: EventDetailPost[],
  previous: EventDetailPost[],
): EventDetailPost[] {
  const byId = new Map<string, EventDetailPost>();
  for (const post of previous) {
    if (post.id.startsWith('pending-')) continue;
    byId.set(post.id, post);
  }
  for (const post of fetched) {
    byId.set(post.id, post);
  }
  return sortPostsNewestFirst([...byId.values()]);
}

function appendPostsPage(
  incoming: EventDetailPost[],
  previous: EventDetailPost[],
): EventDetailPost[] {
  const seen = new Set(previous.map((post) => post.id));
  const merged = [...previous];
  for (const post of incoming) {
    if (!seen.has(post.id)) {
      merged.push(post);
      seen.add(post.id);
    }
  }
  return merged;
}

export function useEventPostsInfiniteQuery(
  activityLegacyId?: number,
  options?: {
    enabled?: boolean;
    pageSize?: number;
    anchorPostId?: string;
  },
) {
  const tabEnabled = options?.enabled ?? true;
  const pageSize = options?.pageSize ?? EVENT_POSTS_PAGE_SIZE;
  const anchorPostId = options?.anchorPostId?.trim() || undefined;
  const apiEnabled = isLiveApi();
  const enabled =
    apiEnabled &&
    activityLegacyId != null &&
    !Number.isNaN(activityLegacyId) &&
    activityLegacyId > 0 &&
    tabEnabled;

  const userId = getClientUserId();
  const userIdRef = useRef(userId);

  const queryKey = useMemo(() => {
    if (activityLegacyId == null) {
      return ['posts', 'activity', 'disabled'];
    }
    if (anchorPostId) {
      return ['posts', 'activity', activityLegacyId, 'page', 'anchor', anchorPostId];
    }
    return [...eventPostsPageQueryKey(activityLegacyId)];
  }, [activityLegacyId, anchorPostId]);

  const queryFn = useCallback(
    ({ cursor }: { cursor?: string }) => {
      if (activityLegacyId == null) {
        return Promise.resolve({ items: [], hasMore: false });
      }
      return fetchPostsByActivityPage(activityLegacyId, {
        limit: pageSize,
        cursor,
        anchorPostId: cursor ? undefined : anchorPostId,
      });
    },
    [activityLegacyId, anchorPostId, pageSize],
  );

  const { refetch, ...rest } = useApiInfiniteQuery<EventDetailPost>({
    queryKey,
    queryFn,
    enabled,
    staleTime: STALE_POSTS_FEED_MS,
    ephemeral: Boolean(anchorPostId),
    mergeOnRefresh: mergeFetchedPosts,
    appendPage: appendPostsPage,
  });

  useEffect(() => {
    if (!enabled || userIdRef.current === userId) {
      userIdRef.current = userId;
      return;
    }
    userIdRef.current = userId;
    void refetch({ silent: true });
  }, [enabled, refetch, userId]);

  return { ...rest, refetch };
}
