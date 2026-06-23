import { useCallback, useEffect, useMemo, useRef } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { useActivityDetailQuery } from '../../../hooks/useSyncApi';
import { useEventPostsInfiniteQuery } from '../../../hooks/useEventPostsInfiniteQuery';
import {
  useEventDetailPosts,
  useEventDetailBuddyPost,
  EVENT_DETAIL_SCROLL_ID,
} from '@/domains/partner-feed';
import { useDisplayUserIdentity } from '../../../hooks/useDisplayUserIdentity';
import { useNavigationStore } from '../../../stores/navigationStore';
import type { ConfirmDialogOptions } from '../../../hooks/useConfirmDialog';
import { useEventDetailRoute } from './useEventDetailRoute';
import { useEventDetailActivityHeader } from './useEventDetailActivityHeader';
import { useEventDetailScrollPreserve } from './useEventDetailScrollPreserve';
import { useEventDetailTravelGuide } from '@/domains/travel-guide';
import { findLatestTravelGuideForActivity } from '@/domains/travel-guide/utils/travelGuideDetailStorage';
import {
  dismissTravelGuideSearchPrefill,
  shouldApplyTravelGuideSearchPrefill,
} from '@/domains/travel-guide/utils/travelGuideSearchPrefillStorage';
import { travelGuideFormToSearchQuery } from '@/utils/travelGuideToBuddyPost';
import { useEventDetailWechatShare } from './useEventDetailWechatShare';
import { useEventDetailFestivalPlan } from '@/domains/festival-plan/hooks/useEventDetailFestivalPlan';
import {
  goActivityLineup,
  goExclusiveItinerary,
  goMyItinerary,
  goAiTravelGuide,
} from '../../../utils/route';
import { buildRecruitApplyCommentDraft } from '@/domains/partner-feed/utils/buildRecruitApplyCommentDraft';
import type { EventDetailPost } from '../../../types/backend';
import { scrollElementToCenter } from '../../../utils/scrollToCenter';
import { useOverlayLockStore } from '../../../stores/overlayLockStore';
import { t } from '@/i18n/translate';
import type { PrepNudgeAction } from '@/domains/partner-feed/utils/eventDetailPlanningHint.util';

export type UseEventDetailPageOptions = {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
};

export function useEventDetailPage({ confirm }: UseEventDetailPageOptions) {
  const route = useEventDetailRoute();
  const {
    eventId,
    highlightPostId,
    focusPostsOnMount,
    openBuddyPostOnMount,
    openCommentsOnMount,
    openGuideOnMount,
    scrollTop: routeScrollTop,
    setScrollTop,
    secondaryReady,
    invalidEventId,
  } = route;
  const focusPostsScrolledRef = useRef(false);
  const travelGuidePrefillScrolledRef = useRef(false);
  const buddyPostSheetOpenedRef = useRef(false);
  const guideSheetOpenedRef = useRef(false);
  const buddyPostNavIntent = useMemo(
    () => useNavigationStore.getState().consumeEventDetailBuddyPostIntent(),
    [],
  );
  const travelGuideNavIntent = useMemo(
    () => useNavigationStore.getState().consumeEventDetailTravelGuideIntent(),
    [],
  );

  const activityQuery = useActivityDetailQuery(eventId);
  const activityTitle = activityQuery.data?.name;
  const activityDate = activityQuery.data?.date;
  const activityLocation = activityQuery.data?.location;
  const header = useEventDetailActivityHeader({
    eventId,
    hasValidEventId: route.hasValidEventId,
    activityQuery,
  });

  const wechatShare = useEventDetailWechatShare({ eventId, activityQuery });

  const travelGuide = useEventDetailTravelGuide({
    eventId,
    activityDate,
    activityLocation,
    initialGuideForm: travelGuideNavIntent?.prefillTravelGuideForm ?? null,
  });
  const displayIdentity = useDisplayUserIdentity();

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

  const scrollPreserve = useEventDetailScrollPreserve();
  const { frozenTop, scrollFrozen, freezeScroll, unfreezeScroll, getLiveScrollTop } =
    scrollPreserve;

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
  });

  const {
    searchActive: postsSearchActive,
    searchQuery: postsSearchQuery,
    applyTravelGuideSearchPrefill,
  } = posts;

  const appliedTravelGuidePrefillRef = useRef<string | null>(null);

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

  const handleScroll = useCallback(
    (scrollTop: number) => {
      scrollPreserve.handleScroll(scrollTop);
      posts.handleListScroll(scrollTop);
    },
    [scrollPreserve, posts],
  );

  const scrollTop = scrollFrozen && frozenTop != null ? frozenTop : routeScrollTop;

  const postsLoading = postsQuery.isLoading && postsQuery.items.length === 0;

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

  const showPostsEnd =
    !posts.searchActive &&
    posts.totalPostCount > 0 &&
    !postsLoading &&
    !posts.hasMoreVisiblePosts &&
    !postsQuery.hasMore &&
    !postsQuery.isLoadingMore;

  const assertValidEventId = useCallback(() => {
    if (!Number.isFinite(eventId) || eventId <= 0) {
      void Taro.showToast({ title: t('eventDetail.invalidActivity'), icon: 'none' });
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

  const handleOpenActivityLineup = useCallback(() => {
    if (!assertValidEventId()) {
      return;
    }
    goActivityLineup(eventId);
  }, [assertValidEventId, eventId]);

  const handleOpenExclusiveItinerary = useCallback(() => {
    if (!assertValidEventId()) {
      return;
    }
    goExclusiveItinerary(eventId);
  }, [assertValidEventId, eventId]);

  const festivalPlan = useEventDetailFestivalPlan({
    activityLegacyId: eventId,
    openTravelGuideSheet: travelGuide.openGuideSheet,
    openItinerary: handleOpenExclusiveItinerary,
    openBuddyPostSheet: templatePost.openBuddyPostSheet,
  });

  const handleOpenAiGuide = useCallback(() => {
    if (
      activityQuery.data?.travelGuideSupported === false &&
      !findLatestTravelGuideForActivity(eventId)?.guideId &&
      !festivalPlan.checklist?.travelGuideId
    ) {
      void Taro.showToast({
        title: t('travelGuide.preparingToast'),
        icon: 'none',
      });
      return;
    }
    const guideId =
      festivalPlan.checklist?.travelGuideId?.trim() ||
      findLatestTravelGuideForActivity(eventId)?.guideId;
    if (guideId) {
      goAiTravelGuide(guideId);
      return;
    }
    travelGuide.openGuideSheet();
  }, [
    eventId,
    festivalPlan.checklist,
    activityQuery.data?.travelGuideSupported,
    travelGuide,
  ]);

  const travelGuideGenerated = useMemo(
    () =>
      Boolean(
        festivalPlan.checklist?.travelGuideId ||
        findLatestTravelGuideForActivity(eventId),
      ),
    [eventId, festivalPlan.checklist],
  );

  useEffect(() => {
    if (travelGuideGenerated) {
      tryApplyTravelGuideSearchPrefill();
    }
  }, [travelGuideGenerated, tryApplyTravelGuideSearchPrefill]);

  const handlePrepNudgeAction = useCallback(
    (action: PrepNudgeAction) => {
      switch (action.type) {
        case 'open_post_replies':
          posts.scrollToElement(action.postId);
          posts.openPostComments(action.postId);
          return;
        case 'open_buddy_post_sheet':
          templatePost.openBuddyPostSheet();
          return;
        case 'scroll_to_recruits':
          void scrollElementToCenter(
            `#${EVENT_DETAIL_SCROLL_ID}`,
            '#event-detail-posts',
            setScrollTop,
          );
          return;
        case 'open_itinerary':
          handleOpenExclusiveItinerary();
          return;
        case 'open_travel_guide':
          handleOpenAiGuide();
          return;
        case 'festival_plan_task': {
          const task = festivalPlan.checklist?.tasks.find(
            (item) => item.key === action.taskKey,
          );
          if (task) {
            festivalPlan.onTaskPress(task);
          }
          return;
        }
        case 'scroll_to_subscribe':
          void scrollElementToCenter(
            `#${EVENT_DETAIL_SCROLL_ID}`,
            '#event-detail-info',
            setScrollTop,
          );
          return;
      }
    },
    [
      festivalPlan,
      handleOpenAiGuide,
      handleOpenExclusiveItinerary,
      posts,
      setScrollTop,
      templatePost,
    ],
  );

  useEffect(() => {
    if (
      !openGuideOnMount ||
      guideSheetOpenedRef.current ||
      invalidEventId ||
      !secondaryReady
    ) {
      return;
    }
    guideSheetOpenedRef.current = true;
    travelGuide.openGuideSheet(travelGuideNavIntent?.prefillTravelGuideForm ?? null);
  }, [
    openGuideOnMount,
    invalidEventId,
    secondaryReady,
    travelGuide,
    travelGuideNavIntent?.prefillTravelGuideForm,
  ]);

  const isPublishing = templatePost.isBuddyPostPublishing;

  const closeBuddyPostSheet = templatePost.closeBuddyPostSheet;

  useDidShow(() => {
    if (templatePost.buddyPostSheetOpen || travelGuide.guideSheetOpen) {
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
    ...header,
    eventId,
    highlightPostId,
    scrollTop,
    scrollFrozen,
    handleScroll,
    templatePublishing: isPublishing,
    handleOpenTemplateSheet: templatePost.openBuddyPostSheet,
    handleEditPost: templatePost.openEditBuddyPostSheet,
    buddyPostSheetOpen: templatePost.buddyPostSheetOpen,
    isBuddyPostEditing: templatePost.isBuddyPostEditing,
    closeBuddyPostSheet,
    handleBuddyPostSheetSubmit: templatePost.handleBuddyPostSheetSubmit,
    buddyPostActivityDate: templatePost.buddyPostActivityDate,
    buddyPostActivityTitle: templatePost.buddyPostActivityTitle,
    buddyPostSheetInitialValues: templatePost.buddyPostSheetInitialValues,
    buddyPostPrefillSummaryLines: templatePost.buddyPostPrefillSummaryLines,
    buddyPostPrefillBannerTitle: templatePost.buddyPostPrefillBannerTitle,
    posts,
    postsLoading,
    showPostsEnd,
    postsQuery,
    displayUserName: displayIdentity.name,
    currentUserAvatar: displayIdentity.avatar,
    handleOpenAiGuide,
    activityTitle,
    handleOpenMyItinerary,
    handleOpenActivityLineup,
    handleOpenExclusiveItinerary,
    guideSheetOpen: travelGuide.guideSheetOpen,
    closeGuideSheet: travelGuide.closeGuideSheet,
    handleGuideSheetSubmit: travelGuide.handleGuideSheetSubmit,
    guideDefaultNights: travelGuide.guideDefaultNights,
    guideEventCity: travelGuide.guideEventCity,
    guideSheetInitialValues: travelGuide.guideSheetInitialValues,
    invalidEventId: route.invalidEventId,
    publishComplianceConfirmDialog: templatePost.complianceConfirmDialog,
    buddyPostQuota: templatePost.buddyPostQuota,
    isWeapp: wechatShare.isWeapp,
    festivalPlanChecklist: festivalPlan.checklist,
    onFestivalPlanTaskPress: festivalPlan.onTaskPress,
    prepNudgeUnreadReplyCount: festivalPlan.unreadReplyCount,
    onPrepNudgeAction: handlePrepNudgeAction,
    travelGuideGenerated,
    activity: activityQuery.data,
  };
}
