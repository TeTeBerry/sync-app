import "./event-map.scss";
import Taro, { useRouter } from "@tarojs/taro";
import { useCallback, useMemo, useState } from "react";
import { Bell, Minus, Plane, Plus } from "lucide-react-taro";
import { Button, Canvas, Image, Text, View } from "@tarojs/components";
import { EventMapUserPostsSheet } from "../../../components/event-map/EventMapUserPostsSheet";
import { useEventMapController } from "../../../components/event-map/useEventMapController";
import {
  EVENT_MAP_TOP_BAR_CONTENT_PX,
} from "../../../components/event-map/eventMapLayout";
import {
  EVENT_MAP_BOTTOM_ROW,
  EVENT_MAP_DEFAULT_TITLE,
  markerAvatarUrl,
  type EventMapMarker,
} from "../../../components/event-map/eventMapMarkers";
import PageNavigation from "../../../components/PageNavigation";
import { useNavBarInsets } from "../../../hooks/useNavBarInsets";
import { decodeRouteQueryParam, ROUTES } from "../../../utils/route";
import { useEndRouteTransitionOnShow } from "../../../hooks/useEndRouteTransitionOnShow";

function showMapToast(label: string) {
  void Taro.showToast({ title: label, icon: "none", duration: 1200 });
}

const EventMapPage = () => {
  useEndRouteTransitionOnShow();
  const router = useRouter();
  const navInsets = useNavBarInsets();
  const [postsSheetMarker, setPostsSheetMarker] = useState<EventMapMarker | null>(
    null,
  );

  const eventTitle = useMemo(() => {
    const fromRoute = decodeRouteQueryParam(router.params.title);
    return fromRoute || EVENT_MAP_DEFAULT_TITLE;
  }, [router.params.title]);

  const activityLegacyId = useMemo(() => {
    const fromRoute = Number(router.params.activityLegacyId);
    return Number.isFinite(fromRoute) && fromRoute > 0 ? fromRoute : undefined;
  }, [router.params.activityLegacyId]);

  const openUserPosts = useCallback((marker: EventMapMarker) => {
    setPostsSheetMarker(marker);
  }, []);

  const closeUserPosts = useCallback(() => {
    setPostsSheetMarker(null);
  }, []);

  const topChromePx = navInsets.paddingTop + EVENT_MAP_TOP_BAR_CONTENT_PX;

  const {
    canvasId,
    canvasStyle,
    handleCanvasReady,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    handleZoomIn,
    handleZoomOut,
  } = useEventMapController({
    eventTitle,
    onMarkerTap: openUserPosts,
    topChromePx,
  });

  return (
    <View className="s-event-map">
      <PageNavigation
        className="s-event-map__top"
        fallback={ROUTES.EVENT_DETAIL}
        trailing={
          <Button
            className="s-page-nav__icon-action s-page-nav__icon-action--overlay"
            aria-label="通知"
            hoverClass="s-page-nav__icon-action--pressed"
            onTap={() => showMapToast("通知即将上线")}>
            <Bell size={18} />
          </Button>
        }
      />

      <View className="s-event-map__stage">
        <Canvas
          type="2d"
          id={canvasId}
          className="s-event-map__canvas"
          style={canvasStyle}
          disableScroll
          onReady={handleCanvasReady}
          onError={(event) => {
            console.error("[event-map] canvas error", event.detail);
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        />

        <View className="s-event-map__zoom">
          <Button
            className="s-event-map__zoom-btn"
            aria-label="放大"
            hoverClass="s-event-map__zoom-btn--pressed"
            onTap={handleZoomIn}>
            <Plus size={20} />
          </Button>
          <Button
            className="s-event-map__zoom-btn"
            aria-label="缩小"
            hoverClass="s-event-map__zoom-btn--pressed"
            onTap={handleZoomOut}>
            <Minus size={20} />
          </Button>
        </View>
      </View>

      <View className="s-event-map__bottom">
        <View className="s-event-map__bottom-row">
          {EVENT_MAP_BOTTOM_ROW.map((person) => (
            <View
              key={person.name}
              className="s-event-map__bottom-person"
              hoverClass="s-event-map__bottom-person--pressed"
              onTap={() => openUserPosts(person)}>
              <View className="s-event-map__bottom-avatar-wrap">
                <View
                  className={[
                    "s-event-map__bottom-avatar",
                    person.ringClass,
                  ].join(" ")}>
                  <Image
                    className="s-event-map__bottom-avatar-img"
                    src={markerAvatarUrl(person.avatarSeed, 104)}
                    mode="aspectFill"
                  />
                </View>
                {person.bottomBadge === "plane" ? (
                  <View className="s-event-map__bottom-badge" aria-hidden>
                    <Plane size={11} color="#fff" />
                  </View>
                ) : null}
              </View>
              <Text className="s-event-map__bottom-name">
                {person.shortName ?? person.name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <EventMapUserPostsSheet
        open={postsSheetMarker !== null}
        marker={postsSheetMarker}
        activityLegacyId={activityLegacyId}
        onClose={closeUserPosts}
      />
    </View>
  );
};

export default EventMapPage;
