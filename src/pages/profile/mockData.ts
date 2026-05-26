export type ProfileActivityItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  price: number;
  image: string;
  status: "registered";
};

export type ProfilePostItem = {
  id: string;
  title: string;
  content: string;
  status: "招募中" | "已成团";
  likes: number;
  comments: number;
  date: string;
};

export const profileUser = {
  name: "Zara Chen",
  handle: "@zara",
  location: "上海",
  bio: "电音爱好者",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  stats: {
    events: 12,
    pinSuccess: 8,
    likes: 156,
    posts: 4,
  },
};

export const profileActivities: ProfileActivityItem[] = [
  {
    id: "act-1",
    title: "Tomorrowland China",
    date: "2025.07.18-19",
    location: "苏州市阳澄湖",
    price: 580,
    image: "https://images.unsplash.com/photo-1470229722913-7c090be5c520?w=200&q=80",
    status: "registered",
  },
  {
    id: "act-2",
    title: "EDC China 2025",
    date: "2025.07.12-13",
    location: "苏州 · 阳澄湖",
    price: 888,
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&q=80",
    status: "registered",
  },
  {
    id: "act-3",
    title: "S2O 三亚水上电音",
    date: "2025.06.28-29",
    location: "三亚海棠湾",
    price: 680,
    image: "https://images.unsplash.com/photo-1540039155732-d674d4e3f421?w=200&q=80",
    status: "registered",
  },
  {
    id: "act-4",
    title: "Ultra Shanghai",
    date: "2025.08.01-03",
    location: "上海世博公园",
    price: 1280,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80",
    status: "registered",
  },
];

export const profilePosts: ProfilePostItem[] = [
  {
    id: "post-1",
    title: "Tomorrowland China",
    content:
      "7月18日上海场，求组队！有同城的小伙伴吗？可以一起拼住宿，已有2人，还差1个女生～",
    status: "招募中",
    likes: 24,
    comments: 8,
    date: "2025-06-20",
  },
  {
    id: "post-2",
    title: "S2O 水上电音节",
    content: "成都S2O！求2个一起来的朋友，泼水节那天超爽！票我已经买好了，寻找同伴～",
    status: "已成团",
    likes: 12,
    comments: 4,
    date: "2025-05-15",
  },
  {
    id: "post-3",
    title: "EDC China 2025",
    content: "北京站组队，3男1女，求最后一个小哥哥！已拼好套票+酒店，出发日期7月25日。",
    status: "招募中",
    likes: 31,
    comments: 6,
    date: "2025-04-28",
  },
  {
    id: "post-4",
    title: "Boiler Room Shanghai",
    content: "周末场已成团，还可以一起现场集合，想认识同频朋友的可以来。",
    status: "已成团",
    likes: 18,
    comments: 3,
    date: "2025-03-10",
  },
];
