import './event-detail.scss';
import Taro, { useRouter } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Map } from 'lucide-react-taro';
import {
  goAiAssistant,
  goBack,
  goEventMap,
  goExclusiveItinerary,
  resolveEventDetailIdFromQuery,
  ROUTES,
  warmAiAssistant,
} from '../../../utils/route';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { BottomNavSlot } from '../../../components/BottomNav';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { usePageRouteReady } from '../../../hooks/usePageRouteReady';
import { useDeferredMount } from '../../../hooks/useDeferredMount';
import { DEFER_EVENT_POSTS_MS } from '../../../utils/timing';
import { useNavigationStore } from '../../../stores/navigationStore';
import { LoginInterceptHost } from '../../../components/auth/LoginInterceptHost';
import { EventDetailComposerSection } from './components/EventDetailComposerSection';
import { EventDetailEntitlementModals } from './components/EventDetailEntitlementModals';
import EventDetailFallback from './components/EventDetailFallback';
import EventDetailLiveSection from './components/EventDetailLiveSection';
import { pickGlobalFreeMonthly } from '../../../components/profile';
import { useContactUnlockQuota } from '../../../hooks/useContactUnlockQuota';
import {
  useActivityDetailQuery,
  useCurrentUserQuery,
  useProfileEntitlementsQuery,
} from '../../../hooks/useSyncApi';
import type { PackageTierId } from '../../../types/backend';
import { resolveProfileEntitlement } from '../../../utils/profileEntitlement';
import { useEventPostsInfiniteQuery } from '../../../hooks/useEventPostsInfiniteQuery';
import { isApiEnabled } from '../../../constants/api';
import { isAiShortcutTag, recordAiShortcutTagUse } from '../../../utils/aiShortcutTags';
import {
  activityStatusCardClass,
  getActivityStatusFromActivity,
} from '../../../utils/activityStatus';
import { EventPostsVirtualList } from './components/EventPostsVirtualList';
import { EVENT_DETAIL_SCROLL_ID, useEventDetailPosts } from './useEventDetailPosts';
import { useEventDetailLive } from './useEventDetailLive';
import type { EventDetailTabId } from './components/EventDetailContentTabs';
import PageNavigation, {
  stackPageNavChromePx,
} from '../../../components/PageNavigation';
import { useNavBarInsets } from '../../../hooks/useNavBarInsets';
import { useTabPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import { useResolvedProfile } from '../../../hooks/useResolvedProfile';
import { usePostPageShare } from '../../../hooks/usePostPageShare';
import type { PostSharePayload } from '../../../utils/postShare';
import { Button } from '../../../components/ui';
import { ScrollView, Text, View } from '@tarojs/components';

const EventDetailPage = () => {
  useEndRouteTransitionOnShow();
  const router = useRouter();
  const navInsets = useNavBarInsets();
  const [scrollTop, setScrollTop] = useState<number | undefined>();
  const activeActivityLegacyId = useNavigationStore(
    (state) => state.activeActivityLegacyId,
  );
  const feedReady = useDeferredMount(DEFER_EVENT_POSTS_MS);
  const composerReady = useDeferredMount(0);

  const eventId = useMemo(
    () => resolveEventDetailIdFromQuery(router.params, activeActivityLegacyId),
    [activeActivityLegacyId, router.params],
  );
  const highlightPostId = router.params.postId?.trim() || '';

  useEffect(() => {
    if (Number.isFinite(eventId) && eventId > 0) {
      useNavigationStore.getState().setActiveActivityLegacyId(eventId);
    }
  }, [eventId]);

  useEffect(() => {
    warmAiAssistant();
  }, []);

  const activityQuery = useActivityDetailQuery(eventId);
  const postsQuery = useEventPostsInfiniteQuery(eventId, {
    enabled: feedReady,
    anchorPostId: highlightPostId || undefined,
  });
  const contactUnlockQuota = useContactUnlockQuota(eventId);
  const entitlementsQuery = useProfileEntitlementsQuery(eventId);
  const profileEntitlement = useMemo(
    () => resolveProfileEntitlement(entitlementsQuery.data, eventId),
    [entitlementsQuery.data, eventId],
  );
  const currentPaidTierId = profileEntitlement?.paidTierId ?? null;
  const freeMonthly = useMemo(
    () => pickGlobalFreeMonthly(entitlementsQuery.data),
    [entitlementsQuery.data],
  );
  const currentUserQuery = useCurrentUserQuery();
  const profileUser = useResolvedProfile();
  const apiEnabled = isApiEnabled();
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: '取消',
  });
  const [prompt, setPrompt] = useState('');
  const [contentTab, setContentTab] = useState<EventDetailTabId>('posts');
  const [contactUnlockExhaustedOpen, setContactUnlockExhaustedOpen] = useState(false);
  const [packageSheetOpen, setPackageSheetOpen] = useState(false);
  const [packageSheetInitialTierId, setPackageSheetInitialTierId] = useState<
    PackageTierId | undefined
  >(undefined);

  const openContactUnlockExhaustedModal = useCallback(() => {
    setContactUnlockExhaustedOpen(true);
  }, []);

  const closeContactUnlockExhaustedModal = useCallback(() => {
    setContactUnlockExhaustedOpen(false);
  }, []);

  const openPackageUpgradeSheet = useCallback((targetTierId: PackageTierId) => {
    setContactUnlockExhaustedOpen(false);
    setPackageSheetInitialTierId(targetTierId);
    setPackageSheetOpen(true);
  }, []);

  const closePackageUpgradeSheet = useCallback(() => {
    setPackageSheetOpen(false);
    setPackageSheetInitialTierId(undefined);
  }, []);

  const displayUserName = currentUserQuery.data?.name ?? profileUser.name ?? '用户';

  const title = activityQuery.data?.name;
  const activityImage = activityQuery.data?.image;
  const activityDate = activityQuery.data?.date;

  const getDefaultShare = useCallback((): PostSharePayload | null => {
    if (!Number.isFinite(eventId) || eventId <= 0) {
      return null;
    }
    return {
      postId: '',
      activityLegacyId: eventId,
      eventTitle: title,
      imageUrl: activityImage,
    };
  }, [activityImage, eventId, title]);

  usePostPageShare({ getDefaultShare });
  const activityStatus = getActivityStatusFromActivity(activityDate, title);
  const hasValidEventId = Number.isFinite(eventId) && eventId > 0;
  const showHeaderSkeleton =
    hasValidEventId &&
    !title &&
    !activityQuery.isError &&
    (activityQuery.isLoading || activityQuery.data === undefined);
  const showActivityMissing =
    hasValidEventId &&
    !title &&
    !activityQuery.isLoading &&
    !showHeaderSkeleton &&
    (activityQuery.isError || activityQuery.data === null);
  const routeContentReady = Boolean(title) || showHeaderSkeleton || showActivityMissing;
  usePageRouteReady(routeContentReady);

  const live = useEventDetailLive({ contentTab, showHeaderSkeleton });

  const handleBack = useCallback(() => {
    goBack(ROUTES.HOME);
  }, []);

  const metaLine = useMemo(() => {
    if (!activityQuery.data) return '';
    const parts = [activityQuery.data.date, activityQuery.data.location].filter(
      Boolean,
    );
    return parts.join(' · ');
  }, [activityQuery.data]);

  const headerChromePx = stackPageNavChromePx(navInsets, {
    meta: Boolean(metaLine),
  });
  const scrollHeight = useTabPageMainHeight(headerChromePx);

  const {
    postItems,
    appliedPostIds,
    expandedCommentPostIds,
    handleScrollToLower,
    handleApply,
    handleLikePost,
    scrollToElement,
    togglePostComments,
    handleDeletePost,
    handleCommentSubmitted,
    handleCompletePost,
  } = useEventDetailPosts({
    eventId,
    contentTab,
    postsQuery,
    apiEnabled,
    confirm,
    contactUnlockQuota,
    openContactUnlockExhaustedModal,
    setScrollTop,
  });

  const bumpShortcutTagUsage = useCallback((tag: string) => {
    recordAiShortcutTagUse(tag);
  }, []);

  const handleOpenExclusiveItinerary = useCallback(() => {
    if (!Number.isFinite(eventId) || eventId <= 0) {
      void Taro.showToast({ title: '活动信息无效', icon: 'none' });
      return;
    }
    goExclusiveItinerary(eventId);
  }, [eventId]);

  const openAi = useCallback(
    (message?: string) => {
      const trimmed = message?.trim();
      if (trimmed && isAiShortcutTag(trimmed)) {
        bumpShortcutTagUsage(trimmed);
      }
      setPrompt('');
      goAiAssistant({
        ...(trimmed ? { initialMessage: trimmed } : {}),
        activityLegacyId: Number.isNaN(eventId) ? undefined : eventId,
      });
    },
    [bumpShortcutTagUsage, eventId],
  );

  const handleShortcutTag = useCallback(
    (tag: string) => {
      bumpShortcutTagUsage(tag);
      goAiAssistant({ initialMessage: tag, activityLegacyId: eventId });
    },
    [bumpShortcutTagUsage, eventId],
  );

  if (Number.isNaN(eventId) || eventId <= 0) {
    return <EventDetailFallback variant="invalidId" />;
  }

  if (activityQuery.isError && !activityQuery.isLoading) {
    return (
      <EventDetailFallback
        variant="loadError"
        onRetry={() => void activityQuery.refetch()}
      />
    );
  }

  if (showActivityMissing) {
    return <EventDetailFallback variant="missing" />;
  }

  const postsLoading = !feedReady || postsQuery.isLoading;
  const showPostsEnd =
    contentTab === 'posts' &&
    postItems.length > 0 &&
    !postsLoading &&
    !postsQuery.hasMore &&
    !postsQuery.isLoadingMore;

  return (
    <View
      data-cmp="EventDetail"
      className={[
        's-event-detail',
        's-page-with-tabbar',
        activityStatusCardClass(activityStatus),
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <View className="s-page-with-tabbar__main s-event-detail__shell">
        <PageNavigation
          title={title ?? ''}
          meta={metaLine || undefined}
          onBack={handleBack}
          trailing={
            <Button
              className="s-page-nav__icon-action s-page-nav__icon-action--map"
              aria-label="地图"
              hoverClass="s-page-nav__icon-action--pressed"
              onClick={() => {
                if (Number.isFinite(eventId) && eventId > 0) {
                  goEventMap(eventId, { title: title ?? undefined });
                } else {
                  goEventMap(0, { title: title ?? undefined });
                }
              }}
            >
              <Map size={26} />
            </Button>
          }
        />

        <ScrollView
          id={EVENT_DETAIL_SCROLL_ID}
          scrollY
          enhanced
          showScrollbar={false}
          scrollTop={scrollTop}
          scrollWithAnimation
          lowerThreshold={80}
          onScrollToLower={handleScrollToLower}
          className="s-event-detail__main s-scrollbar-none"
          style={scrollHeight != null ? { height: `${scrollHeight}px` } : undefined}
        >
          <View className="s-event-detail__scroll-inner">
            <EventDetailComposerSection
              showHeaderSkeleton={showHeaderSkeleton}
              composerReady={composerReady}
              prompt={prompt}
              onPromptChange={setPrompt}
              onAiSubmit={() => openAi(prompt)}
              onShortcutTag={handleShortcutTag}
              onOpenExclusiveItinerary={handleOpenExclusiveItinerary}
              contentTab={contentTab}
              onContentTabChange={setContentTab}
              postsCount={postItems.length}
              liveCount={live.liveFeedCount}
            />

            {!showHeaderSkeleton && contentTab === 'posts' ? (
              <View className="s-event-detail__posts">
                {postsLoading ? (
                  <ThemedPageLoader variant="skeleton-event-posts" minHeight={200} />
                ) : postItems.length === 0 ? (
                  <Text className="s-event-detail__empty">
                    暂无组队帖，来发布第一条吧
                  </Text>
                ) : (
                  <EventPostsVirtualList
                    activityLegacyId={eventId}
                    onScrollToPostId={scrollToElement}
                    items={postItems}
                    highlightPostId={highlightPostId}
                    expandedCommentPostIds={expandedCommentPostIds}
                    appliedPostIds={appliedPostIds}
                    apiEnabled={apiEnabled}
                    currentUserAvatar={currentUserQuery.data?.avatar}
                    hasMore={postsQuery.hasMore}
                    isLoadingMore={postsQuery.isLoadingMore}
                    onLike={handleLikePost}
                    onToggleComments={togglePostComments}
                    onDelete={handleDeletePost}
                    onApply={handleApply}
                    onComplete={handleCompletePost}
                    onCommentSubmitted={handleCommentSubmitted}
                  />
                )}
              </View>
            ) : null}

            <EventDetailLiveSection
              visible={!showHeaderSkeleton && contentTab === 'live'}
              eventId={eventId}
              userName={displayUserName}
              updateSheetOpen={live.liveUpdateSheetOpen}
              onFeedCountChange={live.handleLiveFeedCountChange}
              onOpenUpdate={live.handleOpenLiveUpdateSheet}
              onLiveInfoActions={live.handleLiveInfoActions}
              onCloseUpdateSheet={live.handleCloseLiveUpdateSheet}
              onPublishUpdate={live.handleLiveUpdatePublish}
            />

            {!showHeaderSkeleton && showPostsEnd ? (
              <Text className="s-event-detail__end">已经到底啦 ~</Text>
            ) : null}
            {!showHeaderSkeleton && live.showLiveEnd ? (
              <Text className="s-event-detail__end">已经到底啦 ~</Text>
            ) : null}
          </View>
        </ScrollView>
      </View>
      {confirmDialog}
      <LoginInterceptHost />
      <EventDetailEntitlementModals
        eventId={eventId}
        contactUnlockExhaustedOpen={contactUnlockExhaustedOpen}
        onCloseContactUnlockExhausted={closeContactUnlockExhaustedModal}
        onUpgradeFromContactUnlock={openPackageUpgradeSheet}
        currentPaidTierId={currentPaidTierId}
        freeMonthly={freeMonthly}
        packageSheetOpen={packageSheetOpen}
        packageSheetInitialTierId={packageSheetInitialTierId}
        onClosePackageSheet={closePackageUpgradeSheet}
      />
      <BottomNavSlot />
    </View>
  );
};

export default EventDetailPage;
