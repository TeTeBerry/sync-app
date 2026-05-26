export type EventSignupItem = {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
  category: string;
  hot: boolean;
  attendees: number;
  going: boolean;
};

export type HomeHeatStats = {
  people: number;
  growthPercent: number;
};

export const homeHeatStats: HomeHeatStats = {
  people: 576,
  growthPercent: 28,
};

export const eventSignupItems: EventSignupItem[] = [
  {
    id: 1,
    title: "Tomorrowland Thailand 2026",
    date: "12/11-13",
    location: "芭提雅 Wisdom Valley",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80",
    category: "大型节日",
    hot: true,
    attendees: 1500,
    going: false,
  },
  {
    id: 2,
    title: "EDC China 2025",
    date: "03/22-23",
    location: "苏州阳澄湖半岛旅游度假区",
    image: "https://image.electricdaisycarnival.cn/sites/7/2024/12/edccn_2025_mk_an_fest_site_mh_1534x1360_r01.jpg",
    category: "EDM节",
    hot: false,
    attendees: 512,
    going: true,
  },
  {
    id: 4,
    title: "风暴电音节 深圳站",
    date: "06/13-14",
    location: "深圳国际会展中心",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80",
    category: "室内电音",
    hot: true,
    attendees: 420,
    going: false,
  },
  {
    id: 5,
    title: "EDC Thailand 2026",
    date: "12/18-20",
    location: "普吉岛 Rhythm Park",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
    category: "EDM节",
    hot: true,
    attendees: 180,
    going: false,
  },
  {
    id: 6,
    title: "2026横琴VAC电音节",
    date: "04/18-19",
    location: "横琴长隆度假区",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    category: "室内电音",
    hot: false,
    attendees: 96,
    going: false,
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
    title: "风暴电音节 深圳站",
    date: "6月13-14 · 深圳国际会展中心",
    location: "宝安区",
    distance: "8.5 km",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
    attendees: 256,
  },
  {
    title: "Tomorrowland Thailand 2026",
    date: "12月11-13 · Wisdom Valley",
    location: "芭提雅",
    distance: "2,800 km",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80",
    attendees: 420,
  },
];
