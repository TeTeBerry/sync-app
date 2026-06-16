import { useCallback } from 'react';
import Taro from '@tarojs/taro';
import { useActivityDetailQuery, useCurrentUserQuery } from '../../../hooks/useSyncApi';
import { useEventPostsInfiniteQuery } from '../../../hooks/useEventPostsInfiniteQuery';
import { useEventDetailPosts, useEventDetailBuddyPost } from '@/domains/partner-feed';
import { useResolvedProfile } from '../../../hooks/useResolvedProfile';
import type { ConfirmDialogOptions } from '../../../hooks/useConfirmDialog';
import { useEventDetailRoute } from './useEventDetailRoute';
import { useEventDetailActivityHeader } from './useEventDetailActivityHeader';
import { useEventDetailScrollPreserve } from './useEventDetailScrollPreserve';
import { useEventDetailTravelGuide } from '@/domains/travel-guide';
import { goExclusiveItinerary, goMyItinerary } from '../../../utils/route';

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
  const currentUserQuery = useCurrentUserQuery();
  const profileUser = useResolvedProfile();
  const displayUserName = currentUserQuery.data?.name ?? profileUser.name ?? '用户';

  const postsQuery = useEventPostsInfiniteQuery(eventId, {
    anchorPostId: highlightPostId || undefined,
  });

  const templatePost = useEventDetailBuddyPost(eventId, {
    activityTitle,
    activityDate,
    authorName: displayUserName,
    authorAvatar: currentUserQuery.data?.avatar,
    refreshPosts: postsQuery.refetch,
    prependPost: postsQuery.prependItem,
    replacePost: postsQuery.replaceItem,
    removePost: postsQuery.removeItem,
    accountRiskEnabled: secondaryReady,
  });

  const { handleScroll, frozenTop, scrollFrozen } = useEventDetailScrollPreserve();

  const posts = useEventDetailPosts({
    postsQuery,
    confirm,
    setScrollTop,
  });

  const scrollTop = scrollFrozen && frozenTop != null ? frozenTop : routeScrollTop;

  const postsLoading = postsQuery.isLoading && postsQuery.items.length === 0;
  const showPostsEnd =
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

  const isPublishing = templatePost.isBuddyPostPublishing;

  return {
    ...header,
    eventId,
    highlightPostId,
    scrollTop,
    scrollFrozen,
    handleScroll,
    templatePublishing: isPublishing,
    handleOpenTemplateSheet: templatePost.openBuddyPostSheet,
    buddyPostSheetOpen: templatePost.buddyPostSheetOpen,
    closeBuddyPostSheet: templatePost.closeBuddyPostSheet,
    handleBuddyPostSheetSubmit: templatePost.handleBuddyPostSheetSubmit,
    buddyPostActivityDate: templatePost.buddyPostActivityDate,
    buddyPostActivityTitle: templatePost.buddyPostActivityTitle,
    posts,
    postsLoading,
    showPostsEnd,
    postsQuery,
    displayUserName,
    currentUserAvatar: currentUserQuery.data?.avatar,
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
  };
}
