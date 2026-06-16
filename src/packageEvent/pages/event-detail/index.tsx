import './event-detail.scss';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { PageTabBarChrome } from '../../../components/navigation/BottomNav';
import { LoginInterceptHost } from '../../../components/auth/LoginInterceptHost';
import EventDetailFallback from './components/EventDetailFallback';
import {
  EventDetailComposerSection,
  EVENT_DETAIL_SCROLL_ID,
} from '@/domains/partner-feed';
import { useEventDetailPage } from './useEventDetailPage';
import { AiGuidePlanSheet } from '../../../components/ai-chat/AiGuidePlanSheet';
import PageNavigation from '../../../components/navigation/PageNavigation';
import { OverlayAwareScrollView } from '../../../components/layout/OverlayAwareScrollView';
import { Text, View } from '@tarojs/components';

const EventDetailPage = () => {
  useEndRouteTransitionOnShow();
  const page = useEventDetailPage({ confirm: async () => false });

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
    title,
    metaLine,
    scrollHeight,
    scrollTop,
    scrollFrozen,
    handleScroll,
    activityStatusClass,
    showHeaderSkeleton,
    handleBack,
    handleOpenAiGuide,
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
          onScroll={(event) => handleScroll(event.detail.scrollTop)}
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

      <LoginInterceptHost />
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
