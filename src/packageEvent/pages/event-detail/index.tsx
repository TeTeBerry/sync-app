import './event-detail.scss';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { PageTabBarChrome } from '../../../components/navigation/BottomNav';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { LoginInterceptHost } from '../../../components/auth/LoginInterceptHost';
import EventDetailFallback from './components/EventDetailFallback';
import {
  EventDetailBoardSearchBar,
  EventDetailComposerSection,
  EventDetailTemplatePostFab,
  EventPostsVirtualList,
  EVENT_DETAIL_SCROLL_ID,
} from '@/domains/partner-feed';
import { useEventDetailPage } from './useEventDetailPage';
import { AiBuddyPostSheet } from '../../../components/ai-chat/AiBuddyPostSheet';
import { AiGuidePlanSheet } from '../../../components/ai-chat/AiGuidePlanSheet';
import PageNavigation from '../../../components/navigation/PageNavigation';
import { OverlayAwareScrollView } from '../../../components/layout/OverlayAwareScrollView';
import { Text, View } from '@tarojs/components';

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
    scrollFrozen,
    handleScroll,
    activityStatusClass,
    showHeaderSkeleton,
    templatePublishing,
    posts,
    postsLoading,
    showPostsEnd,
    postsQuery,
    handleBack,
    handleOpenAiGuide,
    handleOpenTemplateSheet,
    buddyPostSheetOpen,
    closeBuddyPostSheet,
    handleBuddyPostSheetSubmit,
    buddyPostActivityDate,
    buddyPostActivityTitle,
    activityTitle,
    handleOpenMyItinerary,
    handleOpenExclusiveItinerary,
    guideSheetOpen,
    closeGuideSheet,
    handleGuideSheetSubmit,
    guideDefaultNights,
    guideEventCity,
  } = page;

  return (
    <View
      data-cmp="EventDetail"
      className={[
        's-event-detail',
        's-page-with-tabbar',
        activityStatusClass,
        !showHeaderSkeleton && 's-event-detail--with-legal-footer',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <View className="s-page-with-tabbar__main s-event-detail__shell">
        <PageNavigation
          title={title ?? ''}
          meta={metaLine || undefined}
          onBack={handleBack}
        />

        <OverlayAwareScrollView
          id={EVENT_DETAIL_SCROLL_ID}
          scrollY
          enhanced
          showScrollbar={false}
          scrollTop={scrollTop}
          scrollWithAnimation={!scrollFrozen}
          lowerThreshold={80}
          onScroll={(event) => handleScroll(event.detail.scrollTop)}
          onScrollToLower={posts.handleScrollToLower}
          className="s-event-detail__main s-scrollbar-none"
          style={scrollHeight != null ? { height: `${scrollHeight}px` } : undefined}
        >
          <View className="s-event-detail__scroll-inner">
            <EventDetailComposerSection
              showHeaderSkeleton={showHeaderSkeleton}
              onAiGuideClick={handleOpenAiGuide}
              activityTitle={activityTitle}
              onOpenMyItinerary={handleOpenMyItinerary}
              onOpenExclusiveItinerary={handleOpenExclusiveItinerary}
            />

            {!showHeaderSkeleton ? (
              <View className="s-event-detail__posts">
                {posts.totalPostCount > 0 ? (
                  <EventDetailBoardSearchBar
                    value={posts.boardSearchQuery}
                    onChange={posts.setBoardSearchQuery}
                    resultCount={posts.filteredPostCount}
                    totalCount={posts.totalPostCount}
                  />
                ) : null}
                {postsLoading ? (
                  <ThemedPageLoader variant="skeleton-event-posts" minHeight={200} />
                ) : posts.totalPostCount === 0 ? (
                  <Text className="s-event-detail__empty">
                    暂无组队帖，来发布第一条吧
                  </Text>
                ) : posts.isBoardSearchActive && posts.filteredPostCount === 0 ? (
                  <Text className="s-event-detail__empty">
                    未找到匹配的组队帖，试试其他关键词
                  </Text>
                ) : (
                  <EventPostsVirtualList
                    onScrollToPostId={posts.scrollToElement}
                    items={posts.postItems}
                    highlightPostId={highlightPostId}
                    onDelete={posts.handleDeletePost}
                    hasMore={postsQuery.hasMore}
                    hasMoreLocal={posts.hasMoreVisiblePosts}
                    isLoadingMore={postsQuery.isLoadingMore}
                  />
                )}
              </View>
            ) : null}

            {!showHeaderSkeleton && showPostsEnd ? (
              <Text className="s-event-detail__end">已经到底啦 ~</Text>
            ) : null}
          </View>
        </OverlayAwareScrollView>

        {!showHeaderSkeleton ? (
          <View className="s-event-detail__legal-footer" aria-label="平台声明">
            <Text className="s-event-detail__legal-footer-text">
              本平台仅作电音节信息参考展示，不组团，不收款，不从事娱乐经营业务
            </Text>
          </View>
        ) : null}
      </View>
      {!showHeaderSkeleton ? (
        <EventDetailTemplatePostFab
          disabled={templatePublishing}
          onClick={handleOpenTemplateSheet}
        />
      ) : null}
      {confirmDialog}
      <LoginInterceptHost />
      <AiBuddyPostSheet
        open={buddyPostSheetOpen}
        activityDate={buddyPostActivityDate}
        activityTitle={buddyPostActivityTitle}
        eventCity={guideEventCity}
        onClose={closeBuddyPostSheet}
        onSubmit={(payload) => {
          void handleBuddyPostSheetSubmit(payload);
        }}
      />
      <AiGuidePlanSheet
        open={guideSheetOpen}
        defaultNights={guideDefaultNights}
        eventCity={guideEventCity}
        onClose={closeGuideSheet}
        onSubmit={handleGuideSheetSubmit}
      />
      <PageTabBarChrome />
    </View>
  );
};

export default EventDetailPage;
