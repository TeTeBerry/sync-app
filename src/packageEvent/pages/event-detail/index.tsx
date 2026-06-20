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
  EventDetailPostFilterBar,
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
import { useT } from '@/hooks/useI18n';
import { useAuthSession } from '../../../hooks/useAuthSession';

const EventDetailPage = () => {
  useEndRouteTransitionOnShow();
  const t = useT();
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: t('common.cancel'),
  });
  const page = useEventDetailPage({ confirm });
  const { loggedIn } = useAuthSession();

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
    buddyPostSheetInitialValues,
    buddyPostPrefillSummaryLines,
    buddyPostPrefillBannerTitle,
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
    festivalPlanChecklist,
    onFestivalPlanTaskPress,
    travelGuideGenerated,
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
          title={title || (showHeaderSkeleton ? t('common.loading') : '')}
          meta={metaLine || undefined}
          fallback={ROUTES.EVENTS}
          trailing={
            !showHeaderSkeleton && isWeapp ? (
              <Button
                className="s-page-nav__icon-action"
                aria-label={t('common.openDetail')}
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
              showFestivalPlan={loggedIn && Boolean(festivalPlanChecklist)}
              festivalPlanChecklist={festivalPlanChecklist}
              onFestivalPlanTaskPress={onFestivalPlanTaskPress}
              travelGuideGenerated={travelGuideGenerated}
            />

            <View id="event-detail-posts" className="s-event-detail__posts">
              {!showHeaderSkeleton ? (
                <>
                  <EventDetailPostFilterBar
                    cityOptions={posts.postFilterCityOptions}
                    selectedCity={posts.postFilterSelectedCity}
                    onSelectedCityChange={posts.setPostFilterSelectedCity}
                    disabled={posts.searchActive}
                    isActive={posts.postFiltersActive}
                    onClear={posts.clearPostFilters}
                  />
                  <EventDetailPostSearchBar
                    value={posts.searchQuery}
                    onChange={posts.setSearchQuery}
                    onClear={posts.clearSearchQuery}
                    isSearching={posts.searchLoading}
                    matchedCount={posts.searchMatchedCount}
                    usedLocalFallback={posts.searchUsedLocalFallback}
                  />
                </>
              ) : null}
              {postsLoading ? (
                <ThemedPageLoader variant="skeleton-event-posts" minHeight={160} />
              ) : !showHeaderSkeleton &&
                posts.searchActive &&
                posts.totalPostCount === 0 ? (
                <Text className="s-event-detail__empty">
                  {t('eventDetail.searchEmpty')}
                </Text>
              ) : !showHeaderSkeleton && posts.totalPostCount === 0 ? (
                <Text className="s-event-detail__empty">
                  {t('eventDetail.postsEmpty')}
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
                  hiddenLocalCount={posts.hiddenPostCount}
                  onShowMoreLocal={posts.showMoreVisiblePosts}
                  isLoadingMore={postsQuery.isLoadingMore}
                />
              ) : null}
            </View>

            {!showHeaderSkeleton && showPostsEnd ? (
              <Text className="s-event-detail__end">{t('eventDetail.endOfList')}</Text>
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
          initialValues={buddyPostSheetInitialValues}
          prefillSummaryLines={buddyPostPrefillSummaryLines}
          prefillBannerTitle={buddyPostPrefillBannerTitle}
          postQuota={buddyPostQuota ?? undefined}
          onClose={closeBuddyPostSheet}
          onSubmit={handleBuddyPostSheetSubmit}
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
