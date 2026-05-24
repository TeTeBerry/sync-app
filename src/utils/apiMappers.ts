import type { TicketListing, TicketTagTone } from "../data/ticketListings";
import type { BackendActivity, BackendPindan, BackendTicket } from "../types/backend";

export type PinDanCategory = "package" | "hotel" | "transport";

export interface PinDanCardUi {
  id: string;
  category: PinDanCategory;
  title: string;
  desc: string;
  price: number;
  originalPrice: number;
  joined: number;
  total: number;
  date: string;
  location: string;
  image: string;
  tags: string[];
  urgent: boolean;
}

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

export interface PindanPageItem {
  id: number;
  activityId: number;
  type: PinDanCategory;
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
  includes?: Array<{ kind: "hotel" | "transport"; title: string; detail: string }>;
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

const PINDAN_IMAGES: Record<PinDanCategory, string> = {
  package:
    "https://images.unsplash.com/photo-1540039155732-d674d4e3f421?w=400&q=80",
  hotel: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&q=80",
  transport: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80",
};

const AVATAR_POOL = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&q=80",
];

function inferPinDanCategory(title: string, type?: string): PinDanCategory {
  if (type === "package" || type === "hotel" || type === "transport") {
    return type;
  }
  return /机票|航班|交通|接驳|飞|舱/.test(title) ? "transport" : "hotel";
}

function formatRelativeTime(iso?: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.max(1, Math.floor(diff / (1000 * 60 * 60)));
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}

function ticketTag(type: "sell" | "buy", price: number): { tag: string; tone: TicketTagTone } {
  if (type === "buy") {
    return { tag: price >= 1000 ? "高价求" : "求购", tone: "secondary" };
  }
  return { tag: "在售", tone: "primary" };
}

export function buildActivityNameMap(activities: BackendActivity[]): Map<string, string> {
  return new Map(activities.map((item) => [item.code, item.name]));
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

export function mapPindanToCards(
  items: BackendPindan[],
  activityNames: Map<string, string>,
): PinDanCardUi[] {
  return items.map((item) => {
    const category = inferPinDanCategory(item.title, item.type);
    const joined = item.joined ?? (item.memberUserIds?.length ?? 0) + 1;
    const total = item.total ?? Math.max(4, joined + 1);
    const activityLabel = item.activityId ? activityNames.get(item.activityId) ?? item.activityId : "";

    return {
      id: String(item.legacyId ?? item._id),
      category,
      title: item.title,
      desc: item.subtitle ?? (activityLabel ? `${activityLabel} · 开放拼单` : "开放拼单"),
      price: item.price ?? (category === "transport" ? 1200 : 450),
      originalPrice: item.originalPrice ?? (category === "transport" ? 4800 : 1800),
      joined,
      total,
      date: item.date ?? "06/27-30",
      location: item.location ?? (category === "transport" ? "PVG→SYX" : "三亚"),
      image: item.image ?? PINDAN_IMAGES[category],
      tags: item.tags ?? (category === "transport" ? ["商务舱", "含行李"] : ["海景房", "含早餐"]),
      urgent: joined >= total - 1,
    };
  });
}

export function mapPindanToPageItems(items: BackendPindan[]): PindanPageItem[] {
  return items
    .filter((item) => item.legacyId != null)
    .map((item) => {
      const type = inferPinDanCategory(item.title, item.type);
      const joined = item.joined ?? (item.memberUserIds?.length ?? 0) + 1;
      const total = item.total ?? Math.max(4, joined + 1);

      return {
        id: item.legacyId as number,
        activityId: item.activityLegacyId ?? 0,
        type,
        title: item.title,
        subtitle: item.subtitle ?? "",
        image: item.image ?? PINDAN_IMAGES[type],
        price: item.price ?? 0,
        originalPrice: item.originalPrice ?? 0,
        date: item.date ?? "",
        location: item.location ?? "",
        joined,
        total,
        tags: item.tags ?? [],
        rating: item.rating ?? 4.8,
        includes: item.includes,
      };
    });
}

export function mapTicketsToListings(
  tickets: BackendTicket[],
  activityNames: Map<string, string>,
): TicketListing[] {
  return tickets.map((ticket, index) => {
    const slot = ticket.seatOrSlot ?? {};
    const type = slot.type === "buy" ? "buy" : "sell";
    const quantity = slot.quantity ?? 1;
    const price = slot.price ?? (type === "sell" ? 880 : 560);
    const { tag, tone } = ticketTag(type, price);

    return {
      id: ticket._id,
      type,
      event: activityNames.get(ticket.activityId ?? "") ?? ticket.activityId ?? "未知活动",
      seat: `${ticket.skuCode ?? "GA"} · ${quantity}张`,
      price,
      originalPrice: type === "sell" ? Math.round(price * 1.35) : 0,
      seller: ticket.userId ?? "用户",
      avatar: AVATAR_POOL[index % AVATAR_POOL.length],
      tag,
      tone,
      time: formatRelativeTime(ticket.createdAt),
      verified: true,
    };
  });
}
