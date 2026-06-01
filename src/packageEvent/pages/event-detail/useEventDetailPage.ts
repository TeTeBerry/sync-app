import { useState } from 'react';
import { useContactUnlockQuota } from '../../../hooks/useContactUnlockQuota';
import { useActivityDetailQuery, useCurrentUserQuery } from '../../../hooks/useSyncApi';
import { useEventPostsInfiniteQuery } from '../../../hooks/useEventPostsInfiniteQuery';
import { isApiEnabled } from '../../../constants/api';
import { useEventDetailPosts } from './useEventDetailPosts';
import { useEventDetailLive } from './useEventDetailLive';
import type { EventDetailTabId } from './components/EventDetailContentTabs';
import { useResolvedProfile } from '../../../hooks/useResolvedProfile';
import type { ConfirmDialogOptions } from '../../../hooks/useConfirmDialog';
import { useEventDetailRoute } from './useEventDetailRoute';
import { useEventDetailActivityHeader } from './useEventDetailActivityHeader';
import { useEventDetailEntitlements } from './useEventDetailEntitlements';
import { useEventDetailAiActions } from './useEventDetailAiActions';

export type UseEventDetailPageOptions = {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
};

export function useEventDetailPage({ confirm }: UseEventDetailPageOptions) {
  const route = useEventDetailRoute();
  const {
    eventId,
    highlightPostId,
    scrollTop,
    setScrollTop,
    feedReady,
    composerReady,
  } = route;

  const activityQuery = useActivityDetailQuery(eventId);
  const header = useEventDetailActivityHeader({
    eventId,
    hasValidEventId: route.hasValidEventId,
    activityQuery,
  });

  const contactUnlockQuota = useContactUnlockQuota(eventId);
  const { entitlements, openContactUnlockExhaustedModal } =
    useEventDetailEntitlements(eventId);
  const ai = useEventDetailAiActions(eventId);

  const currentUserQuery = useCurrentUserQuery();
  const profileUser = useResolvedProfile();
  const apiEnabled = isApiEnabled();

  const [contentTab, setContentTab] = useState<EventDetailTabId>('posts');

  const postsQuery = useEventPostsInfiniteQuery(eventId, {
    enabled: feedReady,
    anchorPostId: highlightPostId || undefined,
  });

  const live = useEventDetailLive({
    contentTab,
    showHeaderSkeleton: header.showHeaderSkeleton,
  });

  const posts = useEventDetailPosts({
    eventId,
    contentTab,
    postsQuery,
    apiEnabled,
    confirm,
    contactUnlockQuota,
    openContactUnlockExhaustedModal,
    setScrollTop,
  });

  const displayUserName = currentUserQuery.data?.name ?? profileUser.name ?? '用户';
  const postsLoading = !feedReady || postsQuery.isLoading;
  const showPostsEnd =
    contentTab === 'posts' &&
    posts.postItems.length > 0 &&
    !postsLoading &&
    !postsQuery.hasMore &&
    !postsQuery.isLoadingMore;

  return {
    ...header,
    eventId,
    highlightPostId,
    scrollTop,
    composerReady,
    prompt: ai.prompt,
    setPrompt: ai.setPrompt,
    contentTab,
    setContentTab,
    live,
    posts,
    postsLoading,
    showPostsEnd,
    apiEnabled,
    currentUserAvatar: currentUserQuery.data?.avatar,
    postsQuery,
    displayUserName,
    openAi: ai.openAi,
    handleShortcutTag: ai.handleShortcutTag,
    handleOpenExclusiveItinerary: ai.handleOpenExclusiveItinerary,
    invalidEventId: route.invalidEventId,
    entitlements,
  };
}
