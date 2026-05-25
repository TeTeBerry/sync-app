import "./pindan.scss";
import Taro, { useDidShow } from "@tarojs/taro";
import React, { useCallback, useMemo, useState } from "react";
import {
  BuildingIcon,
  CalendarIcon,
  CarIcon,
  CheckCircleIcon,
  MapPinIcon,
  PackageIcon,
  PlaneIcon,
  PlusIcon,
  StarIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import BottomNav from "../../components/BottomNav";
import ConfirmDialog from "../../components/ConfirmDialog";
import CreatePinDanModal, { type PinDanCreateCategory, type PinDanSavedResult } from "../../components/CreatePinDanModal";
import JoinSuccessToast from "../../components/JoinSuccessToast";
import PageNavigation from "../../components/PageNavigation";
import { Button } from "../../components/ui";
import { deletePindan, joinPindan } from "../../api/syncApi";
import { getActivityById } from "../../data/activities";
import { invalidatePindanQueries, usePindanPageItems } from "../../hooks/useSyncApi";
import { isApiEnabled } from "../../constants/api";
import { findBackendActivityByLegacyId } from "../../utils/apiMappers";
import type { PindanJoinCard } from "../../types/aiChat";
import type { ProfilePinDanItem } from "../profile/mockData";
import { formatJoinedAt, saveJoinedPindanItem } from "../../utils/myPindanStorage";
import { goProfilePindan } from "../../utils/route";
import { sharePinDanItem } from "../../utils/share";
import { getClientUserId } from "../../utils/session";
import { getPindanJoinUiState, isPindanJoinDisabled } from "../../utils/pindanJoinState";
import { isBudgetModePindan, resolvePindanBudgetRangeLabel } from "../../utils/pindanBudget";
import {
  useNavigationStore,
  usePindanPageStore,
  usePindanSessionStore,
  useScrollHighlight,
} from "../../stores";

type TabType = `package` | `hotel` | `transport`;

interface PackageInclude {
  kind: `hotel` | `transport`;
  title: string;
  detail: string;
}

interface PinDanItem {
  id: number;
  activityId: number;
  type: TabType;
  title: string;
  subtitle: string;
  image: string;
  price: number;
  originalPrice: number;
  budgetMin?: number;
  budgetMax?: number;
  budgetRangeLabel?: string;
  date: string;
  location: string;
  joined: number;
  total: number;
  tags: string[];
  rating: number;
  leaderUserId?: string;
  remark?: string;
  includes?: PackageInclude[];
}

function isPindanOwner(item: PinDanItem, userId: string): boolean {
  return Boolean(item.leaderUserId && item.leaderUserId === userId);
}

function toEditPindanCard(item: PinDanItem): PindanJoinCard {
  return {
    legacyId: item.id,
    activityLegacyId: item.activityId,
    category: item.type,
    title: item.title,
    subtitle: item.subtitle,
    remark: item.remark,
    date: item.date,
    location: item.location,
    price: item.price,
    pricePerPerson: item.price,
    budgetMin: item.budgetMin,
    budgetMax: item.budgetMax,
    budgetRangeLabel: item.budgetRangeLabel,
    total: item.total,
    isOwner: true,
  };
}

const mockData: PinDanItem[] = [
  {
    id: 1,
    activityId: 3,
    type: `package`,
    title: `三亚电音节·全程套餐`,
    subtitle: `S2O Festival · 酒店+机票联合拼`,
    image: `https://images.unsplash.com/photo-1540039155732-d674d4e3f421?w=400&q=80`,
    price: 1580,
    originalPrice: 3800,
    date: `06/27-30`,
    location: `三亚海棠湾`,
    joined: 3,
    total: 4,
    tags: [`酒店+机票`, `节省58%`, `4晚住宿`],
    rating: 4.9,
    includes: [
      { kind: `hotel`, title: `亚特兰蒂斯海景房`, detail: `3晚·含早餐` },
      { kind: `transport`, title: `上海→三亚 商务舱`, detail: `06/27 PVG→SYX` },
    ],
  },
  {
    id: 2,
    activityId: 2,
    type: `package`,
    title: `EDC China·出行套餐`,
    subtitle: `EDC China 2025 · 酒店+专车联合拼`,
    image: `https://images.unsplash.com/photo-1470229722913-7c090be5c520?w=400&q=80`,
    price: 980,
    originalPrice: 2280,
    date: `07/11-14`,
    location: `苏州阳澄湖`,
    joined: 2,
    total: 4,
    tags: [`酒店+专车`, `节省57%`, `3晚住宿`],
    rating: 4.8,
    includes: [
      { kind: `hotel`, title: `太湖精品湖景房`, detail: `3晚·含双早` },
      { kind: `transport`, title: `上海→苏州 商务MPV`, detail: `07/11 虹桥→阳澄湖` },
    ],
  },
  {
    id: 3,
    activityId: 1,
    type: `package`,
    title: `Tomorrowland·周末套餐`,
    subtitle: `预热派对 · 酒店+机票联合拼`,
    image: `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80`,
    price: 1280,
    originalPrice: 2900,
    date: `06/19-21`,
    location: `上海静安区`,
    joined: 5,
    total: 6,
    tags: [`酒店+机票`, `节省56%`, `2晚住宿`],
    rating: 4.7,
    includes: [
      { kind: `hotel`, title: `外滩景观大床房`, detail: `2晚·含早餐` },
      { kind: `transport`, title: `北京→上海 经济舱`, detail: `06/19 PEK→PVG` },
    ],
  },
  {
    id: 4,
    activityId: 3,
    type: `hotel`,
    title: `三亚亚特兰蒂斯`,
    subtitle: `海景大床房 · 4人均摊节省70%`,
    image: `https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&q=80`,
    price: 450,
    originalPrice: 1800,
    date: `06/27-30`,
    location: `三亚海棠湾`,
    joined: 2,
    total: 4,
    tags: [`海景房`, `含早餐`, `水世界`],
    rating: 4.9,
  },
  {
    id: 5,
    activityId: 2,
    type: `hotel`,
    title: `苏州太湖精品民宿`,
    subtitle: `湖景套房 · 2人拼享8折`,
    image: `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80`,
    price: 320,
    originalPrice: 640,
    date: `07/11-14`,
    location: `苏州阳澄湖畔`,
    joined: 1,
    total: 2,
    tags: [`湖景套房`, `下午茶`, `私人泳池`],
    rating: 4.8,
  },
  {
    id: 6,
    activityId: 1,
    type: `hotel`,
    title: `上海外滩威斯汀`,
    subtitle: `外滩景观房 · 拼单立省60%`,
    image: `https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80`,
    price: 580,
    originalPrice: 1450,
    date: `06/19-21`,
    location: `上海黄浦区`,
    joined: 3,
    total: 4,
    tags: [`外滩景观`, `含双早`, `行政酒廊`],
    rating: 4.9,
  },
  {
    id: 7,
    activityId: 3,
    type: `transport`,
    title: `上海→三亚 商务舱拼`,
    subtitle: `浦东机场出发 · 4座商务同行`,
    image: `https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80`,
    price: 1200,
    originalPrice: 4800,
    date: `06/27`,
    location: `PVG → SYX`,
    joined: 2,
    total: 4,
    tags: [`商务舱`, `行李直挂`, `贵宾候机`],
    rating: 4.8,
  },
  {
    id: 8,
    activityId: 2,
    type: `transport`,
    title: `苏州活动专车`,
    subtitle: `上海出发 · 7座商务MPV拼`,
    image: `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80`,
    price: 80,
    originalPrice: 560,
    date: `07/12`,
    location: `上海虹桥 → 苏州阳澄湖`,
    joined: 4,
    total: 7,
    tags: [`7座MPV`, `司机接送`, `准时准点`],
    rating: 4.9,
  },
  {
    id: 9,
    activityId: 3,
    type: `transport`,
    title: `三亚机场接驳拼`,
    subtitle: `凤凰国际机场 → 海棠湾景区`,
    image: `https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80`,
    price: 40,
    originalPrice: 160,
    date: `06/27`,
    location: `三亚凤凰机场`,
    joined: 3,
    total: 4,
    tags: [`含行李`, `准时接机`, `空调车`],
    rating: 4.7,
  },
  {
    id: 10,
    activityId: 4,
    type: `package`,
    title: `Ultra Shanghai·全程套餐`,
    subtitle: `Ultra Shanghai · 酒店+机票联合拼`,
    image: `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80`,
    price: 1680,
    originalPrice: 3600,
    date: `08/01-03`,
    location: `上海世博公园`,
    joined: 4,
    total: 6,
    tags: [`酒店+机票`, `节省53%`, `3晚住宿`],
    rating: 4.8,
    includes: [
      { kind: `hotel`, title: `浦东滨江景观房`, detail: `3晚·含早餐` },
      { kind: `transport`, title: `广州→上海 商务舱`, detail: `08/01 CAN→PVG` },
    ],
  },
  {
    id: 11,
    activityId: 4,
    type: `hotel`,
    title: `世博公园周边精品酒店`,
    subtitle: `Ultra 专属 · 3晚连住拼房`,
    image: `https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80`,
    price: 480,
    originalPrice: 1200,
    date: `08/01-03`,
    location: `上海浦东新区`,
    joined: 2,
    total: 4,
    tags: [`近场馆`, `含早餐`, `延迟退房`],
    rating: 4.8,
  },
  {
    id: 12,
    activityId: 4,
    type: `transport`,
    title: `各地→上海 活动专线`,
    subtitle: `Ultra 期间 · 机场/高铁接驳拼`,
    image: `https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80`,
    price: 120,
    originalPrice: 360,
    date: `08/01-03`,
    location: `上海各站点 → 世博公园`,
    joined: 3,
    total: 5,
    tags: [`定点接驳`, `含行李`, `准时发车`],
    rating: 4.7,
  },
  {
    id: 13,
    activityId: 1,
    type: `transport`,
    title: `派对专车接送`,
    subtitle: `CLUB SPACE 往返 · 4座同行`,
    image: `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80`,
    price: 60,
    originalPrice: 240,
    date: `06/20`,
    location: `上海市区 ↔ 静安区`,
    joined: 2,
    total: 4,
    tags: [`夜间接送`, `准时准点`, `空调车`],
    rating: 4.6,
  },
];

const tabs: { key: TabType; labelKey: string; Icon: React.ElementType }[] = [
  { key: `package`, labelKey: `pindan.tabs.package`, Icon: PackageIcon },
  { key: `hotel`, labelKey: `pindan.tabs.hotel`, Icon: BuildingIcon },
  { key: `transport`, labelKey: `pindan.tabs.transport`, Icon: CarIcon },
];

const includeIcons = {
  hotel: BuildingIcon,
  transport: PlaneIcon,
};

const tabTypes: TabType[] = [`package`, `hotel`, `transport`];

function parseRouteParams() {
  const params = Taro.getCurrentInstance().router?.params;
  const activityId = Number(params?.activityId);
  const highlightId = Number(params?.highlightId);
  const typeParam = params?.type as TabType | undefined;

  return {
    activityId: activityId && !Number.isNaN(activityId) ? activityId : null,
    highlightId: highlightId && !Number.isNaN(highlightId) ? highlightId : null,
    type: typeParam && tabTypes.includes(typeParam) ? typeParam : null,
  };
}

const PinDan: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const clientUserId = useMemo(() => getClientUserId(), []);
  const [editPindanCard, setEditPindanCard] = useState<PindanJoinCard | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PinDanItem | null>(null);
  const { items: apiItems, activities: apiActivities, usingMock, refetch: refetchPindan } =
    usePindanPageItems();
  const activeTab = usePindanPageStore((state) => state.activeTab);
  const routeActivityId = usePindanPageStore((state) => state.routeActivityId);
  const highlightItemId = usePindanPageStore((state) => state.highlightItemId);
  const showCreateModal = usePindanPageStore((state) => state.showCreateModal);
  const joinToast = usePindanPageStore((state) => state.joinToast);
  const setActiveTab = usePindanPageStore((state) => state.setActiveTab);
  const applyRoute = usePindanPageStore((state) => state.applyRoute);
  const clearHighlight = usePindanPageStore((state) => state.clearHighlight);
  const openCreateModal = usePindanPageStore((state) => state.openCreateModal);
  const closeCreateModal = usePindanPageStore((state) => state.closeCreateModal);
  const showJoinSuccess = usePindanPageStore((state) => state.showJoinSuccess);
  const dismissJoinToast = usePindanPageStore((state) => state.dismissJoinToast);
  const resetJoinToastProfileId = usePindanPageStore((state) => state.resetJoinToastProfileId);
  const joinedIds = usePindanSessionStore((state) => state.joinedIds);
  const addJoinedId = usePindanSessionStore((state) => state.addJoinedId);
  const consumePindanIntent = useNavigationStore((state) => state.consumePindanIntent);

  const applyRouteParams = useCallback(() => {
    const urlParams = parseRouteParams();
    const navIntent = consumePindanIntent();
    const activityId = navIntent?.activityId ?? urlParams.activityId;
    const highlightId = navIntent?.highlightId ?? urlParams.highlightId;
    const type = navIntent?.type ?? urlParams.type;

    let resolvedType = type;
    if (!resolvedType && highlightId) {
      const matched = (usingMock ? mockData : apiItems).find(
        (item) => item.id === highlightId,
      );
      if (matched) {
        resolvedType = matched.type;
      } else if (activityId) {
        resolvedType = `package`;
      }
    } else if (!resolvedType && activityId) {
      resolvedType = `package`;
    }

    applyRoute({
      activityId,
      highlightId,
      type: resolvedType,
    });
  }, [apiItems, applyRoute, consumePindanIntent, usingMock]);

  useDidShow(applyRouteParams);

  const sourceItems = usingMock ? mockData : apiItems;

  const filtered = useMemo(
    () =>
      sourceItems.filter((item) => {
        if (item.type !== activeTab) return false;
        if (routeActivityId == null) return true;
        if (highlightItemId != null && item.id === highlightItemId) return true;
        return item.activityId === routeActivityId;
      }),
    [activeTab, highlightItemId, routeActivityId, sourceItems],
  );

  const highlightReady =
    highlightItemId != null &&
    filtered.some((item) => item.id === highlightItemId);

  useScrollHighlight({
    highlightId: highlightItemId,
    elementId: (id) => `pindan-item-${id}`,
    ready: highlightReady,
    onClear: clearHighlight,
  });

  const progressPercent = (joined: number, total: number) => Math.round((joined / total) * 100);

  const handleShare = useCallback(
    (item: PinDanItem, e: React.MouseEvent) => {
      e.stopPropagation();
      void sharePinDanItem(
        {
          title: item.title,
          price: item.price,
          activityId: item.activityId,
          itemId: item.id,
        },
        t(`common.shareCopied`),
      );
    },
    [t],
  );

  const handleJoin = useCallback(
    async (item: PinDanItem) => {
      const joinState = getPindanJoinUiState(item, joinedIds, item.id);
      if (joinState !== `join`) return;

      if (isApiEnabled()) {
        try {
          await joinPindan(item.id, getClientUserId());
          addJoinedId(item.id);
          showJoinSuccess(item.title, item.id);
        } catch {
          void Taro.showToast({ title: t("common.requestFailed"), icon: "none" });
        }
        return;
      }

      const profileItem: ProfilePinDanItem = {
        id: item.id,
        activityId: item.activityId,
        category: item.type,
        title: item.title,
        subtitle: item.subtitle,
        date: item.date,
        location: item.location,
        price: item.price,
        image: item.image,
        joinedAt: formatJoinedAt(),
      };

      saveJoinedPindanItem(profileItem);
      addJoinedId(item.id);
      showJoinSuccess(item.title, item.id);
    },
    [addJoinedId, showJoinSuccess, t],
  );

  const handleViewJoinedPindan = useCallback(() => {
    const profileId = joinToast.profileId;
    resetJoinToastProfileId();
    if (profileId != null) goProfilePindan(profileId);
  }, [joinToast.profileId, resetJoinToastProfileId]);

  const handleEditPindan = useCallback((item: PinDanItem) => {
    setEditPindanCard(toEditPindanCard(item));
  }, []);

  const handleDeletePindan = useCallback((item: PinDanItem) => {
    setPendingDelete(item);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setPendingDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!pendingDelete) return;

    const item = pendingDelete;
    setPendingDelete(null);

    if (!isApiEnabled()) {
      void Taro.showToast({ title: t("pindan.deleted"), icon: "success" });
      return;
    }

    try {
      await deletePindan(item.id, clientUserId);
      await invalidatePindanQueries(queryClient);
      void refetchPindan();
      void Taro.showToast({ title: t("pindan.deleted"), icon: "success" });
    } catch {
      void Taro.showToast({ title: t("common.requestFailed"), icon: "none" });
    }
  }, [clientUserId, pendingDelete, queryClient, refetchPindan, t]);

  const handlePindanSaved = useCallback(
    (result?: PinDanSavedResult) => {
      setEditPindanCard(null);
      closeCreateModal();
      void invalidatePindanQueries(queryClient);
      void refetchPindan();

      if (result && !result.isEdit) {
        applyRoute({
          activityId: result.activityLegacyId ?? routeActivityId,
          highlightId: result.legacyId,
          type: result.category,
        });
      }
    },
    [applyRoute, closeCreateModal, queryClient, refetchPindan, routeActivityId],
  );

  const heroTitleKey =
    activeTab === `package` ? `pindan.hero.package` : activeTab === `hotel` ? `pindan.hero.hotel` : `pindan.hero.transport`;

  const heroSubKey = activeTab === `package` ? `pindan.hero.packageSubtitle` : `pindan.hero.subtitle`;

  const resolvedActivity = useMemo(() => {
    if (routeActivityId == null) return null;

    if (isApiEnabled()) {
      const backendActivity = findBackendActivityByLegacyId(apiActivities, routeActivityId);
      if (backendActivity) {
        return {
          id: backendActivity.legacyId,
          title: backendActivity.name,
          date: backendActivity.date ?? ``,
          location: backendActivity.location ?? ``,
          image: backendActivity.image ?? ``,
          hot: backendActivity.hot,
        };
      }
    }

    const staticActivity = getActivityById(routeActivityId);
    if (!staticActivity) return null;

    return {
      id: staticActivity.id,
      title: t(staticActivity.nameKey),
      date: staticActivity.date,
      location: staticActivity.location,
      image: staticActivity.image,
      hot: staticActivity.hot,
    };
  }, [apiActivities, routeActivityId, t]);

  const activityName = resolvedActivity?.title ?? null;

  return (
    <div data-cmp="PinDan" className={`s-pindan s-pindan--${activeTab}`}>
      <PageNavigation
        title={activityName ?? t("pindan.title")}
        trailing={
          <Button
            block="s-page-nav"
            element="icon-btn"
            modifiers={[`accent-tint`]}
            onClick={() => openCreateModal()}
          >
            <PlusIcon size={18} />
          </Button>
        }
      />

      <div className="s-pindan__hero">
        <div className="s-pindan__hero-grad" />
        <div className="s-pindan__hero-inner">
          <div>
            <p className="s-pindan__hero-label">{activityName ? t("pindan.currentActivity") : t("pindan.popular")}</p>
            <h2 className="s-pindan__hero-title">{t(heroTitleKey)}</h2>
            <p className="s-pindan__hero-sub">{t(heroSubKey)}</p>
          </div>
          <div className="s-pindan__hero-badge">
            {activeTab === `package` && <PackageIcon size={28} />}
            {activeTab === `hotel` && <BuildingIcon size={28} />}
            {activeTab === `transport` && <CarIcon size={28} />}
          </div>
        </div>
        <div className="s-pindan__hero-stats">
          <div className="s-pindan__stat">
            <UsersIcon size={12} />
            <span>{t("common.peopleJoined", { count: filtered.reduce((acc, i) => acc + i.joined, 0) })}</span>
          </div>
          <div className="s-pindan__stat">
            <CheckCircleIcon size={12} />
            <span>{t("common.pinOrdersActive", { count: filtered.length })}</span>
          </div>
        </div>
      </div>

      <div className="s-pindan__tabs-wrap">
        {tabs.map(({ key, labelKey, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`s-pindan__tab${activeTab === key ? ` s-pindan__tab--active` : ``}`}
          >
            <Icon size={14} />
            {t(labelKey)}
          </button>
        ))}
      </div>

      <div className="s-pindan__list">
        {filtered.map((item) => {
          const pct = progressPercent(item.joined, item.total);
          const spotsLeft = item.total - item.joined;
          const isPackage = item.type === `package`;
          const isOwner = isPindanOwner(item, clientUserId);
          const joinState = isOwner
            ? (`joined` as const)
            : getPindanJoinUiState(item, joinedIds, item.id);
          const joinLabel =
            joinState === `joined`
              ? t(`pindan.joined`)
              : joinState === `full`
                ? t(`common.full`)
                : isPackage
                  ? t(`pindan.joinPackage`)
                  : t(`pindan.join`);

          return (
            <div
              key={item.id}
              id={`pindan-item-${item.id}`}
              className={`s-pindan__card${highlightItemId === item.id ? ` s-pindan__card--focused` : ``}`}
            >
              <div className="s-pindan__media">
                <img src={item.image} alt={item.title} />
                <div className="s-pindan__media-grad" />

                <div
                  className={`s-pindan__price-pill${
                    isBudgetModePindan(item) && resolvePindanBudgetRangeLabel(item)
                      ? ` s-pindan__price-pill--budget`
                      : ``
                  }`}
                >
                  {isBudgetModePindan(item) && resolvePindanBudgetRangeLabel(item) ? (
                    <>
                      <span className="s-pindan__price-label">{t(`aimatch.pindan.budgetLabel`)}</span>
                      <span className="s-pindan__price-amount">
                        {resolvePindanBudgetRangeLabel(item)}
                      </span>
                    </>
                  ) : (
                    <>
                      <strong>¥{item.price}</strong>
                      {item.originalPrice > 0 ? (
                        <span className="s-pindan__price-was">¥{item.originalPrice}</span>
                      ) : null}
                    </>
                  )}
                </div>

                <div className="s-pindan__rate-pill">
                  <StarIcon size={11} />
                  <span>{item.rating}</span>
                </div>

                <span
                  className={`s-pindan__spot-pill${spotsLeft <= 1 ? ` s-pindan__spot-pill--urgent` : ` s-pindan__spot-pill--muted`}`}
                >
                  {spotsLeft === 0 ? t("common.full") : t("common.spotsLeft", { count: spotsLeft })}
                </span>

                <div className="s-pindan__media-title">
                  <h3>{item.title}</h3>
                  <p>{item.subtitle}</p>
                </div>
              </div>

              <div className="s-pindan__body">
                <div className="s-pindan__meta-row">
                  <div className="s-pindan__meta">
                    <CalendarIcon size={12} />
                    <span>{item.date}</span>
                  </div>
                  <div className="s-pindan__meta s-pindan__meta--truncate">
                    <MapPinIcon size={12} />
                    <span>{item.location}</span>
                  </div>
                </div>

                {item.remark?.trim() ? (
                  <p className="s-pindan__remark">{item.remark.trim()}</p>
                ) : null}

                {isPackage && item.includes && item.includes.length > 0 && (
                  <div className="s-pindan__includes">
                    <span className="s-pindan__includes-label">{t("pindan.packageIncludes")}</span>
                    {item.includes.map((inc) => {
                      const IncIcon = includeIcons[inc.kind];
                      return (
                        <div key={`${inc.kind}-${inc.title}`} className="s-pindan__include-row">
                          <div className={`s-pindan__include-icon s-pindan__include-icon--${inc.kind}`}>
                            <IncIcon size={14} />
                          </div>
                          <div className="s-pindan__include-text">
                            <strong>{inc.title}</strong>
                            <span>{inc.detail}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="s-pindan__tags">
                  {item.tags.map((tag) => (
                    <span key={tag} className="s-pindan__tag">{tag}</span>
                  ))}
                </div>

                <div className="s-pindan__prog-header">
                  <div className="s-pindan__prog-lead">
                    <UsersIcon size={11} />
                    <span>
                      {t("common.joinedCount", { joined: item.joined, total: item.total })}
                      {spotsLeft === 0
                        ? ` · ${t("common.full")}`
                        : ` · ${t("common.spotsLeft", { count: spotsLeft })}`}
                    </span>
                  </div>
                  <span className="s-pindan__prog-pct">{pct}%</span>
                </div>
                <div className="s-pindan__prog-track">
                  <div className="s-pindan__prog-fill" style={{ width: `${pct}%` }} />
                </div>

                <div className={`s-pindan__actions${isOwner ? ` s-pindan__actions--owner` : ``}`}>
                  {isOwner ? (
                    <>
                      <div className="s-pindan__owner-btns">
                        <Button
                          className="s-pindan__owner-btn s-pindan__owner-btn--edit"
                          onClick={() => handleEditPindan(item)}
                        >
                          {t("pindan.edit")}
                        </Button>
                        <Button
                          className="s-pindan__owner-btn s-pindan__owner-btn--delete"
                          onClick={() => handleDeletePindan(item)}
                        >
                          <Trash2Icon size={12} />
                          {t("pindan.delete")}
                        </Button>
                      </div>
                      <Button className="s-pindan__share-btn s-pindan__share-btn--compact" onClick={(e) => handleShare(item, e)}>
                        {t("common.share")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        className="s-pindan__join-btn"
                        disabled={isPindanJoinDisabled(joinState)}
                        onClick={() => handleJoin(item)}
                      >
                        {joinLabel}
                      </Button>
                      <Button className="s-pindan__share-btn" onClick={(e) => handleShare(item, e)}>
                        {t("common.share")}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t("pindan.deleteConfirmTitle")}
        message={
          pendingDelete
            ? t("pindan.deleteConfirmMessage", { title: pendingDelete.title })
            : ""
        }
        confirmText={t("pindan.delete")}
        cancelText={t("common.cancel")}
        danger
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={handleDeleteCancel}
      />

      <CreatePinDanModal
        open={showCreateModal || editPindanCard != null}
        onClose={() => {
          closeCreateModal();
          setEditPindanCard(null);
        }}
        categoryOptions={[activeTab as PinDanCreateCategory]}
        defaultCategory={editPindanCard?.category ?? (activeTab as PinDanCreateCategory)}
        initialEventName={activityName ?? ``}
        editPindan={editPindanCard}
        onSaved={handlePindanSaved}
        activity={resolvedActivity}
      />

      <JoinSuccessToast
        visible={joinToast.visible}
        title={joinToast.title}
        onView={handleViewJoinedPindan}
        onDismiss={dismissJoinToast}
      />

      <BottomNav />
    </div>
  );
};

export default PinDan;
