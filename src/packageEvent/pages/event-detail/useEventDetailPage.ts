import { useCallback, useRef, useState } from 'react';
import { useContactUnlockQuota } from '../../../hooks/useContactUnlockQuota';
import {
  invalidatePostQueries,
  useActivityDetailQuery,
  useCurrentUserQuery,
} from '../../../hooks/useSyncApi';
import { useEventPostsInfiniteQuery } from '../../../hooks/useEventPostsInfiniteQuery';
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
import { useEventDetailTeamApply } from './useEventDetailTeamApply';
import { useEventDetailScrollPreserve } from './useEventDetailScrollPreserve';
import { buddyPreviewFromForm } from '../../../utils/teamApplyBuddyPreview';
import type { AiBuddyPostSubmitPayload } from '../../../types/buddyPost';
import { useEventDetailTravelGuide } from './useEventDetailTravelGuide';
import { eventCityFromLocation } from '../../../utils/travelGuideDepartureSuggestions';

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
  const applyDefaultDepartureCity =
    currentUserQuery.data?.city?.trim() ||
    eventCityFromLocation(activityQuery.data?.location);
  const profileUser = useResolvedProfile();
  const displayUserName = currentUserQuery.data?.name ?? profileUser.name ?? '用户';

  const [contentTab, setContentTab] = useState<EventDetailTabId>('posts');

  const postsQuery = useEventPostsInfiniteQuery(eventId, {
    enabled: feedReady,
    anchorPostId: highlightPostId || undefined,
  });

  const buddyPost = useEventDetailBuddyPost(eventId, {
    authorName: displayUserName,
    authorAvatar: currentUserQuery.data?.avatar,
    refreshPosts: postsQuery.refetch,
    prependPost: postsQuery.prependItem,
  });

  const handleOnSiteCertifiedSuccess = useCallback(async () => {
    await invalidatePostQueries();
    try {
      await postsQuery.refetch();
    } catch {
      // Best-effort refresh so buddy posts pick up on-site badge.
    }
  }, [postsQuery]);

  const ai = useEventDetailAiActions(eventId, {
    openGuideSheet: travelGuide.openGuideSheet,
    openBuddyPostSheet: buddyPost.openBuddyPostSheet,
  });

  const live = useEventDetailLive({
    contentTab,
    showHeaderSkeleton: header.showHeaderSkeleton,
  });

  const resumeApplyPostIdRef = useRef<string | null>(null);
  const applyAnchorPostIdRef = useRef<string | null>(null);
  const deferPostsRefreshRef = useRef(false);
  const [applyBuddyPublishPending, setApplyBuddyPublishPending] = useState(false);
  const [buddySheetForApplyFlow, setBuddySheetForApplyFlow] = useState(false);

  const { handleScroll, frozenTop, scrollFrozen, freezeScroll, unfreezeScroll } =
    useEventDetailScrollPreserve();

  const posts = useEventDetailPosts({
    contentTab,
    postsQuery,
    confirm,
    setScrollTop,
  });

  const endApplyFlow = useCallback(() => {
    unfreezeScroll();
    resumeApplyPostIdRef.current = null;
    applyAnchorPostIdRef.current = null;
    deferPostsRefreshRef.current = false;
    setApplyBuddyPublishPending(false);
    setBuddySheetForApplyFlow(false);
  }, [unfreezeScroll]);

  const prepareApplyAnchor = useCallback(
    (postId: string) => {
      applyAnchorPostIdRef.current = postId;
      freezeScroll();
      posts.ensurePostVisible(postId);
    },
    [freezeScroll, posts],
  );

  const onRequestBuddyPostForApply = useCallback(
    (postId: string) => {
      setBuddySheetForApplyFlow(true);
      resumeApplyPostIdRef.current = postId;
      prepareApplyAnchor(postId);
      buddyPost.openBuddyPostSheet();
    },
    [buddyPost, prepareApplyAnchor],
  );

  const handleOpenBuddyPost = useCallback(() => {
    setBuddySheetForApplyFlow(false);
    ai.handleOpenBuddyPost();
  }, [ai]);

  const flushDeferredPostsRefresh = useCallback(async () => {
    if (!deferPostsRefreshRef.current) return;
    deferPostsRefreshRef.current = false;
    const anchorPostId = applyAnchorPostIdRef.current;
    unfreezeScroll();
    await postsQuery.refetch();
    if (anchorPostId) {
      posts.ensurePostVisible(anchorPostId);
    }
    applyAnchorPostIdRef.current = null;
  }, [posts, postsQuery, unfreezeScroll]);

  const handleApplyFlowSettled = useCallback(() => {
    void (async () => {
      if (deferPostsRefreshRef.current) {
        await flushDeferredPostsRefresh();
        return;
      }
      unfreezeScroll();
      applyAnchorPostIdRef.current = null;
    })();
  }, [flushDeferredPostsRefresh, unfreezeScroll]);

  const handleOpenCompleteBuddyPost = useCallback(() => {
    setBuddySheetForApplyFlow(false);
    buddyPost.openBuddyPostSheet();
  }, [buddyPost]);

  const teamApply = useEventDetailTeamApply({
    eventId,
    feedPosts: postsQuery.items,
    appliedPostIds: posts.appliedPostIds,
    setAppliedPostIds: posts.setAppliedPostIds,
    contactUnlockQuota,
    openContactUnlockExhaustedModal,
    defaultDepartureCity: applyDefaultDepartureCity,
    onPrepareApplyAnchor: prepareApplyAnchor,
    onRequestCompleteBuddyPost: handleOpenCompleteBuddyPost,
    onApplyFlowSettled: handleApplyFlowSettled,
  });

  const closeBuddyPostSheet = useCallback(() => {
    endApplyFlow();
    buddyPost.closeBuddyPostSheet();
  }, [buddyPost, endApplyFlow]);

  const handleBuddyPostSheetSubmit = useCallback(
    async (payload: AiBuddyPostSubmitPayload) => {
      const { syncToPostList = true, ...form } = payload;
      const resumeApplyPostId = resumeApplyPostIdRef.current;

      if (resumeApplyPostId) {
        const targetPostId = resumeApplyPostId;
        resumeApplyPostIdRef.current = null;
        deferPostsRefreshRef.current = !syncToPostList;

        teamApply.openApplySheet(targetPostId, buddyPreviewFromForm(form));
        setApplyBuddyPublishPending(true);

        let published = false;
        try {
          published = await buddyPost.handleBuddyPostSheetSubmit(form, {
            quiet: true,
            skipListRefresh: !syncToPostList,
            listedInFeed: syncToPostList,
          });
        } finally {
          setApplyBuddyPublishPending(false);
        }

        if (!published) {
          teamApply.closeApplySheet();
          endApplyFlow();
        }
        return;
      }

      await buddyPost.handleBuddyPostSheetSubmit(form);
    },
    [buddyPost, endApplyFlow, teamApply],
  );

  const scrollTop = scrollFrozen && frozenTop != null ? frozenTop : routeScrollTop;

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
    scrollFrozen,
    handleScroll,
    composerReady,
    prompt: ai.prompt,
    setPrompt: ai.setPrompt,
    contentTab,
    setContentTab,
    live,
    posts: {
      ...posts,
      handleApply: teamApply.handleApply,
    },
    teamApply,
    applyBuddyPublishPending,
    postsLoading,
    showPostsEnd,
    currentUserAvatar: currentUserQuery.data?.avatar,
    postsQuery,
    displayUserName,
    openAi: ai.openAi,
    handleShortcutTag: ai.handleShortcutTag,
    handleOpenAiGuide: ai.handleOpenAiGuide,
    handleOpenBuddyPost,
    buddySheetForApplyFlow,
    handleOpenExclusiveItinerary: ai.handleOpenExclusiveItinerary,
    buddyPostSheetOpen: buddyPost.buddyPostSheetOpen,
    closeBuddyPostSheet,
    handleBuddyPostSheetSubmit,
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
    isOnSite: header.isOnSite,
    publishOnsiteIntent: buddyPost.publishOnsiteIntent,
    handleOnSiteCertifiedSuccess,
  };
}
