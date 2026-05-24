export type ProfileEventStatus = "upcoming" | "registered" | "completed";
export type ProfilePinDanCategory = "package" | "hotel" | "transport";

export interface ProfileEventItem {
  id: number;
  title: string;
  date: string;
  image: string;
  status: ProfileEventStatus;
}

export interface ProfilePinDanItem {
  id: number;
  activityId: number;
  category: ProfilePinDanCategory;
  title: string;
  subtitle: string;
  date: string;
  location: string;
  price: number;
  image: string;
  joinedAt: string;
}

export const profileUser = {
  name: "Zara",
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

export const participatedEvents: ProfileEventItem[] = [
  {
    id: 1,
    title: "Tomorrowland 预热派对",
    date: "07月18日",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&q=80",
    status: "upcoming",
  },
  {
    id: 2,
    title: "EDC China 2025",
    date: "07月26日",
    image: "https://images.unsplash.com/photo-1470229722913-7c090be5c520?w=200&q=80",
    status: "registered",
  },
  {
    id: 3,
    title: "S2O 水上电音节",
    date: "06月27日",
    image: "https://images.unsplash.com/photo-1540039155732-d674d4e3f421?w=200&q=80",
    status: "completed",
  },
];

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
  },
];
