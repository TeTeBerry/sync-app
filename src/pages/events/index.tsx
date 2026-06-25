import './events.scss';
import React from 'react';
import { View } from '@tarojs/components';
import { OverlayAwareScrollView } from '../../components/layout/OverlayAwareScrollView';
import ThemedPageLoader from '../../components/ThemedPageLoader';
import { EventsPageHeader } from './components/EventsPageHeader';
import { EventsActivityArtistsTab } from './components/EventsActivityArtistsTab';
import { LazyArtistProfileSheet } from '@/domains/lineup-artist';
import { LoginInterceptHost } from '../../components/auth/LoginInterceptHost';
import { EventsCatalogToolbar } from './components/EventsCatalogToolbar';
import { EventsViewTabs } from './components/EventsViewTabs';
import { EventsListTabContent } from './components/EventsListTabContent';
import { EventsCalendarTabContent } from './components/EventsCalendarTabContent';
import { useEventsPage } from './useEventsPage';

const Events: React.FC = () => {
  const page = useEventsPage();

  return (
    <View className="s-page-shell s-page-with-tabbar">
      <View className="s-page-with-tabbar__main s-events">
        <EventsPageHeader
          navInsets={page.navInsets}
          upcomingCount={page.recentUpcomingCount}
        />
        <View className="s-events__sticky-tabs">
          <EventsViewTabs
            activeTab={page.viewTab}
            onChange={page.handleViewTabChange}
          />
        </View>

        {page.viewTab === 'artists' ? (
          <EventsActivityArtistsTab
            listHeight={page.artistsTab.listScrollHeight ?? undefined}
            onOpenArtist={page.artistsTab.onOpenArtist}
          />
        ) : (
          <OverlayAwareScrollView
            scrollY
            showScrollbar={false}
            className="s-events__main s-scrollbar-none"
            style={
              page.listScrollHeight != null
                ? { height: `${page.listScrollHeight}px` }
                : undefined
            }
          >
            <View className="s-events__scroll-inner">
              {page.isLoading ? (
                <ThemedPageLoader variant="skeleton-feed" minHeight={280} />
              ) : (
                <>
                  <EventsCatalogToolbar
                    viewTab={page.viewTab}
                    searchQuery={page.eventsSearch.query}
                    onSearchChange={page.eventsSearch.setQuery}
                    region={page.regionFilter}
                    timeChip={page.timeChip}
                    aiActive={page.eventsSearch.isAiSearchActive}
                    isSearching={page.eventsSearch.isSearching}
                    onRegionChange={page.setRegionFilter}
                    onTimeChipChange={page.setTimeChip}
                  />
                  {page.viewTab === 'list' ? (
                    <EventsListTabContent
                      events={page.listTab.filteredListEvents}
                      isError={page.isError}
                      emptyText={page.listTab.listEmptyText}
                      onRetry={() => void page.refetch()}
                      showKnowledgeCard={page.listTab.showKnowledgeCard}
                      knowledgeCardFallback={page.listTab.knowledgeCardFallback}
                      eventsSearch={page.eventsSearch}
                      showHotCarousel={page.listTab.showHotCarousel}
                      hotCarouselEvents={page.listTab.hotCarouselEvents}
                      onOpenDetail={page.listTab.openDetail}
                      onWarmDetail={page.listTab.warmEventDetail}
                      onConfirmUnfollow={page.listTab.confirmUnfollow}
                    />
                  ) : (
                    <EventsCalendarTabContent
                      calendarCatalogEvents={page.calendarTab.calendarCatalogEvents}
                      year={page.calendarTab.calendarMonth.year}
                      month={page.calendarTab.calendarMonth.month}
                      selectedDay={page.calendarTab.selectedDay}
                      calendarListEvents={page.calendarTab.calendarListEvents}
                      calendarSectionTitle={page.calendarTab.calendarSectionTitle}
                      calendarEmptyText={page.calendarTab.calendarEmptyText}
                      isError={page.isError}
                      onRetry={() => void page.refetch()}
                      onMonthChange={page.calendarTab.handleMonthChange}
                      onSelectDay={page.calendarTab.handleSelectDay}
                      onOpenDetail={page.calendarTab.openDetail}
                      onWarmDetail={page.calendarTab.warmEventDetail}
                      onConfirmUnfollow={page.calendarTab.confirmUnfollow}
                    />
                  )}
                </>
              )}
            </View>
          </OverlayAwareScrollView>
        )}
      </View>
      <LazyArtistProfileSheet
        open={page.overlays.selectedArtistId != null}
        artistId={page.overlays.selectedArtistId}
        onClose={() => page.overlays.setSelectedArtistId(null)}
        reserveTabBarSpace
      />
      <LoginInterceptHost />
      {page.overlays.confirmDialog}
    </View>
  );
};

export default Events;
