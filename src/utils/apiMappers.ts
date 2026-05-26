import type { BackendActivity } from "../types/backend";

export interface EventCardUi {
  id: string;
  title: string;
  date: string;
  location: string;
  distance: string;
  image: string;
  attendees: number;
  pinCount: number;
  category: string;
  hot: boolean;
  going: boolean;
}

const ACTIVITY_EVENT_PRESETS: Record<
  string,
  Pick<EventCardUi, "date" | "location" | "distance" | "image" | "category" | "hot" | "attendees" | "pinCount">
> = {
  s2o: {
    date: "06/28–29 14:00",
    location: "三亚海棠湾",
    distance: "2.5 km",
    image: "https://images.unsplash.com/photo-1540039155732-d674d4e3f421?w=400&q=80",
    category: "户外电音",
    hot: true,
    attendees: 238,
    pinCount: 12,
  },
  edc: {
    date: "07/12–13 16:00",
    location: "苏州阳澄湖",
    distance: "15 km",
    image: "https://images.unsplash.com/photo-1470229722913-7c090be5c520?w=400&q=80",
    category: "EDM节",
    hot: true,
    attendees: 512,
    pinCount: 35,
  },
  ultra: {
    date: "08/02–03 14:00",
    location: "上海世博公园",
    distance: "8.3 km",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
    category: "大型节日",
    hot: false,
    attendees: 320,
    pinCount: 27,
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
      pinCount: activity.pinCount ?? preset.pinCount,
      distance: preset.distance,
      category: preset.category,
    };
  });
}
