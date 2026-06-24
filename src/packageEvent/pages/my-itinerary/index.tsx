import './my-itinerary.scss';
import { Share2, Sparkles } from '../../../components/icons';
import MapFeatureDeveloping from '../../../components/MapFeatureDeveloping';
import { Button } from '../../../components/ui';
import { Canvas, ScrollView, Text, View } from '@tarojs/components';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { PageTabBarChrome } from '../../../components/navigation/BottomNav';
import PageNavigation from '../../../components/navigation/PageNavigation';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import {
  ITINERARY_WALLPAPER_CANVAS_ID,
  MyItineraryFooter,
  MyItinerarySegment,
  MyItineraryTimeline,
  useMyItineraryPage,
} from '@/domains/performance-itinerary';
import {
  TravelPlanAddSheet,
  TravelPlanHeaderAction,
  TravelPlanSplitSheet,
  TravelPlanStatsBar,
  TravelPlanTimeline,
  useTravelPlanPage,
} from '@/domains/travel-plan';
import { PerformanceBundleStaleBanner } from '@/domains/activity-info/components/PerformanceBundleStaleBanner';
import { useT } from '@/hooks/useI18n';

const MyItineraryPage = () => {
  useEndRouteTransitionOnShow();
  const page = useMyItineraryPage();
  const travelPlan = useTravelPlanPage({
    activityLegacyId: page.activityLegacyId,
    eventMeta: page.eventMeta,
    queryHeadcount: page.queryHeadcount,
  });
  const t = useT();

  if (!page.pageKindResolved) {
    return (
      <View data-cmp="MyItineraryPage" className="s-my-itinerary s-page-with-tabbar">
        <ThemedPageLoader variant="skeleton-feed" minHeight={320} />
        <PageTabBarChrome />
      </View>
    );
  }

  if (page.pageKind === 'travel') {
    return (
      <View
        data-cmp="TravelPlanPage"
        className="s-my-itinerary s-travel-plan s-page-with-tabbar"
      >
        <View className="s-page-with-tabbar__main">
          <PageNavigation
            title={t('itinerary.travelTitle')}
            meta={travelPlan.pageMeta}
            fallback={page.navFallback}
            trailing={<TravelPlanHeaderAction onAdd={travelPlan.handleAddNode} />}
          />

          <ScrollView
            scrollY
            enhanced
            showScrollbar={false}
            className="s-travel-plan__scroll s-scrollbar-none"
            style={
              page.mainScrollHeight != null
                ? { height: `${page.mainScrollHeight}px` }
                : undefined
            }
          >
            <View className="s-travel-plan__inner">
              <TravelPlanStatsBar
                stats={travelPlan.stats}
                copyingSplitSummary={travelPlan.copyingSplitSummary}
                onSplitCountChange={travelPlan.handleSplitCountChange}
                onCopySplitSummary={travelPlan.handleCopySplitSummary}
              />
              <TravelPlanTimeline
                nodes={travelPlan.nodes}
                pageSplitCount={travelPlan.splitCount}
                expandedId={travelPlan.expandedId}
                onToggleExpanded={travelPlan.toggleExpanded}
                onAddNode={travelPlan.handleAddNode}
                onEditNode={travelPlan.handleEditNode}
                onDeleteNode={travelPlan.handleDeleteNode}
                onNodeSplitChange={travelPlan.handleNodeSplitChange}
                onUpdatePrice={travelPlan.handleUpdateNodePrice}
              />
            </View>
          </ScrollView>
        </View>

        <TravelPlanAddSheet
          open={travelPlan.addSheetOpen}
          mode={travelPlan.addSheetMode}
          activityLegacyId={page.activityLegacyId}
          initialValues={travelPlan.editSheetInitialValues ?? undefined}
          onClose={travelPlan.closeAddSheet}
          onSubmit={travelPlan.handleSaveNode}
        />

        <TravelPlanSplitSheet
          open={travelPlan.splitSheetOpen}
          defaultSplitCount={travelPlan.pendingSplitCount}
          defaultSplitEnabled={travelPlan.pendingSplitEnabled}
          totalAmount={travelPlan.pendingSplitAmount}
          onClose={travelPlan.closeSplitSheet}
          onConfirm={travelPlan.handleSplitConfirm}
        />

        {travelPlan.confirmDialog}
        <PageTabBarChrome />
      </View>
    );
  }

  return (
    <View data-cmp="MyItineraryPage" className="s-my-itinerary s-page-with-tabbar">
      <Canvas
        type="2d"
        id={ITINERARY_WALLPAPER_CANVAS_ID}
        className="s-my-itinerary__wallpaper-canvas"
        aria-hidden
      />
      <View className="s-page-with-tabbar__main">
        <PageNavigation
          title={t('itinerary.title')}
          meta={`Auto Generated · ${page.eventMeta}`}
          fallback={page.navFallback}
          trailing={
            <Button
              className="s-my-itinerary__share-btn"
              aria-label="分享"
              hoverClass="s-my-itinerary__share-btn--pressed"
              onTap={page.handleShare}
            >
              <Share2 size={20} />
            </Button>
          }
        />

        <MyItinerarySegment
          viewMode={page.viewMode}
          onViewModeChange={page.setViewMode}
        />

        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          className="s-my-itinerary__scroll s-scrollbar-none"
          style={
            page.mainScrollHeight != null
              ? { height: `${page.mainScrollHeight}px` }
              : undefined
          }
        >
          <View className="s-my-itinerary__inner">
            {page.isOfflineBundle && page.bundleSavedAt != null ? (
              <PerformanceBundleStaleBanner savedAt={page.bundleSavedAt} />
            ) : null}

            <View className="s-my-itinerary__banner">
              <View className="s-my-itinerary__banner-icon" aria-hidden>
                <Sparkles size={20} color="var(--primary)" />
              </View>
              <View className="s-my-itinerary__banner-body">
                <Text className="s-my-itinerary__banner-title">
                  {page.bannerCopy.title}
                </Text>
                <Text className="s-my-itinerary__banner-sub">
                  {page.bannerCopy.subtitle}
                </Text>
              </View>
            </View>

            {page.viewMode === 'timeline' ? (
              <MyItineraryTimeline
                itineraryDays={page.itineraryDays}
                activeDayId={page.activeDayId}
                onActiveDayChange={page.setActiveDayId}
              />
            ) : (
              <MapFeatureDeveloping className="s-my-itinerary__map-placeholder" />
            )}
          </View>
        </ScrollView>

        <MyItineraryFooter onReselect={page.handleReselect} onSave={page.handleSave} />
      </View>

      <PageTabBarChrome />
    </View>
  );
};

export default MyItineraryPage;
