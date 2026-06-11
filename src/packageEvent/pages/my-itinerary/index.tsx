import './my-itinerary.scss';
import { Share2, Sparkles } from '../../../components/icons';
import MapFeatureDeveloping from '../../../components/MapFeatureDeveloping';
import { Button } from '../../../components/ui';
import { Canvas, ScrollView, Text, View } from '@tarojs/components';
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
  TravelPlanStatsBar,
  TravelPlanTimeline,
  useTravelPlanPage,
} from '@/domains/travel-plan';

const MyItineraryPage = () => {
  useEndRouteTransitionOnShow();
  const page = useMyItineraryPage();
  const travelPlan = useTravelPlanPage({
    activityLegacyId: page.activityLegacyId,
    eventMeta: page.eventMeta,
  });

  if (page.pageKind === 'travel') {
    return (
      <View
        data-cmp="TravelPlanPage"
        className="s-my-itinerary s-travel-plan s-page-with-tabbar"
      >
        <View className="s-page-with-tabbar__main">
          <PageNavigation
            title="我的行程计划"
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
              <TravelPlanStatsBar stats={travelPlan.stats} />
              <TravelPlanTimeline
                nodes={travelPlan.nodes}
                expandedId={travelPlan.expandedId}
                onToggleExpanded={travelPlan.toggleExpanded}
                onAddNode={travelPlan.handleAddNode}
                onDeleteNode={travelPlan.handleDeleteNode}
                onToggleConfirmed={travelPlan.toggleNodeConfirmed}
                onUpdatePrice={travelPlan.handleUpdateNodePrice}
              />
            </View>
          </ScrollView>
        </View>

        <TravelPlanAddSheet
          open={travelPlan.addSheetOpen}
          activityLegacyId={page.activityLegacyId}
          onClose={travelPlan.closeAddSheet}
          onSubmit={travelPlan.handleSaveNode}
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
          title="我的电音时间表"
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
