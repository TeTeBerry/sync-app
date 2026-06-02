import './my-itinerary.scss';
import { Map, Share2, Sparkles } from '../../../components/icons';
import { Button } from '../../../components/ui';
import { Canvas, ScrollView, Text, View } from '@tarojs/components';
import PageNavigation from '../../../components/navigation/PageNavigation';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { ITINERARY_WALLPAPER_CANVAS_ID } from './generateItineraryWallpaper';
import MyItineraryTimeline from './components/MyItineraryTimeline';
import { MyItineraryFooter, MyItinerarySegment } from './components/MyItineraryToolbar';
import { useMyItineraryPage } from './useMyItineraryPage';

const MyItineraryPage = () => {
  useEndRouteTransitionOnShow();
  const {
    eventMeta,
    bannerCopy,
    itineraryDays,
    viewMode,
    setViewMode,
    activeDayId,
    setActiveDayId,
    mainScrollHeight,
    handleShare,
    handleReselect,
    handleSave,
    navFallback,
  } = useMyItineraryPage();

  return (
    <View data-cmp="MyItineraryPage" className="s-my-itinerary">
      <Canvas
        type="2d"
        id={ITINERARY_WALLPAPER_CANVAS_ID}
        className="s-my-itinerary__wallpaper-canvas"
        aria-hidden
      />
      <PageNavigation
        title="我的专属行程"
        meta={`Auto Generated · ${eventMeta}`}
        fallback={navFallback}
        trailing={
          <Button
            className="s-my-itinerary__share-btn"
            aria-label="分享"
            hoverClass="s-my-itinerary__share-btn--pressed"
            onTap={handleShare}
          >
            <Share2 size={20} />
          </Button>
        }
      />

      <MyItinerarySegment viewMode={viewMode} onViewModeChange={setViewMode} />

      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        className="s-my-itinerary__scroll s-scrollbar-none"
        style={
          mainScrollHeight != null ? { height: `${mainScrollHeight}px` } : undefined
        }
      >
        <View className="s-my-itinerary__inner">
          <View className="s-my-itinerary__banner">
            <View className="s-my-itinerary__banner-icon" aria-hidden>
              <Sparkles size={20} color="var(--primary)" />
            </View>
            <View className="s-my-itinerary__banner-body">
              <Text className="s-my-itinerary__banner-title">{bannerCopy.title}</Text>
              <Text className="s-my-itinerary__banner-sub">{bannerCopy.subtitle}</Text>
            </View>
          </View>

          {viewMode === 'timeline' ? (
            <MyItineraryTimeline
              itineraryDays={itineraryDays}
              activeDayId={activeDayId}
              onActiveDayChange={setActiveDayId}
            />
          ) : (
            <View className="s-my-itinerary__map-placeholder">
              <Map size={36} color="#8e8e93" aria-hidden />
              <Text className="s-my-itinerary__map-placeholder-text">
                地图视图即将上线
              </Text>
              <Text className="s-my-itinerary__map-placeholder-sub">
                场馆地图与演出点位导航功能开发中
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <MyItineraryFooter onReselect={handleReselect} onSave={handleSave} />
    </View>
  );
};

export default MyItineraryPage;
