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
import { useEventDetailBuddyPost } from './useEventDetailBuddyPost';
import { useEventDetailTravelGuide } from './useEventDetailTravelGuide';

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
  const travelGuide = useEventDetailTravelGuide(eventId);
  const currentUserQuery = useCurrentUserQuery();
  const profileUser = useResolvedProfile();
  const displayUserName = currentUserQuery.data?.name ?? profileUser.name ?? '用户';

  const apiEnabled = isApiEnabled();

  const [contentTab, setContentTab] = useState<EventDetailTabId>('posts');

  const postsQuery = useEventPostsInfiniteQuery(eventId, {
    enabled: feedReady,
    anchorPostId: highlightPostId || undefined,
  });

  const buddyPost = useEventDetailBuddyPost(eventId, {
    authorName: displayUserName,
    authorAvatar: currentUserQuery.data?.avatar,
    refreshPosts: postsQuery.refetch,
  });

  const ai = useEventDetailAiActions(eventId, {
    openGuideSheet: travelGuide.openGuideSheet,
    openBuddyPostSheet: buddyPost.openBuddyPostSheet,
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

  const postsLoading = !feedReady || postsQuery.isLoading;
  const showPostsEnd =
    contentTab === 'posts' &&
    posts.totalPostCount > 0 &&
    !postsLoading &&
    !posts.hasMoreVisiblePosts &&
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
    handleOpenAiGuide: ai.handleOpenAiGuide,
    handleOpenBuddyPost: ai.handleOpenBuddyPost,
    handleOpenExclusiveItinerary: ai.handleOpenExclusiveItinerary,
    buddyPostSheetOpen: buddyPost.buddyPostSheetOpen,
    closeBuddyPostSheet: buddyPost.closeBuddyPostSheet,
    handleBuddyPostSheetSubmit: buddyPost.handleBuddyPostSheetSubmit,
    buddyPostActivityDate: buddyPost.buddyPostActivityDate,
    buddyPostActivityTitle: buddyPost.buddyPostActivityTitle,
    isBuddyPostPublishing: buddyPost.isBuddyPostPublishing,
    guideSheetOpen: travelGuide.guideSheetOpen,
    closeGuideSheet: travelGuide.closeGuideSheet,
    handleGuideSheetSubmit: travelGuide.handleGuideSheetSubmit,
    guideDefaultNights: travelGuide.guideDefaultNights,
    guideEventCity: travelGuide.guideEventCity,
    invalidEventId: route.invalidEventId,
    entitlements,
  };
}
