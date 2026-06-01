import './event-detail.scss';
import { Map } from 'lucide-react-taro';
import { goEventMap } from '../../../utils/route';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { BottomNavSlot } from '../../../components/navigation/BottomNav';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { LoginInterceptHost } from '../../../components/auth/LoginInterceptHost';
import { EventDetailComposerSection } from './components/EventDetailComposerSection';
import { EventDetailEntitlementModals } from './components/EventDetailEntitlementModals';
import EventDetailFallback from './components/EventDetailFallback';
import EventDetailLiveSection from './components/EventDetailLiveSection';
import { EventPostsVirtualList } from './components/EventPostsVirtualList';
import { EVENT_DETAIL_SCROLL_ID } from './useEventDetailPosts';
import { useEventDetailPage } from './useEventDetailPage';
import PageNavigation from '../../../components/navigation/PageNavigation';
import { Button } from '../../../components/ui';
import { ScrollView, Text, View } from '@tarojs/components';

const EventDetailPage = () => {
  useEndRouteTransitionOnShow();
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: '取消',
  });
  const page = useEventDetailPage({ confirm });

  if (page.invalidEventId) {
    return <EventDetailFallback variant="invalidId" />;
  }

  if (page.loadError) {
    return <EventDetailFallback variant="loadError" onRetry={page.onRetryActivity} />;
  }

  if (page.showActivityMissing) {
    return <EventDetailFallback variant="missing" />;
  }

  const {
    eventId,
    highlightPostId,
    title,
    metaLine,
    scrollHeight,
    scrollTop,
    activityStatusClass,
    showHeaderSkeleton,
    composerReady,
    prompt,
    setPrompt,
    contentTab,
    setContentTab,
    live,
    posts,
    postsLoading,
    showPostsEnd,
    apiEnabled,
    currentUserAvatar,
    postsQuery,
    handleBack,
    openAi,
    handleShortcutTag,
    handleOpenAiGuide,
    handleOpenExclusiveItinerary,
    entitlements,
  } = page;

  return (
    <View
      data-cmp="EventDetail"
      className={['s-event-detail', 's-page-with-tabbar', activityStatusClass]
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
          onScrollToLower={posts.handleScrollToLower}
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
              onAiGuideClick={handleOpenAiGuide}
              onOpenExclusiveItinerary={handleOpenExclusiveItinerary}
              contentTab={contentTab}
              onContentTabChange={setContentTab}
              postsCount={posts.postItems.length}
              liveCount={live.liveFeedCount}
            />

            {!showHeaderSkeleton && contentTab === 'posts' ? (
              <View className="s-event-detail__posts">
                {postsLoading ? (
                  <ThemedPageLoader variant="skeleton-event-posts" minHeight={200} />
                ) : posts.postItems.length === 0 ? (
                  <Text className="s-event-detail__empty">
                    暂无组队帖，来发布第一条吧
                  </Text>
                ) : (
                  <EventPostsVirtualList
                    activityLegacyId={eventId}
                    onScrollToPostId={posts.scrollToElement}
                    items={posts.postItems}
                    highlightPostId={highlightPostId}
                    expandedCommentPostIds={posts.expandedCommentPostIds}
                    appliedPostIds={posts.appliedPostIds}
                    apiEnabled={apiEnabled}
                    currentUserAvatar={currentUserAvatar}
                    hasMore={postsQuery.hasMore}
                    isLoadingMore={postsQuery.isLoadingMore}
                    onLike={posts.handleLikePost}
                    onToggleComments={posts.togglePostComments}
                    onDelete={posts.handleDeletePost}
                    onApply={posts.handleApply}
                    onComplete={posts.handleCompletePost}
                    onCommentSubmitted={posts.handleCommentSubmitted}
                  />
                )}
              </View>
            ) : null}

            <EventDetailLiveSection
              visible={!showHeaderSkeleton && contentTab === 'live'}
              eventId={eventId}
              userName={page.displayUserName}
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
        eventId={entitlements.eventId}
        contactUnlockExhaustedOpen={entitlements.contactUnlockExhaustedOpen}
        onCloseContactUnlockExhausted={entitlements.closeContactUnlockExhaustedModal}
        onUpgradeFromContactUnlock={entitlements.openPackageUpgradeSheet}
        currentPaidTierId={entitlements.currentPaidTierId}
        freeMonthly={entitlements.freeMonthly}
        packageSheetOpen={entitlements.packageSheetOpen}
        packageSheetInitialTierId={entitlements.packageSheetInitialTierId}
        onClosePackageSheet={entitlements.closePackageUpgradeSheet}
      />
      <BottomNavSlot />
    </View>
  );
};

export default EventDetailPage;
