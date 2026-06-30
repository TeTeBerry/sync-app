import { useCallback, useEffect, useMemo } from 'react';
import { useActivityDetailQuery } from '../../../hooks/useSyncApi';
import { useNavigationStore } from '../../../stores/navigationStore';
import type { ConfirmDialogOptions } from '../../../hooks/useConfirmDialog';
import { useEventDetailRoute } from './useEventDetailRoute';
import { useEventDetailActivityHeader } from './useEventDetailActivityHeader';
import { useEventDetailScrollPreserve } from './useEventDetailScrollPreserve';
import { useEventDetailWechatShare } from './useEventDetailWechatShare';
import { useActivityPerformanceBundleWriter } from '@/hooks/useActivityPerformanceBundleWriter';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useEventDetailPostsSection } from './useEventDetailPostsSection';
import {
  useEventDetailTravelGuideSection,
  useEventDetailTravelGuideActions,
} from './useEventDetailTravelGuideSection';
import { useEventDetailFestivalPlanSection } from './useEventDetailFestivalPlanSection';
import { useEventDetailItineraryNavigation } from './useEventDetailItineraryNavigation';
import { useEventDetailPrepNavigation } from './useEventDetailPrepNavigation';
import { buildEventDetailPageViewModel } from './eventDetailPageViewModel';

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
    artifactId,
    scrollTop: routeScrollTop,
    setScrollTop,
    secondaryReady,
    invalidEventId,
  } = route;
  const buddyPostNavIntent = useMemo(
    () => useNavigationStore.getState().consumeEventDetailBuddyPostIntent(),
    [],
  );
  const travelGuideNavIntent = useMemo(
    () => useNavigationStore.getState().consumeEventDetailTravelGuideIntent(),
    [],
  );
  const searchPrefillNavIntent = useMemo(
    () => useNavigationStore.getState().consumeEventDetailSearchPrefillIntent(),
    [],
  );
  const activityQuery = useActivityDetailQuery(eventId);
  const activityTitle = activityQuery.data?.name;
  const activityDate = activityQuery.data?.date;
  const activityLocation = activityQuery.data?.location;
  useActivityPerformanceBundleWriter(eventId, { activity: activityQuery.data });
  const { isConnected } = useNetworkStatus();
  const header = useEventDetailActivityHeader({
    eventId,
    hasValidEventId: route.hasValidEventId,
    activityQuery,
  });
  const wechatShare = useEventDetailWechatShare({ eventId, activityQuery });
  const itineraryNav = useEventDetailItineraryNavigation(eventId);
  const scrollPreserve = useEventDetailScrollPreserve();
  const { frozenTop, scrollFrozen, freezeScroll, unfreezeScroll, getLiveScrollTop } =
    scrollPreserve;
  const { travelGuide } = useEventDetailTravelGuideSection({
    eventId,
    activityDate,
    activityLocation,
    travelGuideNavIntent,
    openGuideOnMount,
    secondaryReady,
    invalidEventId,
  });
  const postsSection = useEventDetailPostsSection({
    eventId,
    highlightPostId,
    focusPostsOnMount,
    openBuddyPostOnMount,
    openCommentsOnMount,
    secondaryReady,
    invalidEventId,
    artifactId,
    activityTitle,
    activityDate,
    isConnected,
    guideSheetOpen: travelGuide.guideSheetOpen,
    confirm,
    setScrollTop,
    freezeScroll,
    unfreezeScroll,
    getLiveScrollTop,
    frozenTop,
    buddyPostNavIntent,
    searchPrefillNavIntent,
  });
  const festivalPlan = useEventDetailFestivalPlanSection({
    activityLegacyId: eventId,
    openTravelGuideSheet: travelGuide.openGuideSheet,
    openItinerary: itineraryNav.handleOpenExclusiveItinerary,
    openBuddyPostSheet: postsSection.templatePost.openBuddyPostSheet,
  });
  const { handleOpenAiGuide, travelGuideGenerated } = useEventDetailTravelGuideActions({
    eventId,
    travelGuideSupported: activityQuery.data?.travelGuideSupported,
    festivalPlanTravelGuideId: festivalPlan.checklist?.travelGuideId,
    openGuideSheet: travelGuide.openGuideSheet,
  });
  const prepNav = useEventDetailPrepNavigation({
    setScrollTop,
    scrollToPost: postsSection.posts.scrollToElement,
    openPostComments: postsSection.posts.openPostComments,
    openBuddyPostSheet: postsSection.templatePost.openBuddyPostSheet,
    openExclusiveItinerary: itineraryNav.handleOpenExclusiveItinerary,
    openAiGuide: handleOpenAiGuide,
    festivalPlanChecklist: festivalPlan.checklist,
    onFestivalPlanTaskPress: festivalPlan.onTaskPress,
  });
  const { tryApplyTravelGuideSearchPrefill, handleListScroll } = postsSection;
  useEffect(() => {
    if (travelGuideGenerated) {
      tryApplyTravelGuideSearchPrefill();
    }
  }, [travelGuideGenerated, tryApplyTravelGuideSearchPrefill]);
  const handleScroll = useCallback(
    (scrollTop: number) => {
      scrollPreserve.handleScroll(scrollTop);
      handleListScroll(scrollTop);
    },
    [scrollPreserve, handleListScroll],
  );
  const scrollTop = scrollFrozen && frozenTop != null ? frozenTop : routeScrollTop;
  return buildEventDetailPageViewModel({
    header,
    eventId,
    highlightPostId,
    scrollTop,
    scrollFrozen,
    handleScroll,
    postsSection,
    travelGuide,
    itineraryNav,
    festivalPlan,
    prepNav,
    handleOpenAiGuide,
    travelGuideGenerated,
    activityTitle,
    invalidEventId: route.invalidEventId,
    isWeapp: wechatShare.isWeapp,
    activity: activityQuery.data,
  });
}
