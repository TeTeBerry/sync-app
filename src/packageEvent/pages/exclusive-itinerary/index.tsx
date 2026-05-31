import "./exclusive-itinerary.scss";
import Taro, { useRouter } from "@tarojs/taro";
import { useCallback, useMemo, useState } from "react";
import { isApiEnabled } from "../../../constants/api";
import { useItineraryMutations, useItineraryScheduleQuery } from "../../../hooks/useItineraryApi";
import { useItineraryStore } from "../../../stores/itineraryStore";
import { Check, ChevronDown, Info, Sparkles } from "lucide-react-taro";
import { Button, Image, ScrollView, Text, View } from "@tarojs/components";
import ActionSheet from "../../../components/ActionSheet";
import PageNavigation from "../../../components/PageNavigation";
import { ExclusiveItineraryInfoModal } from "./ExclusiveItineraryInfoModal";
import { useEndRouteTransitionOnShow } from "../../../hooks/useEndRouteTransitionOnShow";
import { useStackPageMainHeight } from "../../../hooks/useTabPageMainHeight";
import { goMyItinerary, resolveEventDetailIdFromQuery, ROUTES } from "../../../utils/route";
import { picsumUrl } from "../../../utils/imageUrl";
import { useNavigationStore } from "../../../stores/navigationStore";
import {
  EXCLUSIVE_ITINERARY_DEFAULT_SELECTED_IDS,
  EXCLUSIVE_ITINERARY_DJS,
  EXCLUSIVE_ITINERARY_GENRES,
  EXCLUSIVE_ITINERARY_MAX_SELECTION,
  EXCLUSIVE_ITINERARY_MOCK_CONFLICT_SLOTS,
  EXCLUSIVE_ITINERARY_STAGES,
  type ExclusiveItineraryDj,
} from "./exclusiveItineraryMock";
import { ExclusiveItineraryConflictBanner } from "./ExclusiveItineraryConflictBanner";
import { detectItineraryConflicts } from "./itineraryConflict.util";
import type { ItineraryConflict, ItineraryDj } from "../../../types/backend";

/** Footer padding + CTA row (excludes safe-area; added at runtime). */
const CTA_FOOTER_BASE_PX = 74;
const SORT_OPTIONS = ["按人气排序", "按名字排序"] as const;
type SortMode = (typeof SORT_OPTIONS)[number];

function djMatchesGenre(dj: ExclusiveItineraryDj, genreId: string): boolean {
  if (genreId === "all") {
    return true;
  }
  if (dj.genre === genreId) {
    return true;
  }
  return dj.genreLabel.toLowerCase().includes(genreId.toLowerCase());
}

function djMatchesStage(dj: ExclusiveItineraryDj, stageId: string): boolean {
  if (stageId === "all") {
    return true;
  }
  return dj.stage === stageId;
}

function mapApiDj(dj: ItineraryDj): ExclusiveItineraryDj {
  const stage = dj.stage as ExclusiveItineraryDj["stage"];
  return {
    id: dj.id,
    name: dj.name,
    genre: dj.genre,
    genreLabel: dj.genreLabel,
    stage:
      stage === "main" || stage === "bass" || stage === "late" || stage === "outdoor"
        ? stage
        : "main",
    popularity: dj.popularity,
    avatarSeed: dj.avatarSeed,
    genreColor: dj.genreColor,
  };
}

const ExclusiveItineraryPage = () => {
  useEndRouteTransitionOnShow();
  const router = useRouter();
  const activeActivityLegacyId = useNavigationStore((state) => state.activeActivityLegacyId);

  const activityLegacyId = useMemo(
    () => resolveEventDetailIdFromQuery(router.params, activeActivityLegacyId),
    [activeActivityLegacyId, router.params.activityLegacyId, router.params.id],
  );

  const [stageFilter, setStageFilter] = useState<string>("all");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [sortMode, setSortMode] = useState<SortMode>("按人气排序");
  const [selectedIds, setSelectedIds] = useState<string[]>(() => [
    ...EXCLUSIVE_ITINERARY_DEFAULT_SELECTED_IDS,
  ]);
  const [infoOpen, setInfoOpen] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [hintModal, setHintModal] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [conflictDismissed, setConflictDismissed] = useState(false);
  const [generating, setGenerating] = useState(false);

  const apiEnabled = isApiEnabled();
  const scheduleQuery = useItineraryScheduleQuery(apiEnabled ? activityLegacyId : null, {
    selectedDjIds: selectedIds,
  });
  const { generate } = useItineraryMutations(activityLegacyId ?? 0);
  const setFromGenerateResult = useItineraryStore((s) => s.setFromGenerateResult);

  const djCatalog = useMemo(() => {
    if (apiEnabled && scheduleQuery.data?.djs?.length) {
      return scheduleQuery.data.djs.map(mapApiDj);
    }
    return EXCLUSIVE_ITINERARY_DJS;
  }, [apiEnabled, scheduleQuery.data?.djs]);

  const conflicts: ItineraryConflict[] = useMemo(() => {
    if (apiEnabled && scheduleQuery.data?.conflicts) {
      return scheduleQuery.data.conflicts;
    }
    return detectItineraryConflicts(EXCLUSIVE_ITINERARY_MOCK_CONFLICT_SLOTS, selectedIds);
  }, [apiEnabled, scheduleQuery.data?.conflicts, selectedIds]);

  const footerChromePx = useMemo(() => {
    try {
      const win = Taro.getWindowInfo();
      const screenHeight = win.screenHeight ?? win.windowHeight ?? 667;
      const safeBottom = win.safeArea != null ? Math.max(0, screenHeight - win.safeArea.bottom) : 0;
      return CTA_FOOTER_BASE_PX + safeBottom;
    } catch {
      return CTA_FOOTER_BASE_PX;
    }
  }, []);

  const mainScrollHeight = useStackPageMainHeight(footerChromePx);

  const filteredDjs = useMemo(() => {
    const list = djCatalog.filter(
      (dj) => djMatchesStage(dj, stageFilter) && djMatchesGenre(dj, genreFilter),
    );
    const sorted = [...list];
    if (sortMode === "按名字排序") {
      sorted.sort((a, b) => a.name.localeCompare(b.name, "zh"));
    } else {
      sorted.sort((a, b) => b.popularity - a.popularity);
    }
    return sorted;
  }, [djCatalog, genreFilter, sortMode, stageFilter]);

  const toggleDj = useCallback((id: string) => {
    setConflictDismissed(false);
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= EXCLUSIVE_ITINERARY_MAX_SELECTION) {
        setHintModal({
          title: "已达选择上限",
          message: `最多选择 ${EXCLUSIVE_ITINERARY_MAX_SELECTION} 位 DJ，请先取消一位再添加。`,
        });
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const openSortSheet = useCallback(() => {
    setSortSheetOpen(true);
  }, []);

  const closeSortSheet = useCallback(() => {
    setSortSheetOpen(false);
  }, []);

  const openInfo = useCallback(() => {
    setInfoOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setInfoOpen(false);
    setHintModal(null);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (selectedIds.length === 0) {
      setHintModal({
        title: "请先选择 DJ",
        message: "勾选至少一位 DJ 后，即可生成你的专属观演行程。",
      });
      return;
    }
    if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
      goMyItinerary(activityLegacyId, selectedIds);
      return;
    }

    if (!apiEnabled) {
      goMyItinerary(activityLegacyId, selectedIds);
      return;
    }

    setGenerating(true);
    try {
      const result = await generate({ selectedDjIds: selectedIds });
      setFromGenerateResult(activityLegacyId, selectedIds, result);
      goMyItinerary(activityLegacyId, selectedIds);
    } catch (error) {
      const message = error instanceof Error ? error.message : "行程生成失败，请稍后重试";
      void Taro.showToast({ title: message, icon: "none" });
    } finally {
      setGenerating(false);
    }
  }, [activityLegacyId, apiEnabled, generate, selectedIds, setFromGenerateResult]);

  const sortSheetItems = useMemo(
    () =>
      SORT_OPTIONS.map((option) => ({
        label: option,
        active: sortMode === option,
        onSelect: () => {
          setSortMode(option);
          setSortSheetOpen(false);
        },
      })),
    [sortMode],
  );

  const fallback =
    Number.isFinite(activityLegacyId) && activityLegacyId > 0 ? ROUTES.EVENT_DETAIL : ROUTES.EVENTS;

  return (
    <View data-cmp="ExclusiveItineraryPage" className="s-exclusive-itinerary">
      <PageNavigation
        title="专属电音行程"
        fallback={fallback}
        trailing={
          <Button
            className="s-page-nav__icon-action"
            aria-label="说明"
            hoverClass="s-page-nav__icon-action--pressed"
            onTap={openInfo}
          >
            <Info size={18} />
          </Button>
        }
      />

      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        className="s-exclusive-itinerary__scroll s-scrollbar-none"
        style={mainScrollHeight != null ? { height: `${mainScrollHeight}px` } : undefined}
      >
        <View className="s-exclusive-itinerary__inner">
          {!conflictDismissed && conflicts.length > 0 ? (
            <ExclusiveItineraryConflictBanner
              conflicts={conflicts}
              onDismiss={() => setConflictDismissed(true)}
            />
          ) : null}

          <View className="s-exclusive-itinerary__step">
            <Text className="s-exclusive-itinerary__step-title">第一步：选择你喜爱的 DJ</Text>
            <Text className="s-exclusive-itinerary__step-badge">
              已选 {selectedIds.length}/{EXCLUSIVE_ITINERARY_MAX_SELECTION}
            </Text>
          </View>

          <View className="s-exclusive-itinerary__filter-block">
            <Text className="s-exclusive-itinerary__filter-label">舞台筛选</Text>
            <ScrollView
              scrollX
              enhanced
              showScrollbar={false}
              className="s-exclusive-itinerary__chip-scroll s-scrollbar-none"
            >
              <View className="s-exclusive-itinerary__chip-row">
                {EXCLUSIVE_ITINERARY_STAGES.map((stage) => {
                  const active = stageFilter === stage.id;
                  return (
                    <Button
                      key={stage.id}
                      className={[
                        "s-exclusive-itinerary__chip",
                        active ? "s-exclusive-itinerary__chip--stage-on" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      hoverClass="s-exclusive-itinerary__chip--pressed"
                      onTap={() => setStageFilter(stage.id)}
                    >
                      {stage.label}
                    </Button>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <View className="s-exclusive-itinerary__filter-block">
            <Text className="s-exclusive-itinerary__filter-label">音乐风格</Text>
            <ScrollView
              scrollX
              enhanced
              showScrollbar={false}
              className="s-exclusive-itinerary__chip-scroll s-scrollbar-none"
            >
              <View className="s-exclusive-itinerary__chip-row">
                {EXCLUSIVE_ITINERARY_GENRES.map((genre) => {
                  const active = genreFilter === genre.id;
                  return (
                    <Button
                      key={genre.id}
                      className={[
                        "s-exclusive-itinerary__chip",
                        active ? "s-exclusive-itinerary__chip--genre-on" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      hoverClass="s-exclusive-itinerary__chip--pressed"
                      onTap={() => setGenreFilter(genre.id)}
                    >
                      {genre.label}
                    </Button>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <View className="s-exclusive-itinerary__list-head">
            <Text className="s-exclusive-itinerary__list-count">共 {filteredDjs.length} 位 DJ</Text>
            <Button
              className="s-exclusive-itinerary__sort-btn"
              hoverClass="s-exclusive-itinerary__sort-btn--pressed"
              onTap={openSortSheet}
            >
              <Text>{sortMode}</Text>
              <ChevronDown size={14} color="var(--primary)" />
            </Button>
          </View>

          <View className="s-exclusive-itinerary__grid">
            {filteredDjs.map((dj) => {
              const selectionIndex = selectedIds.indexOf(dj.id);
              const isSelected = selectionIndex >= 0;
              const accent = isSelected && selectionIndex % 2 === 1 ? "purple" : "pink";
              const showPurple = isSelected && accent === "purple";
              const showPink = isSelected && accent === "pink";

              return (
                <Button
                  key={dj.id}
                  className={[
                    "s-exclusive-itinerary__card",
                    showPink ? "s-exclusive-itinerary__card--pink" : "",
                    showPurple ? "s-exclusive-itinerary__card--purple" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  hoverClass="s-exclusive-itinerary__card--pressed"
                  aria-label={`${dj.name}，${dj.genreLabel}`}
                  onTap={() => toggleDj(dj.id)}
                >
                  <View className="s-exclusive-itinerary__avatar-wrap">
                    <Image
                      className="s-exclusive-itinerary__avatar"
                      src={picsumUrl(dj.avatarSeed, 144, 144)}
                      mode="aspectFill"
                    />
                    {isSelected ? (
                      <View
                        className={[
                          "s-exclusive-itinerary__check",
                          showPurple
                            ? "s-exclusive-itinerary__check--purple"
                            : "s-exclusive-itinerary__check--pink",
                        ].join(" ")}
                        aria-hidden
                      >
                        <Check size={13} color="#fff" strokeWidth={3} />
                      </View>
                    ) : null}
                  </View>
                  <Text className="s-exclusive-itinerary__name">{dj.name}</Text>
                  <Text
                    className="s-exclusive-itinerary__genre"
                    style={{
                      color: isSelected
                        ? showPurple
                          ? "#7b61ff"
                          : "var(--primary)"
                        : dj.genreColor,
                    }}
                  >
                    {dj.genreLabel}
                  </Text>
                </Button>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View className="s-exclusive-itinerary__footer">
        <Button
          className={[
            "s-exclusive-itinerary__cta",
            selectedIds.length === 0 || generating ? "s-exclusive-itinerary__cta--disabled" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          hoverClass="s-exclusive-itinerary__cta--pressed"
          onTap={handleGenerate}
        >
          <Sparkles size={18} color="#fff" aria-hidden />
          <Text className="s-exclusive-itinerary__cta-label">
            {generating ? "AI 生成中…" : "AI 生成我的专属行程"}
          </Text>
        </Button>
      </View>

      <ExclusiveItineraryInfoModal
        open={infoOpen || hintModal != null}
        onClose={closeModal}
        title={hintModal?.title}
        message={hintModal?.message}
        showIcon={hintModal == null}
      />

      <ActionSheet
        open={sortSheetOpen}
        title="排序方式"
        items={sortSheetItems}
        cancelLabel="取消"
        onCancel={closeSortSheet}
      />
    </View>
  );
};

export default ExclusiveItineraryPage;
