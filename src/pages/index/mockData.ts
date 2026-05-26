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
    title: "Tomorrowland 预热派对",
    date: "06/18-19",
    location: "CLUB SPACE · 上海",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
    category: "户外电音",
    hot: true,
    attendees: 238,
    going: false,
  },
  {
    id: 2,
    title: "EDC China 2025",
    date: "07/12-13",
    location: "苏州阳澄湖",
    image: "https://image.electricdaisycarnival.cn/sites/7/2024/12/edccn_2025_mk_an_fest_site_mh_1534x1360_r01.jpg",
    category: "EDM节",
    hot: false,
    attendees: 512,
    going: true,
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
    image: "https://image.electricdaisycarnival.cn/sites/7/2024/12/edccn_2025_mk_an_fest_site_mh_1534x1360_r01.jpg",
    attendees: 256,
  },
];
