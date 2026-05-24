import type { PinDanTabType } from "../../utils/route";
import type { TagTone } from "./home.types";

export type {
  TicketListing as TicketListingItem,
  TicketFilterKey as TicketTabKey,
  TicketTagTone,
} from "../../data/ticketListings";

export { ticketListings } from "../../data/ticketListings";

/** @deprecated Use TicketTagTone from data/ticketListings */
export type { TagTone };

export type EventSignupItem = {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
  category: string;
  hot: boolean;
  attendees: number;
  pinCount: number;
  going: boolean;
};

export type HotPinItem = {
  /** 活动 ID，对应拼单页 activityId */
  id: number;
  rank: number;
  title: string;
  badge: string;
  category: string;
  categoryTone: TagTone;
  people: number;
  pinType: PinDanTabType;
  /** 拼单页 mock 数据中的卡片 ID，用于滚动定位与高亮 */
  pinItemId: number;
};

export type HomeHeatStats = {
  people: number;
  pinOrders: number;
  growthPercent: number;
};

export const homeHeatStats: HomeHeatStats = {
  people: 576,
  pinOrders: 34,
  growthPercent: 28,
};

export const eventSignupItems: EventSignupItem[] = [
  {
    id: 1,
    title: "Tomorrowland 预热派对",
    date: "06/18-19",
    location: "CLUB SPACE · 上海",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
    category: "户外电音",
    hot: true,
    attendees: 238,
    pinCount: 12,
    going: false,
  },
  {
    id: 2,
    title: "EDC China 2025",
    date: "07/12-13",
    location: "苏州阳澄湖",
    image: "https://images.unsplash.com/photo-1470229722913-7c090be5c520?w=600&q=80",
    category: "EDM节",
    hot: false,
    attendees: 512,
    pinCount: 35,
    going: true,
  },
  {
    id: 3,
    title: "S2O 三亚水上电音",
    date: "06/28-29",
    location: "三亚海棠湾",
    image: "https://images.unsplash.com/photo-1540039155732-d674d4e3f421?w=600&q=80",
    category: "户外电音",
    hot: false,
    attendees: 128,
    pinCount: 8,
    going: false,
  },
];

export const hotPinItems: HotPinItem[] = [
  {
    id: 1,
    rank: 1,
    title: "Tomorrowland 预热派对",
    badge: "🔥 最热",
    category: "套餐拼",
    categoryTone: "primary",
    people: 238,
    pinType: "package",
    pinItemId: 3,
  },
  {
    id: 2,
    rank: 2,
    title: "EDC China 电音节",
    badge: "⚡ 急拼",
    category: "酒店拼",
    categoryTone: "amber",
    people: 95,
    pinType: "hotel",
    pinItemId: 5,
  },
  {
    id: 3,
    rank: 3,
    title: "S2O 三亚水上电音",
    badge: "🎉 新开",
    category: "酒店拼",
    categoryTone: "amber",
    people: 62,
    pinType: "hotel",
    pinItemId: 4,
  },
  {
    id: 4,
    rank: 4,
    title: "Ultra Shanghai",
    badge: "🏆 大神局",
    category: "交通拼",
    categoryTone: "cyan",
    people: 181,
    pinType: "transport",
    pinItemId: 12,
  },
];

/** @deprecated use hotPinItems */
export type HotEventItem = HotPinItem;

/** @deprecated use hotPinItems */
export const hotEvents = hotPinItems;

export interface NearEventBrief {
  title: string;
  date: string;
  location: string;
  distance: string;
  image: string;
  attendees: number;
}

export const nearEventsMock: NearEventBrief[] = [
  {
    title: "S2O 三亚电音节",
    date: "本周六 14:00 • 三亚海棠湾",
    location: "海棠广场",
    distance: "2.5 km",
    image: "https://images.unsplash.com/photo-1540039155732-d674d4e3f421?w=400&q=80",
    attendees: 128,
  },
  {
    title: "Tomorrowland 预热派对",
    date: "本周五 22:00 • CLUB SPACE",
    location: "静安区",
    distance: "5.0 km",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80",
    attendees: 45,
  },
  {
    title: "EDC China",
    date: "下周末 16:00 • 阳澄湖",
    location: "相城区",
    distance: "15.0 km",
    image: "https://images.unsplash.com/photo-1470229722913-7c090be5c520?w=400&q=80",
    attendees: 256,
  },
];
