export type CountdownPart = {
  value: string;
  unit: string;
  accent?: boolean;
};

export type FeaturedEvent = {
  id: number;
  title: string;
  date: string;
  venue: string;
  distance: string;
  price: string;
  remaining: string;
  guests: string[];
  image?: string;
  logo?: string;
};

export type ActivityPost = {
  id: string;
  name: string;
  handle: string;
  event: string;
  location: string;
  body: string;
  time: string;
  likes: number;
  avatar: string;
  status: "招募中" | "已成团";
};

export const featuredEvents: FeaturedEvent[] = [
  {
    id: 1,
    title: "Tomorrowland China",
    date: "Fri 7/18",
    venue: "梅赛德斯奔驰文化中心",
    distance: "12 km",
    price: "1,280",
    remaining: "35m",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=320&q=80",
    guests: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&q=80&fit=crop&crop=face",
    ],
  },
  {
    id: 2,
    title: "EDC China 2025",
    date: "this Friday",
    venue: "鸟巢国家体育场",
    distance: "21 km",
    price: "3,100",
    remaining: "1d",
    image: "https://image.electricdaisycarnival.cn/sites/7/2024/12/edccn_2025_mk_an_fest_site_mh_1534x1360_r01.jpg",
    logo: "EDC\nChina 2025",
    guests: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&fit=crop&crop=face",
    ],
  },
];

export const activityPosts: ActivityPost[] = [
  {
    id: "zara",
    name: "Zara",
    handle: "@zara_edm",
    event: "Tomorrowland China",
    location: "上海",
    body: "7月18日上海场，求组队！有同城的小伙伴吗？可以一起拼住宿，已有2人，还差1个女生～",
    time: "1分钟前",
    likes: 47,
    avatar: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=120&q=80&fit=crop&crop=face",
    status: "招募中",
  },
  {
    id: "kyle",
    name: "Kyle",
    handle: "@kyle_beats",
    event: "EDC China 2025",
    location: "北京",
    body: "北京站组队，3男1女，求最后一个小哥哥！已拼好套票+酒店，出发日期7月25日北京。",
    time: "32分钟前",
    likes: 31,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80&fit=crop&crop=face",
    status: "招募中",
  },
  {
    id: "max",
    name: "Max",
    handle: "@max_underground",
    event: "Boiler Room Shanghai",
    location: "上海",
    body: "周末场已成团，还可以一起现场集合，想认识同频朋友的可以来。",
    time: "2小时前",
    likes: 18,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&q=80&fit=crop&crop=face",
    status: "已成团",
  },
];
