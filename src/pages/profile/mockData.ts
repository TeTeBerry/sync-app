import type { ProfileActivityItem } from "../../types/backend";

export type { ProfileActivityItem };

export type ProfilePostItem = {
  id: string;
  title: string;
  content: string;
  status: "招募中" | "已组队";
  likes: number;
  comments: number;
  date: string;
};

export const profileUser = {
  name: "Zara Chen",
  handle: "@zara",
  location: "上海",
  bio: "电音爱好者",
  avatar:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  stats: {
    events: 12,
    matchSuccess: 8,
    likes: 156,
    posts: 3,
  },
};

export const profilePosts: ProfilePostItem[] = [
  {
    id: "post-1",
    title: "Tomorrowland Thailand 2026",
    content:
      "12月芭提雅场求组队！想拼 Wisdom Valley 附近酒店，已有2人，还差1个女生～",
    status: "招募中",
    likes: 24,
    comments: 8,
    date: "2026-05-20",
  },
  {
    id: "post-3",
    title: "风暴电音节 深圳站",
    content: "6月深圳 STORM 室内场，3男1女，求最后一个小哥哥！",
    status: "招募中",
    likes: 31,
    comments: 6,
    date: "2026-05-18",
  },
  {
    id: "post-4",
    title: "2026横琴VAC电音节",
    content: "4月横琴 VAC 已组队，还可以一起现场集合，想认识同频朋友的可以来。",
    status: "已组队",
    likes: 18,
    comments: 3,
    date: "2026-04-20",
  },
];
