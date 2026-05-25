import type { ProfilePinDanItem } from "../../types/backend";
import { buildParticipatedActivities } from "../../utils/profileParticipated";

export type ProfilePinDanCategory = "package" | "hotel" | "transport";

export type { ProfilePinDanItem };
export type {
  ProfileEventStatus,
  ProfileParticipatedItem as ProfileEventItem,
} from "../../utils/profileParticipated";

export const profileUser = {
  name: "Zara",
  phone: "17610941208",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  location: "上海 · 静安区",
  isVip: true,
  isOnline: true,
  stats: {
    events: 23,
    pinSuccess: 18,
    buddies: 64,
  },
  level: {
    current: 7,
    xp: 1220,
    xpMax: 1600,
    xpToNext: 380,
  },
};

export const myPinDanEvents: ProfilePinDanItem[] = [
  {
    id: 1,
    activityId: 3,
    category: "package",
    title: "三亚电音节·全程套餐",
    subtitle: "S2O Festival · 酒店+机票联合拼",
    date: "06/27-30",
    location: "三亚海棠湾",
    price: 1580,
    image: "https://images.unsplash.com/photo-1540039155732-d674d4e3f421?w=400&q=80",
    joinedAt: "05/25 05:23",
    isOwner: false,
  },
  {
    id: 2,
    activityId: 2,
    category: "package",
    title: "EDC China 苏州套餐",
    subtitle: "阳澄湖民宿+专车 · VIP联合拼",
    date: "07/11-14",
    location: "苏州阳澄湖",
    price: 860,
    image: "https://images.unsplash.com/photo-1470229722913-7c090be5c520?w=400&q=80",
    joinedAt: "05/24 18:40",
    isOwner: false,
  },
  {
    id: 101,
    activityId: 1,
    category: "hotel",
    title: "上海外滩威斯汀",
    subtitle: "外滩景观房 · 我发起的拼单",
    date: "06/19-21",
    location: "上海黄浦区",
    price: 580,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80",
    joinedAt: "05/23 10:15",
    isOwner: true,
    total: 4,
  },
];

export const myTicketEvents = [
  {
    id: "mock-ticket-1",
    type: "sell" as const,
    activityId: "edc",
    displayEventName: "EDC China 2025",
    skuCode: "GA",
    quantity: 2,
    price: 800,
    eventDate: "2025-07-12",
    contact: "17610941208",
    createdAt: "05/25 14:20",
  },
  {
    id: "mock-ticket-2",
    type: "buy" as const,
    activityId: "s2o",
    displayEventName: "S2O 三亚水上电音",
    skuCode: "水上区",
    quantity: 1,
    price: 420,
    eventDate: "2025-06-28",
    contact: "17610941208",
    createdAt: "05/24 09:15",
  },
];

export const participatedEvents = buildParticipatedActivities(
  myPinDanEvents,
  myTicketEvents,
);
