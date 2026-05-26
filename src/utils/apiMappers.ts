import type { FeaturedEvent } from "../pages/index/homeData";
import type { BackendActivity, HomeSummary } from "../types/backend";

type SignupEvent = HomeSummary["signupEvents"][number];

const FEATURED_GUEST_AVATARS = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&q=80&fit=crop&crop=face",
];

export interface EventCardUi {
  id: string;
  title: string;
  date: string;
  location: string;
  distance: string;
  image: string;
  attendees: number;
  category: string;
  hot: boolean;
  going: boolean;
}

const ACTIVITY_EVENT_PRESETS: Record<
  string,
  Pick<EventCardUi, "date" | "location" | "distance" | "image" | "category" | "hot" | "attendees">
> = {
  tomorrowland: {
    date: "06/18–19 22:00",
    location: "CLUB SPACE · 上海",
    distance: "5.0 km",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80",
    category: "户外电音",
    hot: true,
    attendees: 238,
  },
  edc: {
    date: "05/26–28 16:00",
    location: "苏州阳澄湖",
    distance: "15 km",
    image: "https://image.electricdaisycarnival.cn/sites/7/2024/12/edccn_2025_mk_an_fest_site_mh_1534x1360_r01.jpg",
    category: "EDM节",
    hot: true,
    attendees: 512,
  },
  ultra: {
    date: "08/02–03 14:00",
    location: "成都",
    distance: "8.3 km",
    image: "https://xqimg.imedao.com/195407c76ec3d53a3fe41eda.jpeg",
    category: "大型节日",
    hot: false,
    attendees: 320,
  },
  "vac-zhuhai": {
    date: "04/18–19 20:00",
    location: "珠海",
    distance: "120 km",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
    category: "室内电音",
    hot: false,
    attendees: 96,
  },
};

const DEFAULT_EVENT_PRESET = ACTIVITY_EVENT_PRESETS.edc;

export function buildActivityNameMap(activities: BackendActivity[]): Map<string, string> {
  return new Map(activities.map((item) => [item.code, item.name]));
}

export function findBackendActivityByLegacyId(
  activities: BackendActivity[],
  legacyId: number,
): BackendActivity | undefined {
  return activities.find((activity) => activity.legacyId === legacyId);
}

export function mapActivitiesToEvents(activities: BackendActivity[]): EventCardUi[] {
  return activities.map((activity) => {
    const preset = ACTIVITY_EVENT_PRESETS[activity.code] ?? DEFAULT_EVENT_PRESET;
    return {
      id: String(activity.legacyId ?? activity._id),
      title: activity.name,
      going: false,
      date: activity.date ?? preset.date,
      location: activity.location ?? preset.location,
      image: activity.image ?? preset.image,
      hot: activity.hot ?? preset.hot,
      attendees: activity.attendees ?? preset.attendees,
      distance: preset.distance,
      category: preset.category,
    };
  });
}

export function mapSignupEventToFeaturedEvent(item: SignupEvent): FeaturedEvent {
  return {
    id: item.id,
    title: item.title,
    date: item.date,
    venue: item.location,
    distance: item.hot ? "热门" : item.category,
    price: `${item.attendees}+`,
    remaining: "",
    guests: FEATURED_GUEST_AVATARS,
    image: item.image || undefined,
  };
}

export function mapBackendActivityToFeaturedEvent(activity: BackendActivity): FeaturedEvent {
  return mapSignupEventToFeaturedEvent({
    id: activity.legacyId,
    title: activity.name,
    date: activity.date ?? "",
    location: activity.location ?? "",
    image: activity.image ?? "",
    category: activity.hot ? "户外电音" : "EDM节",
    hot: Boolean(activity.hot),
    attendees: activity.attendees ?? 0,
    going: false,
  });
}

/** 首页精选：优先 hot，最多 2 条 */
export function pickHomeFeaturedEvents(signupEvents: SignupEvent[]): FeaturedEvent[] {
  const hot = signupEvents.filter((item) => item.hot);
  const rest = signupEvents.filter((item) => !item.hot);
  return [...hot, ...rest].slice(0, 2).map(mapSignupEventToFeaturedEvent);
}
