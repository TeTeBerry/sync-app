export type TicketListingType = `sell` | `buy`;
export type TicketTagTone = `primary` | `secondary` | `amber` | `cyan`;
export type TicketFilterKey = `all` | `sell` | `buy`;

export interface TicketListing {
  id: number;
  type: TicketListingType;
  event: string;
  seat: string;
  price: number;
  originalPrice: number;
  seller: string;
  avatar: string;
  tag: string;
  tone: TicketTagTone;
  time: string;
  verified: boolean;
}

export const ticketListings: TicketListing[] = [
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
    tone: `primary`,
    time: `1小时前`,
    verified: true,
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
    tone: `secondary`,
    time: `3小时前`,
    verified: true,
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
    tone: `amber`,
    time: `5小时前`,
    verified: false,
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
    tone: `cyan`,
    time: `8小时前`,
    verified: true,
  },
];

export const ticketFilterTabs: { key: TicketFilterKey; labelKey: string }[] = [
  { key: `all`, labelKey: `aimatch.ticket.tabs.all` },
  { key: `sell`, labelKey: `aimatch.ticket.tabs.selling` },
  { key: `buy`, labelKey: `aimatch.ticket.tabs.buying` },
];
