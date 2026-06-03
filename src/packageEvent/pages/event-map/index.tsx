import './event-map.scss';
import Taro, { useRouter } from '@tarojs/taro';
import { useCallback, useMemo, useState } from 'react';
import { Image, Text, View, Canvas } from '@tarojs/components';
import { Minus, Plus, Share2 } from '../../../components/icons';
import { Button } from '../../../components/ui';
import PageNavigation from '../../../components/navigation/PageNavigation';
import { useNavBarInsets } from '../../../hooks/useNavBarInsets';
import { decodeRouteQueryParam, ROUTES } from '../../../utils/route';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { usePageRouteReady } from '../../../hooks/usePageRouteReady';
import { VENUE_MAP_IMAGE_SRC } from '../../../components/venue-map/venueMapAsset';
import { useVenueMap } from '../../../components/venue-map/useVenueMap';
import { VenueMapNameSheet } from '../../../components/venue-map/VenueMapNameSheet';
import {
  renderVenueMapShareImage,
  VENUE_MAP_EXPORT_CANVAS_ID,
} from '../../../components/venue-map/renderVenueMapShareImage';
import {
  saveTravelGuideImageToAlbum,
  shareTravelGuideImage,
} from '../../../utils/travelGuideShare';

const TOP_BAR_CONTENT_PX = 52;
const BOTTOM_ACTION_BAR_PX = 88;

const EventMapPage = () => {
  useEndRouteTransitionOnShow();
  const router = useRouter();
  const navInsets = useNavBarInsets();
  const [exporting, setExporting] = useState(false);

  const eventTitle = useMemo(() => {
    const fromRoute = decodeRouteQueryParam(router.params.title);
    return fromRoute || 'STORM 电音节';
  }, [router.params.title]);

  const win = Taro.getWindowInfo();
  const windowWidth = win.windowWidth;
  const windowHeight = win.windowHeight;
  const safeBottom =
    win.safeArea != null ? Math.max(0, windowHeight - win.safeArea.bottom) : 0;
  const topChromePx = navInsets.paddingTop + TOP_BAR_CONTENT_PX;
  const mapViewHeight = Math.max(
    200,
    windowHeight - topChromePx - BOTTOM_ACTION_BAR_PX - safeBottom,
  );

  const venue = useVenueMap({
    viewWidth: windowWidth,
    viewHeight: mapViewHeight,
    stageTopFallbackPx: topChromePx,
  });

  const exportAndRun = useCallback(
    async (runner: (path: string) => Promise<void>) => {
      if (!venue.marker || venue.phase !== 'placed') {
        void Taro.showToast({ title: '请先长按地图添加集合点', icon: 'none' });
        return;
      }
      setExporting(true);
      void Taro.showLoading({ title: '生成图片…', mask: true });
      try {
        await new Promise<void>((resolve) => {
          Taro.nextTick(() => setTimeout(resolve, 60));
        });
        const path = await renderVenueMapShareImage(venue.marker, {
          displayMapWidthPx: venue.mapSize.width || windowWidth,
        });
        await runner(path);
      } catch (error) {
        const message = error instanceof Error ? error.message : '生成失败';
        void Taro.showToast({ title: message, icon: 'none' });
      } finally {
        Taro.hideLoading();
        setExporting(false);
      }
    },
    [venue.mapSize.width, venue.marker, venue.phase, windowWidth],
  );

  const handleSave = useCallback(() => {
    void exportAndRun(async (path) => {
      await saveTravelGuideImageToAlbum(path);
      void Taro.showToast({
        title: '已保存到相册',
        icon: 'success',
      });
    });
  }, [exportAndRun]);

  const handleShare = useCallback(() => {
    void exportAndRun(async (path) => {
      await shareTravelGuideImage(path);
    });
  }, [exportAndRun]);

  const mapReady = venue.mapSize.width > 0;
  usePageRouteReady(mapReady);

  return (
    <View className="s-event-map">
      <PageNavigation
        className="s-event-map__top"
        title={eventTitle}
        fallback={ROUTES.EVENT_DETAIL}
      />

      <View
        className="s-event-map__stage"
        style={{ height: `${mapViewHeight}px` }}
        catchMove
        onTouchStart={venue.handleTouchStart}
        onTouchMove={venue.handleTouchMove}
        onTouchEnd={venue.handleTouchEnd}
        onTouchCancel={venue.handleTouchCancel}
      >
        {mapReady ? (
          <View className="s-event-map__world" style={venue.worldLayoutStyle}>
            <Image
              className="s-event-map__image"
              src={VENUE_MAP_IMAGE_SRC}
              mode="aspectFill"
              showMenuByLongpress={false}
            />
          </View>
        ) : (
          <View className="s-event-map__loading">
            <Text className="s-event-map__loading-text">加载场馆图…</Text>
          </View>
        )}

        {venue.pinScreen && venue.marker ? (
          <View
            className={[
              's-event-map__pin',
              venue.phase === 'naming' ? 's-event-map__pin--pending' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              left: `${venue.pinScreen.x}px`,
              top: `${venue.pinScreen.y}px`,
            }}
          >
            {venue.phase === 'placed' && venue.marker.label ? (
              <Text className="s-event-map__pin-label">{venue.marker.label}</Text>
            ) : (
              <Text className="s-event-map__pin-label s-event-map__pin-label--temp">
                集合点
              </Text>
            )}
            <View className="s-event-map__pin-bubble" aria-hidden />
          </View>
        ) : null}

        <View className="s-event-map__hint-bar">
          <Text className="s-event-map__hint">
            {venue.phase === 'naming'
              ? venue.nameSheetOpen
                ? '可拖动标记微调位置'
                : '拖动标记调整位置，完成后点击命名'
              : venue.phase === 'placed'
                ? '拖动标记可微调位置'
                : '长按地图选择集合位置'}
          </Text>
          {venue.phase === 'naming' && !venue.nameSheetOpen ? (
            <Button
              className="s-event-map__name-cta"
              hoverClass="s-event-map__name-cta--pressed"
              onTap={venue.openNameSheet}
            >
              为标记命名
            </Button>
          ) : null}
        </View>

        <View className="s-event-map__zoom">
          <Button
            className="s-event-map__zoom-btn"
            aria-label="放大"
            hoverClass="s-event-map__zoom-btn--pressed"
            onTap={venue.handleZoomIn}
          >
            <Plus size={20} />
          </Button>
          <Button
            className="s-event-map__zoom-btn"
            aria-label="缩小"
            hoverClass="s-event-map__zoom-btn--pressed"
            onTap={venue.handleZoomOut}
          >
            <Minus size={20} />
          </Button>
        </View>
      </View>

      <View className="s-event-map__bottom">
        <Button
          className={[
            's-event-map__action',
            's-event-map__action--secondary',
            venue.canShare && !exporting ? '' : 's-event-map__action--disabled',
          ]
            .filter(Boolean)
            .join(' ')}
          hoverClass="s-event-map__action--pressed"
          onTap={venue.canShare && !exporting ? handleSave : undefined}
        >
          保存图片
        </Button>
        <Button
          className={[
            's-event-map__action',
            's-event-map__action--primary',
            venue.canShare && !exporting ? '' : 's-event-map__action--disabled',
          ]
            .filter(Boolean)
            .join(' ')}
          hoverClass="s-event-map__action--pressed"
          onTap={venue.canShare && !exporting ? handleShare : undefined}
        >
          <Share2 size={18} color="#fff" />
          <Text>分享到微信群</Text>
        </Button>
      </View>

      <VenueMapNameSheet
        open={venue.nameSheetOpen}
        value={venue.draftLabel}
        onChange={venue.setDraftLabel}
        onConfirm={venue.confirmMarkerName}
        onCancel={venue.cancelMarkerNaming}
      />

      {exporting ? (
        <Canvas
          type="2d"
          id={VENUE_MAP_EXPORT_CANVAS_ID}
          className="s-event-map__export-canvas"
        />
      ) : null}
    </View>
  );
};

export default EventMapPage;
