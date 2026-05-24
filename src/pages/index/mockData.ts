import type { TagTone } from "./home.types";

export type {
  TicketListing as TicketListingItem,
  TicketFilterKey as TicketTabKey,
  TicketTagTone,
} from "../../data/ticketListings";

export { ticketListings } from "../../data/ticketListings";

export type HotEventItem = {
  id: number;
  title: string;
  badge: string;
  people: number;
  image: string;
};

/** @deprecated Use TicketTagTone from data/ticketListings */
export type { TagTone };

export const ticketTabs: { key: import("../../data/ticketListings").TicketFilterKey; labelKey: string }[] = [
  { key: `all`, labelKey: `home.ticket.tabs.all` },
  { key: `sell`, labelKey: `home.ticket.tabs.sell` },
  { key: `buy`, labelKey: `home.ticket.tabs.buy` },
];

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
