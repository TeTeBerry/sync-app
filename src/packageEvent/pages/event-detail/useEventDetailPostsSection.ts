import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDidShow } from '@tarojs/taro';
import { useEventPostsInfiniteQuery } from '../../../hooks/useEventPostsInfiniteQuery';
import {
  buildRecruitApplyCommentDraft,
  EVENT_DETAIL_SCROLL_ID,
  useEventDetailBuddyPost,
  useEventDetailPosts,
} from '@/domains/partner-feed';
import {
  dismissTravelGuideSearchPrefill,
  findLatestTravelGuideForActivity,
  shouldApplyTravelGuideSearchPrefill,
} from '@/domains/travel-guide';
import { useDisplayUserIdentity } from '../../../hooks/useDisplayUserIdentity';
import { useCurrentUserQuery } from '../../../hooks/useSyncApi';
import { travelGuideFormToSearchQuery } from '@/utils/travelGuideToBuddyPost';
import type { EventDetailPost } from '../../../types/backend';
import { scrollElementToCenter } from '../../../utils/scrollToCenter';
import { useOverlayLockStore } from '../../../stores/overlayLockStore';
import { t } from '@/i18n/translate';
import type { ConfirmDialogOptions } from '../../../hooks/useConfirmDialog';
import type { EventDetailBuddyPostNavIntent } from '../../../stores/types';

export type UseEventDetailPostsSectionOptions = {
  eventId: number;
  highlightPostId: string;
  focusPostsOnMount: boolean;
  openBuddyPostOnMount: boolean;
  openCommentsOnMount: boolean;
  secondaryReady: boolean;
  invalidEventId: boolean;
  activityTitle?: string;
  activityDate?: string;
  isConnected: boolean;
  guideSheetOpen: boolean;
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  setScrollTop: (value: number | undefined) => void;
  freezeScroll: () => void;
  unfreezeScroll: () => void;
  getLiveScrollTop: () => number;
  frozenTop: number | null;
  buddyPostNavIntent: EventDetailBuddyPostNavIntent | null;
};

export function useEventDetailPostsSection({
  eventId,
  highlightPostId,
  focusPostsOnMount,
  openBuddyPostOnMount,
  openCommentsOnMount,
  secondaryReady,
  invalidEventId,
  activityTitle,
  activityDate,
  isConnected,
  guideSheetOpen,
  confirm,
  setScrollTop,
  freezeScroll,
  unfreezeScroll,
  getLiveScrollTop,
  frozenTop,
  buddyPostNavIntent,
}: UseEventDetailPostsSectionOptions) {
  const focusPostsScrolledRef = useRef(false);
  const travelGuidePrefillScrolledRef = useRef(false);
  const buddyPostSheetOpenedRef = useRef(false);
  const appliedTravelGuidePrefillRef = useRef<string | null>(null);

  const displayIdentity = useDisplayUserIdentity();
  const { data: currentUser } = useCurrentUserQuery();

  const postsQuery = useEventPostsInfiniteQuery(eventId, {
    anchorPostId: highlightPostId || undefined,
  });

  const buddyPostPrefill =
    buddyPostNavIntent?.activityLegacyId === eventId
      ? {
          initialValues: buddyPostNavIntent.initialValues,
          prefillSummaryLines: buddyPostNavIntent.prefillSummaryLines,
          prefillBannerTitle: buddyPostNavIntent.prefillBannerTitle,
        }
      : undefined;

  const handleTravelGuidePrefillDismiss = useCallback(
    (activityLegacyId: number, guideId: string) => {
      dismissTravelGuideSearchPrefill(activityLegacyId, guideId);
    },
    [],
  );

  const releaseBuddyPostSheetScroll = useCallback(() => {
    const preservedTop = frozenTop ?? getLiveScrollTop();
    unfreezeScroll();
    if (preservedTop > 0) {
      setScrollTop(preservedTop);
    }
  }, [frozenTop, getLiveScrollTop, setScrollTop, unfreezeScroll]);

  const templatePost = useEventDetailBuddyPost(eventId, {
    activityTitle,
    activityDate,
    authorName: displayIdentity.name,
    authorAvatar: displayIdentity.avatar,
    authorHandle: displayIdentity.handle,
    buddyPostPrefill,
    refreshPosts: postsQuery.refetch,
    prependPost: postsQuery.prependItem,
    replacePost: postsQuery.replaceItem,
    removePost: postsQuery.removeItem,
    patchPost: postsQuery.patchItem,
    freezeScroll,
    releaseScroll: releaseBuddyPostSheetScroll,
    accountRiskEnabled: secondaryReady,
  });

  const buildApplyCommentDraft = useCallback(
    (post: EventDetailPost) => {
      const latestGuide = findLatestTravelGuideForActivity(eventId);
      return buildRecruitApplyCommentDraft({
        post,
        userLocation: displayIdentity.location,
        travelGuide: latestGuide
          ? {
              departure: latestGuide.form.departure,
              headcount: latestGuide.form.headcount,
            }
          : undefined,
      });
    },
    [displayIdentity.location, eventId],
  );

  const posts = useEventDetailPosts({
    activityLegacyId: eventId,
    postsQuery,
    confirm,
    setScrollTop,
    highlightPostId,
    openCommentsOnMount,
    onTravelGuidePrefillDismiss: handleTravelGuidePrefillDismiss,
    buildApplyCommentDraft,
    currentUser,
  });

  const {
    searchActive: postsSearchActive,
    searchQuery: postsSearchQuery,
    applyTravelGuideSearchPrefill,
  } = posts;

  const tryApplyTravelGuideSearchPrefill = useCallback(() => {
    if (!Number.isFinite(eventId) || eventId <= 0 || postsSearchActive) {
      return false;
    }

    const latestGuide = findLatestTravelGuideForActivity(eventId);
    if (!latestGuide?.form) {
      return false;
    }
    if (!shouldApplyTravelGuideSearchPrefill(eventId, latestGuide.guideId)) {
      return false;
    }
    if (appliedTravelGuidePrefillRef.current === latestGuide.guideId) {
      return false;
    }

    const searchQuery = travelGuideFormToSearchQuery(
      latestGuide.form,
      activityDate,
      t,
    ).trim();
    if (!searchQuery) {
      return false;
    }
    if (postsSearchQuery.trim() === searchQuery) {
      appliedTravelGuidePrefillRef.current = latestGuide.guideId;
      return false;
    }

    applyTravelGuideSearchPrefill(searchQuery, latestGuide.guideId);
    appliedTravelGuidePrefillRef.current = latestGuide.guideId;
    return true;
  }, [
    activityDate,
    applyTravelGuideSearchPrefill,
    eventId,
    postsSearchActive,
    postsSearchQuery,
  ]);

  const postsLoading = postsQuery.isLoading && postsQuery.items.length === 0;
  const recruitRequiresNetwork = !isConnected;

  useEffect(() => {
    if (!focusPostsOnMount || postsLoading || focusPostsScrolledRef.current) {
      return;
    }
    focusPostsScrolledRef.current = true;
    void scrollElementToCenter(
      `#${EVENT_DETAIL_SCROLL_ID}`,
      '#event-detail-posts',
      setScrollTop,
    );
  }, [focusPostsOnMount, postsLoading, setScrollTop]);

  useEffect(() => {
    if (
      !tryApplyTravelGuideSearchPrefill() ||
      postsLoading ||
      travelGuidePrefillScrolledRef.current
    ) {
      return;
    }
    travelGuidePrefillScrolledRef.current = true;
    void scrollElementToCenter(
      `#${EVENT_DETAIL_SCROLL_ID}`,
      '#event-detail-posts',
      setScrollTop,
    );
  }, [postsLoading, setScrollTop, tryApplyTravelGuideSearchPrefill]);

  useEffect(() => {
    if (
      !openBuddyPostOnMount ||
      buddyPostSheetOpenedRef.current ||
      invalidEventId ||
      !secondaryReady
    ) {
      return;
    }
    buddyPostSheetOpenedRef.current = true;
    templatePost.openBuddyPostSheet();
  }, [openBuddyPostOnMount, invalidEventId, secondaryReady, templatePost]);

  const showPostsEnd = useMemo(
    () =>
      !posts.searchActive &&
      posts.totalPostCount > 0 &&
      !postsLoading &&
      !posts.hasMoreVisiblePosts &&
      !postsQuery.hasMore &&
      !postsQuery.isLoadingMore,
    [posts, postsLoading, postsQuery.hasMore, postsQuery.isLoadingMore],
  );

  useDidShow(() => {
    if (templatePost.buddyPostSheetOpen || guideSheetOpen) {
      return;
    }
    useOverlayLockStore.getState().reset();
    if (tryApplyTravelGuideSearchPrefill() && !travelGuidePrefillScrolledRef.current) {
      travelGuidePrefillScrolledRef.current = true;
      void scrollElementToCenter(
        `#${EVENT_DETAIL_SCROLL_ID}`,
        '#event-detail-posts',
        setScrollTop,
      );
    }
  });

  return {
    posts,
    postsQuery,
    templatePost,
    postsLoading,
    recruitRequiresNetwork,
    showPostsEnd,
    displayIdentity,
    handleListScroll: posts.handleListScroll,
    tryApplyTravelGuideSearchPrefill,
  };
}
