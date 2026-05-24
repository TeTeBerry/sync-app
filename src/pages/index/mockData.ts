import type { TagTone } from "./home.types";

export type HotEventItem = {
  id: number;
  title: string;
  badge: string;
  people: number;
  image: string;
};

export type TicketListingItem = {
  id: number;
  type: "sell" | "buy";
  event: string;
  seat: string;
  price: number;
  originalPrice: number;
  seller: string;
  avatar: string;
  tag: string;
  tagTone: TagTone;
  time: string;
};

export type TicketTabKey = "all" | "sell" | "buy";

export const hotEvents: HotEventItem[] = [
  {
    id: 1,
    title: `Tomorrowland 预热派对`,
    badge: `🔥 最热`,
    people: 238,
    image: `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80`,
  },
  {
    id: 2,
    title: `EDC China 电音节`,
    badge: `⚡ 急拼`,
    people: 95,
    image: `https://images.unsplash.com/photo-1470229722913-7c090be5c520?w=400&q=80`,
  },
  {
    id: 3,
    title: `S2O 三亚水上电音`,
    badge: `🎉 新开`,
    people: 62,
    image: `https://images.unsplash.com/photo-1540039155732-d674d4e3f421?w=400&q=80`,
  },
  {
    id: 4,
    title: `Ultra Shanghai`,
    badge: `🏆 大神局`,
    people: 181,
    image: `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80`,
  },
];

export const ticketListings: TicketListingItem[] = [
  {
    id: 1,
    type: `sell`,
    event: `Tomorrowland 2025`,
    seat: `VIP B区 · 2张`,
    price: 880,
    originalPrice: 1200,
    seller: `Mia`,
    avatar: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&q=80`,
    tag: `急出`,
    tagTone: `primary`,
    time: `1小时前`,
  },
  {
    id: 2,
    type: `buy`,
    event: `EDC China 2025`,
    seat: `普通区 · 1张`,
    price: 560,
    originalPrice: 0,
    seller: `Leo`,
    avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80`,
    tag: `求购`,
    tagTone: `cyan`,
    time: `3小时前`,
  },
  {
    id: 3,
    type: `sell`,
    event: `S2O 三亚电音节`,
    seat: `水上区 · 4张`,
    price: 420,
    originalPrice: 680,
    seller: `Zara`,
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&q=80`,
    tag: `9折`,
    tagTone: `amber`,
    time: `5小时前`,
  },
  {
    id: 4,
    type: `buy`,
    event: `Ultra Shanghai`,
    seat: `Front Stage · 2张`,
    price: 1100,
    originalPrice: 0,
    seller: `Jake`,
    avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&q=80`,
    tag: `高价求`,
    tagTone: `secondary`,
    time: `8小时前`,
  },
];

export const ticketTabs: { key: TicketTabKey; labelKey: string }[] = [
  { key: `all`, labelKey: `home.ticket.tabs.all` },
  { key: `sell`, labelKey: `home.ticket.tabs.sell` },
  { key: `buy`, labelKey: `home.ticket.tabs.buy` },
];

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
    image:
      "https://images.unsplash.com/photo-1540039155732-d674d4e3f421?w=400&q=80",
    attendees: 128,
  },
  {
    title: "Tomorrowland 预热派对",
    date: "本周五 22:00 • CLUB SPACE",
    location: "静安区",
    distance: "5.0 km",
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80",
    attendees: 45,
  },
  {
    title: "EDC China",
    date: "下周末 16:00 • 阳澄湖",
    location: "相城区",
    distance: "15.0 km",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c090be5c520?w=400&q=80",
    attendees: 256,
  },
];
