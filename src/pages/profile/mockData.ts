import type { ProfileActivityItem, ProfilePostItem } from "../../types/backend";
import { buildMockProfileBenefits } from "./profileBenefitsMapper";

export type { ProfileActivityItem, ProfilePostItem };

export type ProfileBenefitMetricKind = "match" | "contact" | "duration";

export type ProfileBenefitMetric = {
  id: string;
  kind: ProfileBenefitMetricKind;
  value: number;
  unit: string;
  label: string;
  /** Remaining quota ratio (0–1), drives progress bar fill. */
  remainingRatio: number;
  lowRemaining: boolean;
};

export type ProfileBenefits = {
  planLabel: string;
  upgradeLabel: string;
  promo: {
    prefix: string;
    highlight: string;
    suffix: string;
  };
  metrics: ProfileBenefitMetric[];
};

/** 我的权益 — mock 用户 Zara 展示 Pro 单场额度（风暴电音节 activity 4，含每月免费额度） */
export const profileBenefits = buildMockProfileBenefits();

export const profileUser = {
  name: "Zara Chen",
  handle: "@zara",
  location: "上海",
  bio: "电音爱好者",
  avatar: "https://picsum.photos/seed/sync-avatar-zara/200/200",
  verified: true,
  stats: {
    events: 4,
    matchSuccess: 1,
    likes: 49,
    posts: 7,
  },
};

export const profileActivities: ProfileActivityItem[] = [
  {
    id: "1",
    title: "Tomorrowland Thailand 2026",
    date: "2026-12-12",
    location: "芭提雅",
    image:
      "https://mma.prnewswire.com/media/2921955/Tomorrowland_Thailand_PR_Newswire.jpg",
    status: "registered",
  },
  {
    id: "4",
    title: "风暴电音节 深圳站",
    date: "2026-06-13",
    location: "深圳国际会展中心",
    image:
      "https://img.alicdn.com/imgextra/i2/2251059038/O1CN011VWlmX2GdSmiFVt13_!!2251059038.jpg",
    status: "registered",
  },
  {
    id: "6",
    title: "2026横琴VAC电音节",
    date: "2026-04-18",
    location: "珠海",
    image: "https://picsum.photos/seed/sync-act-6/144/144",
    status: "registered",
  },
  {
    id: "2",
    title: "Ultra Miami 2026",
    date: "2025-03-28",
    location: "迈阿密",
    image: "https://picsum.photos/seed/sync-act-2/144/144",
    status: "attended",
  },
];

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
    activityLegacyId: 1,
    contentTypes: ["accommodation"],
  },
  {
    id: "post-3",
    title: "风暴电音节 深圳站",
    content: "6月深圳 STORM 室内场，3男1女，求最后一个小哥哥！",
    status: "招募中",
    likes: 31,
    comments: 6,
    date: "2026-05-18",
    activityLegacyId: 4,
    contentTypes: ["team"],
  },
  {
    id: "post-4",
    title: "2026横琴VAC电音节",
    content: "4月横琴 VAC 已组队，还可以一起现场集合，想认识同频朋友的可以来。",
    status: "已组队",
    likes: 18,
    comments: 3,
    date: "2026-04-20",
    activityLegacyId: 6,
  },
];
