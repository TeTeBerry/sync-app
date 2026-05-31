import "./my-itinerary.scss";
import Taro, { useRouter } from "@tarojs/taro";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isApiEnabled } from "../../../constants/api";
import { useActivityDetailQuery } from "../../../hooks/useSyncApi";
import { useItineraryMutations, useItineraryScheduleQuery } from "../../../hooks/useItineraryApi";
import { useItineraryStore } from "../../../stores/itineraryStore";
import { Bookmark, List, Map, RotateCcw, Share2, Sparkles, Star } from "lucide-react-taro";
import { Button, Canvas, ScrollView, Text, View } from "@tarojs/components";
import PageNavigation, { SUB_PAGE_HEADER_META_EXTRA_PX } from "../../../components/PageNavigation";
import { useEndRouteTransitionOnShow } from "../../../hooks/useEndRouteTransitionOnShow";
import { useStackPageMainHeight } from "../../../hooks/useTabPageMainHeight";
import {
  EXCLUSIVE_ITINERARY_DEFAULT_SELECTED_IDS,
  EXCLUSIVE_ITINERARY_DJS,
} from "../exclusive-itinerary/exclusiveItineraryMock";
import { resolveEventDetailIdFromQuery, ROUTES } from "../../../utils/route";
import { useNavigationStore } from "../../../stores/navigationStore";
import type { ItineraryDj } from "../../../types/backend";
import {
  buildItineraryBannerCopy,
  extractPerformanceArtistsFromDays,
  MY_ITINERARY_DAYS,
  MY_ITINERARY_EVENT_META,
  parseSelectedDjIds,
  resolveDjDisplayNames,
  type DjNameEntry,
  type ItineraryDay,
  type ItineraryTimelineDotColor,
  type ItineraryTimelineItem,
} from "./myItineraryMock";
import {
  ITINERARY_WALLPAPER_CANVAS_ID,
  runSaveItineraryWallpaperFlow,
} from "./generateItineraryWallpaper";

/** Footer padding + dual-button row (excludes safe-area; added at runtime). */
const FOOTER_BASE_PX = 74;
const SEGMENT_TOGGLE_PX = 56;

type ViewMode = "timeline" | "map";

function mapApiDjToNameEntry(dj: ItineraryDj): DjNameEntry {
  return { id: dj.id, name: dj.name };
}

function TimelineCard({ item }: { item: ItineraryTimelineItem }) {
  return (
    <View
      className={["s-my-itinerary__card", item.highlighted ? "s-my-itinerary__card--highlight" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <Text className="s-my-itinerary__card-title">{item.title}</Text>
      {item.subtitle ? <Text className="s-my-itinerary__card-sub">{item.subtitle}</Text> : null}
      {item.timeTag || item.pill ? (
        <View className="s-my-itinerary__card-tags">
          {item.timeTag ? (
            <Text
              className={[
                "s-my-itinerary__time-tag",
                item.timeTagColor ? `s-my-itinerary__time-tag--${item.timeTagColor}` : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {item.timeTag}
            </Text>
          ) : null}
          {item.pill ? (
            <View
              className={[
                "s-my-itinerary__pill",
                `s-my-itinerary__pill--${item.pill.variant}`,
              ].join(" ")}
            >
              {item.pill.variant === "pink" ? (
                <Star size={11} color="var(--primary)" aria-hidden />
              ) : null}
              <Text>{item.pill.label}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const MyItineraryPage = () => {
  useEndRouteTransitionOnShow();
  const router = useRouter();
  const activeActivityLegacyId = useNavigationStore((state) => state.activeActivityLegacyId);

  const activityLegacyId = useMemo(
    () => resolveEventDetailIdFromQuery(router.params, activeActivityLegacyId),
    [activeActivityLegacyId, router.params.activityLegacyId, router.params.id],
  );

  const [selectedDjIds, setSelectedDjIds] = useState<string[]>(() =>
    parseSelectedDjIds(router.params.selectedDjIds),
  );

  const apiEnabled = isApiEnabled();
  const consumePending = useItineraryStore((s) => s.consumePending);
  const activityQuery = useActivityDetailQuery(
    apiEnabled && Number.isFinite(activityLegacyId) ? activityLegacyId : undefined,
  );
  const scheduleQuery = useItineraryScheduleQuery(
    apiEnabled && Number.isFinite(activityLegacyId) ? activityLegacyId : null,
    { selectedDjIds },
  );
  const { save } = useItineraryMutations(activityLegacyId ?? 0);

  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>(() => MY_ITINERARY_DAYS);
  const [eventMeta, setEventMeta] = useState(MY_ITINERARY_EVENT_META);

  useEffect(() => {
    const fromQuery = parseSelectedDjIds(router.params.selectedDjIds);
    if (fromQuery.length > 0) {
      setSelectedDjIds(fromQuery);
    }
  }, [router.params.selectedDjIds]);

  useEffect(() => {
    if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) return;
    const pending = consumePending(activityLegacyId);
    if (pending) {
      setItineraryDays(pending.days);
      setEventMeta(pending.eventMeta);
      if (pending.selectedDjIds.length > 0) {
        setSelectedDjIds(pending.selectedDjIds);
      }
      return;
    }
    if (!apiEnabled) {
      setItineraryDays(MY_ITINERARY_DAYS);
      setEventMeta(MY_ITINERARY_EVENT_META);
      setSelectedDjIds((prev) =>
        prev.length > 0 ? prev : [...EXCLUSIVE_ITINERARY_DEFAULT_SELECTED_IDS],
      );
    }
  }, [activityLegacyId, apiEnabled, consumePending]);

  useEffect(() => {
    if (activityQuery.data?.name) {
      setEventMeta(activityQuery.data.name);
    }
  }, [activityQuery.data?.name]);

  const djCatalog = useMemo((): DjNameEntry[] => {
    if (apiEnabled && scheduleQuery.data?.djs?.length) {
      return scheduleQuery.data.djs.map(mapApiDjToNameEntry);
    }
    return EXCLUSIVE_ITINERARY_DJS.map((dj) => ({ id: dj.id, name: dj.name }));
  }, [apiEnabled, scheduleQuery.data?.djs]);

  const itineraryArtistNames = useMemo(
    () => extractPerformanceArtistsFromDays(itineraryDays),
    [itineraryDays],
  );

  const selectedDjNames = useMemo(
    () => resolveDjDisplayNames(selectedDjIds, djCatalog),
    [djCatalog, selectedDjIds],
  );

  const bannerCopy = useMemo(
    () =>
      buildItineraryBannerCopy({
        selectedDjIds,
        selectedDjNames,
        itineraryArtistNames,
        eventMeta,
        dayLabels: itineraryDays.map((day) => day.bannerDateLabel),
      }),
    [eventMeta, itineraryArtistNames, itineraryDays, selectedDjIds, selectedDjNames],
  );

  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [activeDayId, setActiveDayId] = useState(() => itineraryDays[0]?.id ?? "");

  useEffect(() => {
    if (!itineraryDays.some((d) => d.id === activeDayId)) {
      setActiveDayId(itineraryDays[0]?.id ?? "");
    }
  }, [activeDayId, itineraryDays]);

  const activeDay = useMemo(
    () => itineraryDays.find((day) => day.id === activeDayId) ?? itineraryDays[0],
    [activeDayId, itineraryDays],
  );

  const footerChromePx = useMemo(() => {
    try {
      const win = Taro.getWindowInfo();
      const screenHeight = win.screenHeight ?? win.windowHeight ?? 667;
      const safeBottom = win.safeArea != null ? Math.max(0, screenHeight - win.safeArea.bottom) : 0;
      return FOOTER_BASE_PX + safeBottom;
    } catch {
      return FOOTER_BASE_PX;
    }
  }, []);

  const mainScrollHeight = useStackPageMainHeight(
    footerChromePx + SEGMENT_TOGGLE_PX + SUB_PAGE_HEADER_META_EXTRA_PX,
  );

  const handleShare = useCallback(() => {
    void Taro.showToast({ title: "分享功能即将上线", icon: "none" });
  }, []);

  const handleReselect = useCallback(() => {
    void Taro.navigateBack();
  }, []);

  const handleSave = useCallback(async () => {
    if (apiEnabled && Number.isFinite(activityLegacyId) && activityLegacyId > 0) {
      try {
        await save({
          eventMeta,
          days: itineraryDays,
          selectedDjIds: selectedDjIds,
        });
      } catch {
        void Taro.showToast({ title: "保存失败，请重试", icon: "none" });
        return;
      }
    }

    void runSaveItineraryWallpaperFlow({
      eventMeta,
      days: itineraryDays.map((day) => ({
        dateKey: day.id,
        dateLabel: day.bannerDateLabel,
        items: day.items,
      })),
    });
  }, [activityLegacyId, apiEnabled, eventMeta, itineraryDays, save, selectedDjIds]);

  const fallback =
    Number.isFinite(activityLegacyId) && activityLegacyId > 0
      ? ROUTES.EXCLUSIVE_ITINERARY
      : ROUTES.EVENTS;

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
        fallback={fallback}
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

      <View className="s-my-itinerary__segment">
        <Button
          className={[
            "s-my-itinerary__segment-btn",
            viewMode === "timeline" ? "s-my-itinerary__segment-btn--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          hoverClass="s-my-itinerary__segment-btn--pressed"
          onTap={() => setViewMode("timeline")}
        >
          <List size={16} color={viewMode === "timeline" ? "#fff" : "#8e8e93"} />
          <Text>时间轴</Text>
        </Button>
        <Button
          className={[
            "s-my-itinerary__segment-btn",
            viewMode === "map" ? "s-my-itinerary__segment-btn--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          hoverClass="s-my-itinerary__segment-btn--pressed"
          onTap={() => setViewMode("map")}
        >
          <Map size={16} color={viewMode === "map" ? "#fff" : "#8e8e93"} />
          <Text>地图</Text>
        </Button>
      </View>

      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        className="s-my-itinerary__scroll s-scrollbar-none"
        style={mainScrollHeight != null ? { height: `${mainScrollHeight}px` } : undefined}
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

          {viewMode === "timeline" ? (
            <>
              <View className="s-my-itinerary__date-tabs">
                {itineraryDays.map((day) => {
                  const active = day.id === activeDayId;
                  return (
                    <Button
                      key={day.id}
                      className={[
                        "s-my-itinerary__date-tab",
                        active ? "s-my-itinerary__date-tab--active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      hoverClass="s-my-itinerary__date-tab--pressed"
                      onTap={() => setActiveDayId(day.id)}
                    >
                      {day.label}
                    </Button>
                  );
                })}
              </View>

              <View className="s-my-itinerary__timeline">
                <View className="s-my-itinerary__timeline-rail" aria-hidden />
                {activeDay?.items.map((item) => (
                  <View key={item.id} className="s-my-itinerary__timeline-item">
                    <Text
                      className={[
                        "s-my-itinerary__timeline-time",
                        `s-my-itinerary__timeline-time--${item.dotColor}`,
                      ].join(" ")}
                    >
                      {item.time}
                    </Text>
                    <View
                      className={[
                        "s-my-itinerary__timeline-dot",
                        `s-my-itinerary__timeline-dot--${item.dotColor as ItineraryTimelineDotColor}`,
                      ].join(" ")}
                      aria-hidden
                    />
                    <TimelineCard item={item} />
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View className="s-my-itinerary__map-placeholder">
              <Map size={36} color="#8e8e93" aria-hidden />
              <Text className="s-my-itinerary__map-placeholder-text">地图视图即将上线</Text>
              <Text className="s-my-itinerary__map-placeholder-sub">
                场馆地图与演出点位导航功能开发中
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="s-my-itinerary__footer">
        <Button
          className="s-my-itinerary__footer-btn s-my-itinerary__footer-btn--secondary"
          hoverClass="s-my-itinerary__footer-btn--pressed"
          onTap={handleReselect}
        >
          <RotateCcw size={16} color="#fff" aria-hidden />
          <Text>重新选择</Text>
        </Button>
        <Button
          className="s-my-itinerary__footer-btn s-my-itinerary__footer-btn--primary"
          hoverClass="s-my-itinerary__footer-btn--pressed"
          onTap={handleSave}
        >
          <Bookmark size={16} color="#fff" aria-hidden />
          <Text>保存行程</Text>
        </Button>
      </View>
    </View>
  );
};

export default MyItineraryPage;
