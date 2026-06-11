import { useCallback } from 'react';
import Taro from '@tarojs/taro';
import {
  invalidatePostQueries,
  useActivityDetailQuery,
  useCurrentUserQuery,
} from '../../../hooks/useSyncApi';
import { useEventPostsInfiniteQuery } from '../../../hooks/useEventPostsInfiniteQuery';
import { useEventDetailLive } from '@/domains/live-info';
import {
  useEventDetailPosts,
  useEventDetailBuddyPost,
  useEventDetailMessageBoard,
  type EventDetailTabId,
} from '@/domains/partner-feed';
import { useResolvedProfile } from '../../../hooks/useResolvedProfile';
import type { ConfirmDialogOptions } from '../../../hooks/useConfirmDialog';
import { useEventDetailRoute } from './useEventDetailRoute';
import { useEventDetailActivityHeader } from './useEventDetailActivityHeader';
import { useEventDetailScrollPreserve } from './useEventDetailScrollPreserve';
import { useEventDetailTravelGuide } from '@/domains/travel-guide';
import { goExclusiveItinerary, goMyItinerary } from '../../../utils/route';
import { useState } from 'react';

export type UseEventDetailPageOptions = {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
};

export function useEventDetailPage({ confirm }: UseEventDetailPageOptions) {
  const route = useEventDetailRoute();
  const {
    eventId,
    highlightPostId,
    scrollTop: routeScrollTop,
    setScrollTop,
    feedReady,
    composerReady,
    secondaryReady,
  } = route;

  const activityQuery = useActivityDetailQuery(eventId);
  const activityTitle = activityQuery.data?.name;
  const activityDate = activityQuery.data?.date;
  const activityLocation = activityQuery.data?.location;
  const header = useEventDetailActivityHeader({
    eventId,
    hasValidEventId: route.hasValidEventId,
    activityQuery,
  });

  const travelGuide = useEventDetailTravelGuide({
    eventId,
    activityDate,
    activityLocation,
  });
  const currentUserQuery = useCurrentUserQuery({ enabled: feedReady });
  const profileUser = useResolvedProfile();
  const displayUserName = currentUserQuery.data?.name ?? profileUser.name ?? '用户';

  const [contentTab, setContentTab] = useState<EventDetailTabId>('posts');

  const postsQuery = useEventPostsInfiniteQuery(eventId, {
    enabled: feedReady,
    anchorPostId: highlightPostId || undefined,
  });

  const messageBoard = useEventDetailMessageBoard(eventId, {
    activityTitle,
    authorName: displayUserName,
    authorAvatar: currentUserQuery.data?.avatar,
    refreshPosts: postsQuery.refetch,
    prependPost: postsQuery.prependItem,
    replacePost: postsQuery.replaceItem,
    removePost: postsQuery.removeItem,
    accountRiskEnabled: secondaryReady,
  });

  const templatePost = useEventDetailBuddyPost(eventId, {
    activityTitle,
    activityDate,
    activityLocation,
    authorName: displayUserName,
    authorAvatar: currentUserQuery.data?.avatar,
    refreshPosts: postsQuery.refetch,
    prependPost: postsQuery.prependItem,
    replacePost: postsQuery.replaceItem,
    removePost: postsQuery.removeItem,
    accountRiskEnabled: secondaryReady,
    hintOnSiteBadge: header.isOnSite,
  });

  const handleOnSiteCertifiedSuccess = useCallback(async () => {
    await invalidatePostQueries();
    try {
      await postsQuery.refetch({ silent: true });
    } catch {
      // Best-effort refresh so messages pick up on-site badge.
    }
  }, [postsQuery]);

  const live = useEventDetailLive({
    contentTab,
    showHeaderSkeleton: header.showHeaderSkeleton,
  });

  const { handleScroll, frozenTop, scrollFrozen } = useEventDetailScrollPreserve();

  const posts = useEventDetailPosts({
    contentTab,
    postsQuery,
    confirm,
    setScrollTop,
  });

  const scrollTop = scrollFrozen && frozenTop != null ? frozenTop : routeScrollTop;

  const postsLoading =
    !feedReady || (postsQuery.isLoading && postsQuery.items.length === 0);
  const showPostsEnd =
    contentTab === 'posts' &&
    posts.totalPostCount > 0 &&
    !postsLoading &&
    !posts.hasMoreVisiblePosts &&
    !postsQuery.hasMore &&
    !postsQuery.isLoadingMore;

  const assertValidEventId = useCallback(() => {
    if (!Number.isFinite(eventId) || eventId <= 0) {
      void Taro.showToast({ title: '活动信息无效', icon: 'none' });
      return false;
    }
    return true;
  }, [eventId]);

  const handleOpenMyItinerary = useCallback(() => {
    if (!assertValidEventId()) {
      return;
    }
    goMyItinerary(eventId);
  }, [assertValidEventId, eventId]);

  const handleOpenExclusiveItinerary = useCallback(() => {
    if (!assertValidEventId()) {
      return;
    }
    goExclusiveItinerary(eventId);
  }, [assertValidEventId, eventId]);

  const handlePublishMessage = useCallback(() => {
    void messageBoard.publishMessage();
  }, [messageBoard]);

  const isPublishing = messageBoard.isPublishing || templatePost.isBuddyPostPublishing;

  return {
    ...header,
    eventId,
    highlightPostId,
    scrollTop,
    scrollFrozen,
    handleScroll,
    composerReady,
    messageDraft: messageBoard.draft,
    setMessageDraft: messageBoard.setDraft,
    messageImageRefs: messageBoard.imageRefs,
    pickMessageImages: messageBoard.pickImages,
    removeMessageImage: messageBoard.removeImage,
    handlePublishMessage,
    messagePublishing: isPublishing,
    handleOpenTemplateSheet: templatePost.openBuddyPostSheet,
    publishOnsiteIntent: templatePost.publishOnsiteIntent,
    buddyPostSheetOpen: templatePost.buddyPostSheetOpen,
    buddySheetInitialValues: templatePost.buddySheetInitialValues,
    buddySheetPrefillLines: templatePost.buddySheetPrefillLines,
    buddySheetPrefillTitle: templatePost.buddySheetPrefillTitle,
    buddySheetShowOnSiteBadgeHint: templatePost.buddySheetShowOnSiteBadgeHint,
    buddySheetSubmitLabel: templatePost.buddySheetSubmitLabel,
    closeBuddyPostSheet: templatePost.closeBuddyPostSheet,
    handleBuddyPostSheetSubmit: templatePost.handleBuddyPostSheetSubmit,
    buddyPostActivityDate: templatePost.buddyPostActivityDate,
    buddyPostActivityTitle: templatePost.buddyPostActivityTitle,
    contentTab,
    setContentTab,
    live,
    posts,
    postsLoading,
    showPostsEnd,
    currentUserAvatar: currentUserQuery.data?.avatar,
    postsQuery,
    displayUserName,
    handleOpenAiGuide: travelGuide.openGuideSheet,
    activityTitle,
    handleOpenMyItinerary,
    handleOpenExclusiveItinerary,
    guideSheetOpen: travelGuide.guideSheetOpen,
    closeGuideSheet: travelGuide.closeGuideSheet,
    handleGuideSheetSubmit: travelGuide.handleGuideSheetSubmit,
    guideDefaultNights: travelGuide.guideDefaultNights,
    guideEventCity: travelGuide.guideEventCity,
    invalidEventId: route.invalidEventId,
    isOnSite: header.isOnSite,
    handleOnSiteCertifiedSuccess,
  };
}
