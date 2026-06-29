import './event-detail.scss';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { PageTabBarChrome } from '../../../components/navigation/BottomNav';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { LoginInterceptHost } from '../../../components/auth/LoginInterceptHost';
import EventDetailFallback from './components/EventDetailFallback';
import { EventDetailInfoSection } from '@/domains/activity-info';
import {
  EventDetailComposerSection,
  EventDetailPostSearchBar,
  EventDetailPostFilterBar,
  EventDetailTemplatePostFab,
  EventDetailUnityIndex,
  EventPostsVirtualList,
  EVENT_DETAIL_SCROLL_ID,
  resolveUnityRecruitCount,
} from '@/domains/partner-feed';
import { useEventDetailPage } from './useEventDetailPage';
import { LazyAiBuddyPostSheet } from '../../../components/ai-chat/LazyAiBuddyPostSheet';
import { LazyAiGuidePlanSheet } from '../../../components/ai-chat/LazyAiGuidePlanSheet';
import {
  isDomesticActivityRegion,
  shouldShowTravelGuideSelfDriveOption,
} from '../../../constants/activityMapRegion';
import PageNavigation from '../../../components/navigation/PageNavigation';
import { Button } from '../../../components/ui';
import { Share2 } from '../../../components/icons';
import { OverlayAwareScrollView } from '../../../components/layout/OverlayAwareScrollView';
import { PlatformDisclaimer } from '../../../components/legal/PlatformDisclaimer';
import { ROUTES } from '../../../utils/route';
import { Text, View } from '@tarojs/components';
import { useMemo } from 'react';
import { useT } from '@/hooks/useI18n';
import { formatBuddyPostSearchParsedSummary } from '../../../utils/formatBuddyPostSearchParsedSummary';
import { useAuthSession } from '../../../hooks/useAuthSession';
import { useBuddyMatchProfile } from '../../../hooks/useBuddyMatchProfile';

const EventDetailPage = () => {
  useEndRouteTransitionOnShow();
  const t = useT();
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: t('common.cancel'),
  });
  const page = useEventDetailPage({ confirm });
  const { loggedIn } = useAuthSession();
  const { preferencesSummary, hasPreferenceSignal } = useBuddyMatchProfile();
  const searchParsedSummary = useMemo(() => {
    if (page.posts.searchSceneParsedInsight) {
      return page.posts.searchSceneParsedInsight;
    }
    return formatBuddyPostSearchParsedSummary(page.posts.searchParsed, (count) =>
      t('eventDetail.searchParsedPeople', { count }),
    );
  }, [page.posts.searchParsed, page.posts.searchSceneParsedInsight, t]);
  const preferenceSummary = loggedIn && hasPreferenceSignal ? preferencesSummary : null;
  const activePreferenceSummary =
    page.posts.searchScenePreferenceInsight ?? preferenceSummary;
  const showPreferenceInsight =
    Boolean(activePreferenceSummary) &&
    page.posts.postFilterPreferenceSortEnabled &&
    !page.posts.searchUsedLocalFallback;

  const unityRecruitCount = useMemo(() => {
    if (!page.activity) return null;
    return resolveUnityRecruitCount(
      page.activity.recruitPostCount,
      page.postsQuery.items.length,
      !page.postsLoading,
      page.postsQuery.hasMore,
    );
  }, [page.activity, page.postsLoading, page.postsQuery.items.length]);

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
    recruitRequiresNetwork,
    showPostsEnd,
    postsQuery,
    handleOpenAiGuide,
    handleOpenTemplateSheet,
    handleEditPost,
    buddyPostSheetOpen,
    isBuddyPostEditing,
    closeBuddyPostSheet,
    handleBuddyPostSheetSubmit,
    buddyPostActivityDate,
    buddyPostActivityTitle,
    buddyPostSheetInitialValues,
    buddyPostPrefillSummaryLines,
    buddyPostPrefillBannerTitle,
    handleOpenMyItinerary,
    handleOpenActivityLineup,
    handleOpenExclusiveItinerary,
    guideSheetOpen,
    closeGuideSheet,
    handleGuideSheetSubmit,
    guideDefaultNights,
    guideEventCity,
    guideSheetInitialValues,
    guideSheetForceRegenerate,
    currentUserAvatar,
    publishComplianceConfirmDialog,
    buddyPostQuota,
    isWeapp,
    festivalPlanChecklist,
    onFestivalPlanTaskPress,
    prepNudgeUnreadReplyCount,
    onPrepNudgeAction,
    travelGuideGenerated,
    activity,
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
          pinScroll={scrollFrozen}
          scrollWithAnimation={!scrollFrozen}
          lowerThreshold={80}
          onScroll={(event) => handleScroll(event.detail.scrollTop)}
          onScrollToLower={posts.handleScrollToLower}
          className="s-event-detail__main s-scrollbar-none"
          style={scrollHeight != null ? { height: `${scrollHeight}px` } : undefined}
        >
          <View className="s-event-detail__scroll-inner">
            {!showHeaderSkeleton ? (
              <EventDetailInfoSection
                activity={activity}
                activityLegacyId={page.eventId}
                onOpenLineup={handleOpenActivityLineup}
              />
            ) : null}

            {!showHeaderSkeleton ? (
              <View className="s-event-detail-hub">
                <EventDetailComposerSection
                  onAiGuideClick={handleOpenAiGuide}
                  onOpenMyItinerary={handleOpenMyItinerary}
                  onOpenExclusiveItinerary={handleOpenExclusiveItinerary}
                  showFestivalPlan={loggedIn && Boolean(festivalPlanChecklist)}
                  festivalPlanChecklist={festivalPlanChecklist}
                  onFestivalPlanTaskPress={onFestivalPlanTaskPress}
                  travelGuideGenerated={travelGuideGenerated}
                  travelGuideSupported={activity?.travelGuideSupported}
                  lineupPublished={activity?.lineupPublished}
                  unreadReplyCount={prepNudgeUnreadReplyCount}
                  onPrepNudgeAction={onPrepNudgeAction}
                  activityLegacyId={page.eventId}
                />

                <View className="s-event-detail-recruit">
                  <View className="s-event-detail__recruit-head">
                    <Text className="s-event-detail__recruit-title">
                      {t('eventDetail.recruitSectionTitle')}
                    </Text>
                    {posts.postFiltersActive && !posts.searchActive ? (
                      <Text
                        className="s-event-detail__recruit-clear"
                        onClick={posts.clearPostFilters}
                        role="button"
                      >
                        {t('eventDetail.clearFilter')}
                      </Text>
                    ) : null}
                  </View>
                  {unityRecruitCount != null && !recruitRequiresNetwork ? (
                    <EventDetailUnityIndex
                      recruitCount={unityRecruitCount}
                      registerCount={activity?.attendees ?? 0}
                      onPostRecruit={handleOpenTemplateSheet}
                    />
                  ) : null}
                  {recruitRequiresNetwork ? (
                    <Text className="s-event-detail__recruit-offline s-event-detail__recruit-offline--inline">
                      {t('eventDetail.recruitRequiresNetwork')}
                    </Text>
                  ) : (
                    <View className="s-event-detail-recruit__panel">
                      <EventDetailPostFilterBar
                        cityOptions={posts.postFilterCityOptions}
                        selectedCity={posts.postFilterSelectedCity}
                        onSelectedCityChange={posts.setPostFilterSelectedCity}
                        recruitingOnly={posts.postFilterRecruitingOnly}
                        onRecruitingOnlyChange={posts.setPostFilterRecruitingOnly}
                        showPreferenceSort={loggedIn && hasPreferenceSignal}
                        preferenceSortEnabled={posts.postFilterPreferenceSortEnabled}
                        onPreferenceSortEnabledChange={
                          posts.setPostFilterPreferenceSortEnabled
                        }
                        disabled={posts.searchActive}
                      />
                      <EventDetailPostSearchBar
                        value={posts.searchQuery}
                        onChange={posts.setSearchQuery}
                        onClear={posts.clearSearchQuery}
                        isSearching={posts.searchLoading}
                        matchedCount={posts.searchMatchedCount}
                        usedLocalFallback={posts.searchUsedLocalFallback}
                        parsedSummary={searchParsedSummary}
                        preferenceSummary={
                          showPreferenceInsight ? activePreferenceSummary : null
                        }
                        hasPreferenceRanking={showPreferenceInsight}
                        travelGuidePrefillHint={posts.travelGuideSearchPrefillHint}
                      />
                    </View>
                  )}
                </View>
              </View>
            ) : null}

            <View id="event-detail-posts" className="s-event-detail__posts">
              {postsLoading ? (
                <ThemedPageLoader variant="skeleton-event-posts" minHeight={160} />
              ) : !showHeaderSkeleton &&
                posts.searchActive &&
                !posts.searchLoading &&
                posts.totalPostCount === 0 ? (
                <View className="s-event-detail__search-empty">
                  <Text className="s-event-detail__search-empty-title">
                    {t('eventDetail.searchEmptyTitle')}
                  </Text>
                  <Text className="s-event-detail__search-empty-hint">
                    {t('eventDetail.searchEmptyHint')}
                  </Text>
                  <Button
                    className="s-event-detail__search-empty-btn"
                    onClick={handleOpenTemplateSheet}
                  >
                    <Text className="s-event-detail__search-empty-btn-text">
                      {t('eventDetail.searchEmptyCta')}
                    </Text>
                  </Button>
                  <Text className="s-event-detail__search-empty-compliance">
                    {t('eventDetail.searchEmptyCompliance')}
                  </Text>
                </View>
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
                  getCommentDraft={posts.getCommentDraft}
                  currentUserAvatar={currentUserAvatar}
                  onOpenComments={posts.openPostComments}
                  onApplyJoin={posts.openApplyJoinComments}
                  onCloseComments={posts.closePostComments}
                  onCommentSubmitted={posts.handleCommentSubmitted}
                  onDelete={posts.handleDeletePost}
                  onEdit={handleEditPost}
                  onRecruitStatusToggle={posts.handleRecruitStatusToggle}
                  onRecruitSlotsAdjust={posts.handleRecruitSlotsAdjust}
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
      {!showHeaderSkeleton && !buddyPostSheetOpen && !guideSheetOpen ? (
        <EventDetailTemplatePostFab
          disabled={templatePublishing}
          onClick={handleOpenTemplateSheet}
        />
      ) : null}
      {confirmDialog}
      <LoginInterceptHost />
      {buddyPostSheetOpen ? (
        <LazyAiBuddyPostSheet
          open
          mode={isBuddyPostEditing ? 'edit' : 'create'}
          activityLegacyId={page.eventId}
          activityDate={buddyPostActivityDate}
          activityTitle={buddyPostActivityTitle}
          eventCity={guideEventCity}
          initialValues={buddyPostSheetInitialValues}
          prefillSummaryLines={buddyPostPrefillSummaryLines}
          prefillBannerTitle={buddyPostPrefillBannerTitle}
          sheetTitle={isBuddyPostEditing ? t('eventDetail.editPost') : null}
          submitLabel={isBuddyPostEditing ? t('eventDetail.saveBuddyPost') : null}
          postQuota={isBuddyPostEditing ? undefined : (buddyPostQuota ?? undefined)}
          onClose={closeBuddyPostSheet}
          onSubmit={handleBuddyPostSheetSubmit}
        />
      ) : null}
      {guideSheetOpen ? (
        <LazyAiGuidePlanSheet
          open
          defaultNights={guideDefaultNights}
          eventCity={guideEventCity}
          showSelfDriveOption={shouldShowTravelGuideSelfDriveOption(activity?.region)}
          showAccommodationOption={isDomesticActivityRegion(activity?.region)}
          initialValues={guideSheetInitialValues}
          forceRegenerate={guideSheetForceRegenerate}
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
