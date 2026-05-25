import type {
  BackendActivity,
  ProfilePinDanItem,
  ProfileTicketItem,
} from "../types/backend";
import { findBackendActivityByLegacyId } from "./apiMappers";

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

function resolveLegacyId(
  activityRef: string | number | undefined,
  activities: BackendActivity[],
): number | null {
  if (activityRef == null || activityRef === "") return null;

  if (typeof activityRef === "number" && activityRef > 0) {
    return activityRef;
  }

  const normalized = String(activityRef).trim().toLowerCase();
  if (!normalized) return null;

  const asNumber = Number(normalized);
  if (!Number.isNaN(asNumber) && asNumber > 0) {
    return asNumber;
  }

  const byCode = activities.find((item) => item.code.toLowerCase() === normalized);
  if (byCode?.legacyId) return byCode.legacyId;

  const byAlias = activities.find((item) =>
    item.alias?.some((alias) => alias.toLowerCase() === normalized),
  );
  return byAlias?.legacyId ?? null;
}

function buildActivityLookup(activities: BackendActivity[]) {
  const codeToLegacyId = new Map<string, number>();
  for (const activity of activities) {
    if (activity.legacyId == null) continue;
    codeToLegacyId.set(activity.code.toLowerCase(), activity.legacyId);
    for (const alias of activity.alias ?? []) {
      codeToLegacyId.set(alias.toLowerCase(), activity.legacyId);
    }
  }
  return codeToLegacyId;
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
  pindans: ProfilePinDanItem[],
  tickets: ProfileTicketItem[],
  activities: BackendActivity[] = MOCK_PROFILE_ACTIVITIES,
): ProfileParticipatedItem[] {
  const lookup = buildActivityLookup(activities);
  const byLegacyId = new Map<number, ProfileParticipatedItem>();

  const upsert = (
    legacyId: number,
    fallback: {
      title?: string;
      date?: string;
      location?: string;
      image?: string;
    },
  ) => {
    const activity = findBackendActivityByLegacyId(activities, legacyId);
    const date = activity?.date || fallback.date || "";
    const existing = byLegacyId.get(legacyId);

    if (existing) {
      if (!existing.date && date) existing.date = date;
      if (!existing.location && (activity?.location || fallback.location)) {
        existing.location = activity?.location || fallback.location || "";
      }
      if (!existing.image && (activity?.image || fallback.image)) {
        existing.image = activity?.image || fallback.image || DEFAULT_IMAGE;
      }
      existing.status = inferParticipatedEventStatus(existing.date);
      return;
    }

    byLegacyId.set(legacyId, {
      id: legacyId,
      title: activity?.name || fallback.title || `活动 #${legacyId}`,
      date,
      location: activity?.location || fallback.location || "",
      image: activity?.image || fallback.image || DEFAULT_IMAGE,
      status: inferParticipatedEventStatus(date),
    });
  };

  for (const pindan of pindans) {
    const legacyId = resolveLegacyId(pindan.activityId, activities);
    if (!legacyId) continue;

    upsert(legacyId, {
      date: pindan.date,
      location: pindan.location,
      image: pindan.image,
    });
  }

  for (const ticket of tickets) {
    const normalizedActivityId = ticket.activityId?.trim().toLowerCase() ?? "";
    const legacyId =
      resolveLegacyId(ticket.activityId, activities) ??
      (normalizedActivityId ? lookup.get(normalizedActivityId) ?? null : null);
    if (!legacyId) continue;

    upsert(legacyId, {
      title: ticket.displayEventName,
      date: ticket.eventDate,
    });
  }

  return sortParticipatedItems([...byLegacyId.values()]);
}
