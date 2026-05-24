import "./pindan.scss";
import Taro, { useDidShow } from "@tarojs/taro";
import React, { useCallback, useEffect, useState } from "react";
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
  UsersIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import BottomNav from "../../components/BottomNav";
import CreatePinDanModal, { type PinDanCreateCategory } from "../../components/CreatePinDanModal";
import JoinSuccessToast from "../../components/JoinSuccessToast";
import PageNavigation from "../../components/PageNavigation";
import { Button } from "../../components/ui";
import { getActivityById } from "../../data/activities";
import type { ProfilePinDanItem } from "../profile/mockData";
import { formatJoinedAt, saveJoinedPindanItem } from "../../utils/myPindanStorage";
import { goProfilePindan } from "../../utils/route";
import { sharePinDanItem } from "../../utils/share";

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
  date: string;
  location: string;
  joined: number;
  total: number;
  tags: string[];
  rating: number;
  includes?: PackageInclude[];
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
  const [activeTab, setActiveTab] = useState<TabType>(`package`);
  const [routeActivityId, setRouteActivityId] = useState<number | null>(null);
  const [highlightItemId, setHighlightItemId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinedIds, setJoinedIds] = useState<Set<number>>(() => new Set());
  const [joinToast, setJoinToast] = useState<{ visible: boolean; title: string; profileId: number | null }>({
    visible: false,
    title: ``,
    profileId: null,
  });

  const applyRouteParams = useCallback(() => {
    const { activityId, highlightId, type } = parseRouteParams();
    setRouteActivityId(activityId);
    if (type) {
      setActiveTab(type);
    } else if (activityId) {
      setActiveTab(`package`);
    }
    setHighlightItemId(highlightId);
  }, []);

  useDidShow(applyRouteParams);

  useEffect(() => {
    if (highlightItemId == null) return;

    const scrollTimer = window.setTimeout(() => {
      document.getElementById(`pindan-item-${highlightItemId}`)?.scrollIntoView({
        behavior: `smooth`,
        block: `center`,
      });
    }, 180);

    const clearTimer = window.setTimeout(() => setHighlightItemId(null), 2800);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(clearTimer);
    };
  }, [highlightItemId, activeTab, routeActivityId]);

  const filtered = mockData.filter((item) => {
    if (item.type !== activeTab) return false;
    if (routeActivityId == null) return true;
    return item.activityId === routeActivityId;
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

  const handleJoin = useCallback((item: PinDanItem) => {
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
    setJoinedIds((prev) => new Set(prev).add(item.id));
    setJoinToast({ visible: true, title: item.title, profileId: item.id });
  }, []);

  const dismissJoinToast = useCallback(() => {
    setJoinToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleViewJoinedPindan = useCallback(() => {
    const profileId = joinToast.profileId;
    setJoinToast({ visible: false, title: ``, profileId: null });
    if (profileId != null) goProfilePindan(profileId);
  }, [joinToast.profileId]);

  const heroTitleKey =
    activeTab === `package` ? `pindan.hero.package` : activeTab === `hotel` ? `pindan.hero.hotel` : `pindan.hero.transport`;

  const heroSubKey = activeTab === `package` ? `pindan.hero.packageSubtitle` : `pindan.hero.subtitle`;

  const routeActivity = routeActivityId != null ? getActivityById(routeActivityId) : undefined;
  const activityName = routeActivity ? t(routeActivity.nameKey) : null;

  return (
    <div data-cmp="PinDan" className={`s-pindan s-pindan--${activeTab}`}>
      <PageNavigation
        title={activityName ?? t("pindan.title")}
        trailing={
          <Button
            block="s-page-nav"
            element="icon-btn"
            modifiers={[`accent-tint`]}
            onClick={() => setShowCreateModal(true)}
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

          return (
            <div
              key={item.id}
              id={`pindan-item-${item.id}`}
              className={`s-pindan__card${highlightItemId === item.id ? ` s-pindan__card--focused` : ``}`}
            >
              <div className="s-pindan__media">
                <img src={item.image} alt={item.title} />
                <div className="s-pindan__media-grad" />

                <div className="s-pindan__price-pill">
                  <strong>¥{item.price}</strong>
                  <span className="s-pindan__price-was">¥{item.originalPrice}</span>
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
                    <span>{t("common.joinedCount", { joined: item.joined, total: item.total })}</span>
                  </div>
                  <span className="s-pindan__prog-pct">{pct}%</span>
                </div>
                <div className="s-pindan__prog-track">
                  <div className="s-pindan__prog-fill" style={{ width: `${pct}%` }} />
                </div>

                <div className="s-pindan__actions">
                  <Button
                    className="s-pindan__join-btn"
                    disabled={joinedIds.has(item.id)}
                    onClick={() => handleJoin(item)}
                  >
                    {joinedIds.has(item.id)
                      ? t("pindan.joined")
                      : isPackage
                        ? t("pindan.joinPackage")
                        : t("pindan.join")}
                  </Button>
                  <Button className="s-pindan__share-btn" onClick={(e) => handleShare(item, e)}>
                    {t("common.share")}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <CreatePinDanModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        categoryOptions={[activeTab as PinDanCreateCategory]}
        defaultCategory={activeTab as PinDanCreateCategory}
        initialEventName={activityName ?? ``}
        activity={
          routeActivity
            ? {
                id: routeActivity.id,
                title: activityName ?? t(routeActivity.nameKey),
                date: routeActivity.date,
                location: routeActivity.location,
                image: routeActivity.image,
                hot: routeActivity.hot,
              }
            : null
        }
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
