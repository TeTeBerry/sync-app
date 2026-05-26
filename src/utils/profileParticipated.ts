import type { BackendActivity } from "../types/backend";

export type ProfileEventStatus = "upcoming" | "registered" | "completed";

export interface ProfileParticipatedItem {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
  status: ProfileEventStatus;
}

const MOCK_PROFILE_ACTIVITIES: BackendActivity[] = [
  {
    _id: "1",
    legacyId: 1,
    code: "tomorrowland",
    name: "Tomorrowland 预热派对",
    date: "06/18-19",
    location: "CLUB SPACE · 上海",
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&q=80",
  },
  {
    _id: "2",
    legacyId: 2,
    code: "edc",
    name: "EDC China 2025",
    date: "07/12-13",
    location: "苏州阳澄湖",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c090be5c520?w=200&q=80",
  },
  {
    _id: "3",
    legacyId: 3,
    code: "s2o",
    name: "S2O 三亚水上电音",
    date: "06/28-29",
    location: "三亚海棠湾",
    image:
      "https://images.unsplash.com/photo-1540039155732-d674d4e3f421?w=200&q=80",
  },
  {
    _id: "4",
    legacyId: 4,
    code: "ultra",
    name: "Ultra Shanghai",
    date: "08/01-03",
    location: "上海世博公园",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80",
  },
];

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1470229722913-7c090be5c520?w=200&q=80";

function parseActivityEndDate(dateStr?: string, refYear = new Date().getFullYear()): Date | null {
  if (!dateStr?.trim()) return null;
  const value = dateStr.trim();

  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  }

  const range = value.match(/^(\d{1,2})\/(\d{1,2})-(\d{1,2})/);
  if (range) {
    return new Date(refYear, Number(range[1]) - 1, Number(range[3]));
  }

  const single = value.match(/^(\d{1,2})\/(\d{1,2})/);
  if (single) {
    return new Date(refYear, Number(single[1]) - 1, Number(single[2]));
  }

  return null;
}

function parseActivityStartDate(dateStr?: string, refYear = new Date().getFullYear()): Date | null {
  if (!dateStr?.trim()) return null;
  const value = dateStr.trim();

  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  }

  const range = value.match(/^(\d{1,2})\/(\d{1,2})-/);
  if (range) {
    return new Date(refYear, Number(range[1]) - 1, Number(range[2]));
  }

  return parseActivityEndDate(value, refYear);
}

export function inferParticipatedEventStatus(dateStr?: string): ProfileEventStatus {
  const end = parseActivityEndDate(dateStr);
  if (!end) return "registered";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(23, 59, 59, 999);
  if (endDay < today) return "completed";

  const start = parseActivityStartDate(dateStr);
  if (start) {
    const startDay = new Date(start);
    startDay.setHours(0, 0, 0, 0);
    if (startDay > today) return "upcoming";
  }

  return "registered";
}

function sortParticipatedItems(items: ProfileParticipatedItem[]): ProfileParticipatedItem[] {
  const statusOrder: Record<ProfileEventStatus, number> = {
    upcoming: 0,
    registered: 1,
    completed: 2,
  };

  return [...items].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;

    const aEnd = parseActivityEndDate(a.date)?.getTime() ?? 0;
    const bEnd = parseActivityEndDate(b.date)?.getTime() ?? 0;
    return bEnd - aEnd;
  });
}

export function buildParticipatedActivities(
  activities: BackendActivity[] = MOCK_PROFILE_ACTIVITIES,
): ProfileParticipatedItem[] {
  return sortParticipatedItems(
    activities
      .filter((activity) => activity.legacyId != null)
      .map((activity) => ({
        id: activity.legacyId!,
        title: activity.name,
        date: activity.date ?? "",
        location: activity.location ?? "",
        image: activity.image ?? DEFAULT_IMAGE,
        status: inferParticipatedEventStatus(activity.date),
      })),
  );
}
