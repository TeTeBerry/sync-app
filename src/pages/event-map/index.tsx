import "./event-map.scss";
import Taro, { useRouter } from "@tarojs/taro";
import { useMemo } from "react";
import { Bell, ChevronLeft, Plane } from "lucide-react-taro";
import { Button, Image, Text, View } from "@tarojs/components";
import { EventMapCanvas } from "../../components/event-map/EventMapCanvas";
import { useEventMapPaint } from "../../components/event-map/useEventMapPaint";
import {
  EVENT_MAP_BOTTOM_ROW,
  EVENT_MAP_DEFAULT_TITLE,
  markerAvatarUrl,
} from "../../components/event-map/eventMapMarkers";
import { useNavBarInsets } from "../../hooks/useNavBarInsets";
import { decodeRouteQueryParam, goBack, ROUTES } from "../../utils/route";

function showMapToast(label: string) {
  void Taro.showToast({ title: label, icon: "none", duration: 1200 });
}

const EventMapPage = () => {
  const router = useRouter();
  const navInsets = useNavBarInsets();

  const eventTitle = useMemo(() => {
    const fromRoute = decodeRouteQueryParam(router.params.title);
    return fromRoute || EVENT_MAP_DEFAULT_TITLE;
  }, [router.params.title]);

  const headerStyle =
    navInsets.paddingTop > 0 || navInsets.paddingRight > 16
      ? {
          ...(navInsets.paddingTop > 0
            ? { paddingTop: `${navInsets.paddingTop}px` }
            : {}),
          ...(navInsets.paddingRight > 16
            ? { paddingRight: `${navInsets.paddingRight}px` }
            : {}),
        }
      : undefined;

  const sideActionsTop = navInsets.paddingTop + 56;

  useEventMapPaint(eventTitle);

  return (
    <View className="s-event-map">
      <EventMapCanvas
        className="s-event-map__canvas"
        eventTitle={eventTitle}
        onMarkerTap={(marker) => showMapToast(marker.name)}
      />

      <View className="s-event-map__chrome">
        <View className="s-event-map__header" style={headerStyle}>
          <Button
            className="s-event-map__back"
            aria-label="返回"
            onClick={() => goBack(ROUTES.EVENT_DETAIL)}>
            <ChevronLeft size={22} />
          </Button>
        </View>

        <View
          className="s-event-map__side-actions"
          style={{ top: `${sideActionsTop}px` }}>
          <Button
            className="s-event-map__side-btn"
            aria-label="通知"
            onClick={() => showMapToast("通知即将上线")}>
            <Bell size={18} />
          </Button>
        </View>

        <View className="s-event-map__bottom">
          <View className="s-event-map__bottom-row">
            {EVENT_MAP_BOTTOM_ROW.map((person) => (
              <View key={person.name} className="s-event-map__bottom-person">
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
      </View>
    </View>
  );
};

export default EventMapPage;
