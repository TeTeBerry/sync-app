import type { useEventDetailActivityHeader } from './useEventDetailActivityHeader';
import type { useEventDetailPostsSection } from './useEventDetailPostsSection';
import type { useEventDetailTravelGuide } from '@/domains/travel-guide/hooks/useEventDetailTravelGuide';
import type { useEventDetailFestivalPlanSection } from './useEventDetailFestivalPlanSection';
import type { useEventDetailItineraryNavigation } from './useEventDetailItineraryNavigation';
import type { useEventDetailPrepNavigation } from './useEventDetailPrepNavigation';
import type { BackendActivity } from '../../../types/backend';

type Header = ReturnType<typeof useEventDetailActivityHeader>;
type PostsSection = ReturnType<typeof useEventDetailPostsSection>;
type TravelGuide = ReturnType<typeof useEventDetailTravelGuide>;
type FestivalPlan = ReturnType<typeof useEventDetailFestivalPlanSection>;
type ItineraryNav = ReturnType<typeof useEventDetailItineraryNavigation>;
type PrepNav = ReturnType<typeof useEventDetailPrepNavigation>;

export type EventDetailPageViewModelInput = {
  header: Header;
  eventId: number;
  highlightPostId: string;
  scrollTop: number | undefined;
  scrollFrozen: boolean;
  handleScroll: (scrollTop: number) => void;
  postsSection: PostsSection;
  travelGuide: TravelGuide;
  itineraryNav: ItineraryNav;
  festivalPlan: FestivalPlan;
  prepNav: PrepNav;
  handleOpenAiGuide: () => void;
  travelGuideGenerated: boolean;
  activityTitle?: string;
  invalidEventId: boolean;
  isWeapp: boolean;
  activity?: BackendActivity | null;
};

export function buildEventDetailPageViewModel({
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
  invalidEventId,
  isWeapp,
  activity,
}: EventDetailPageViewModelInput) {
  const {
    templatePost,
    posts,
    postsQuery,
    postsLoading,
    recruitRequiresNetwork,
    showPostsEnd,
    displayIdentity,
  } = postsSection;

  return {
    ...header,
    eventId,
    highlightPostId,
    scrollTop,
    scrollFrozen,
    handleScroll,
    templatePublishing: templatePost.isBuddyPostPublishing,
    handleOpenTemplateSheet: templatePost.openBuddyPostSheet,
    handleEditPost: templatePost.openEditBuddyPostSheet,
    buddyPostSheetOpen: templatePost.buddyPostSheetOpen,
    isBuddyPostEditing: templatePost.isBuddyPostEditing,
    closeBuddyPostSheet: templatePost.closeBuddyPostSheet,
    handleBuddyPostSheetSubmit: templatePost.handleBuddyPostSheetSubmit,
    buddyPostActivityDate: templatePost.buddyPostActivityDate,
    buddyPostActivityTitle: templatePost.buddyPostActivityTitle,
    buddyPostSheetInitialValues: templatePost.buddyPostSheetInitialValues,
    buddyPostPrefillSummaryLines: templatePost.buddyPostPrefillSummaryLines,
    buddyPostPrefillBannerTitle: templatePost.buddyPostPrefillBannerTitle,
    posts,
    postsLoading,
    recruitRequiresNetwork,
    showPostsEnd,
    postsQuery,
    displayUserName: displayIdentity.name,
    currentUserAvatar: displayIdentity.avatar,
    handleOpenAiGuide,
    activityTitle,
    handleOpenMyItinerary: itineraryNav.handleOpenMyItinerary,
    handleOpenActivityLineup: itineraryNav.handleOpenActivityLineup,
    handleOpenExclusiveItinerary: itineraryNav.handleOpenExclusiveItinerary,
    guideSheetOpen: travelGuide.guideSheetOpen,
    closeGuideSheet: travelGuide.closeGuideSheet,
    handleGuideSheetSubmit: travelGuide.handleGuideSheetSubmit,
    guideDefaultNights: travelGuide.guideDefaultNights,
    guideEventCity: travelGuide.guideEventCity,
    guideSheetInitialValues: travelGuide.guideSheetInitialValues,
    invalidEventId,
    publishComplianceConfirmDialog: templatePost.complianceConfirmDialog,
    buddyPostQuota: templatePost.buddyPostQuota,
    isWeapp,
    festivalPlanChecklist: festivalPlan.checklist,
    onFestivalPlanTaskPress: festivalPlan.onTaskPress,
    prepNudgeUnreadReplyCount: festivalPlan.unreadReplyCount,
    onPrepNudgeAction: prepNav.handlePrepNudgeAction,
    travelGuideGenerated,
    activity,
  };
}
