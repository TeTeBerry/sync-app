import './event-detail.scss';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { PageTabBarChrome } from '../../../components/navigation/BottomNav';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { LoginInterceptHost } from '../../../components/auth/LoginInterceptHost';
import EventDetailFallback from './components/EventDetailFallback';
import {
  EventDetailComposerSection,
  EventDetailPostSearchBar,
  EventDetailTemplatePostFab,
  EventPostsVirtualList,
  EVENT_DETAIL_SCROLL_ID,
} from '@/domains/partner-feed';
import { useEventDetailPage } from './useEventDetailPage';
import { AiBuddyPostSheet } from '../../../components/ai-chat/AiBuddyPostSheet';
import { AiGuidePlanSheet } from '../../../components/ai-chat/AiGuidePlanSheet';
import PageNavigation from '../../../components/navigation/PageNavigation';
import { Button } from '../../../components/ui';
import { Share2 } from '../../../components/icons';
import { OverlayAwareScrollView } from '../../../components/layout/OverlayAwareScrollView';
import { PlatformDisclaimer } from '../../../components/legal/PlatformDisclaimer';
import { ROUTES } from '../../../utils/route';
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
    currentUserAvatar,
    publishComplianceConfirmDialog,
    buddyPostQuota,
    isWeapp,
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
          title={title || (showHeaderSkeleton ? '加载中…' : '')}
          meta={metaLine || undefined}
          fallback={ROUTES.EVENTS}
          trailing={
            !showHeaderSkeleton && isWeapp ? (
              <Button
                className="s-page-nav__icon-action"
                aria-label="分享活动"
                openType="share"
              >
                <Share2 size={18} color="#fff" />
              </Button>
            ) : undefined
          }
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

            <View id="event-detail-posts" className="s-event-detail__posts">
              {!showHeaderSkeleton ? (
                <EventDetailPostSearchBar
                  value={posts.searchQuery}
                  onChange={posts.setSearchQuery}
                  onClear={posts.clearSearchQuery}
                  isSearching={posts.searchLoading}
                  matchedCount={posts.searchMatchedCount}
                />
              ) : null}
              {postsLoading ? (
                <ThemedPageLoader variant="skeleton-event-posts" minHeight={160} />
              ) : !showHeaderSkeleton &&
                posts.searchActive &&
                posts.totalPostCount === 0 ? (
                <Text className="s-event-detail__empty">
                  未找到匹配的帖子，试试其他关键词
                </Text>
              ) : !showHeaderSkeleton && posts.totalPostCount === 0 ? (
                <Text className="s-event-detail__empty">
                  暂无组队帖，来发布第一条吧
                </Text>
              ) : posts.totalPostCount > 0 ? (
                <EventPostsVirtualList
                  onScrollToPostId={posts.scrollToElement}
                  items={posts.postItems}
                  highlightPostId={highlightPostId}
                  expandedCommentPostIds={posts.expandedCommentPostIds}
                  currentUserAvatar={currentUserAvatar}
                  onOpenComments={posts.openPostComments}
                  onCloseComments={posts.closePostComments}
                  onCommentSubmitted={posts.handleCommentSubmitted}
                  onDelete={posts.handleDeletePost}
                  hasMore={postsQuery.hasMore}
                  hasMoreLocal={posts.hasMoreVisiblePosts}
                  isLoadingMore={postsQuery.isLoadingMore}
                />
              ) : null}
            </View>

            {!showHeaderSkeleton && showPostsEnd ? (
              <Text className="s-event-detail__end">已经到底啦 ~</Text>
            ) : null}
          </View>
        </OverlayAwareScrollView>

        {!showHeaderSkeleton ? <PlatformDisclaimer variant="fixed" /> : null}
      </View>
      {!showHeaderSkeleton ? (
        <EventDetailTemplatePostFab
          disabled={templatePublishing}
          onClick={handleOpenTemplateSheet}
        />
      ) : null}
      {confirmDialog}
      <LoginInterceptHost />
      {buddyPostSheetOpen ? (
        <AiBuddyPostSheet
          open
          activityDate={buddyPostActivityDate}
          activityTitle={buddyPostActivityTitle}
          eventCity={guideEventCity}
          postQuota={buddyPostQuota ?? undefined}
          onClose={closeBuddyPostSheet}
          onSubmit={(payload) => {
            void handleBuddyPostSheetSubmit(payload);
          }}
        />
      ) : null}
      {guideSheetOpen ? (
        <AiGuidePlanSheet
          open
          defaultNights={guideDefaultNights}
          eventCity={guideEventCity}
          onClose={closeGuideSheet}
          onSubmit={handleGuideSheetSubmit}
        />
      ) : null}
      <PageTabBarChrome />
      {publishComplianceConfirmDialog}
    </View>
  );
};

export default EventDetailPage;
