import type { ProfileActivityItem, ProfilePostItem } from '../../types/backend';
import { buildMockProfileBenefits } from './profileBenefitsMock';

export type { ProfileActivityItem, ProfilePostItem };
export type {
  ProfileBenefitMetric,
  ProfileBenefitMetricKind,
  ProfileBenefits,
} from './profileBenefitsTypes';

/** 我的权益 — mock 用户 Zara 展示 Pro 单场额度（风暴电音节 activity 4，含每月免费额度） */
export const profileBenefits = buildMockProfileBenefits();

export const profileUser = {
  name: 'Zara Chen',
  handle: '@zara',
  location: '上海',
  bio: '电音爱好者',
  avatar: 'https://picsum.photos/seed/sync-avatar-zara/200/200',
  verified: true,
  stats: {
    events: 4,
    matchSuccess: 1,
    likes: 73,
    posts: 7,
  },
};

export const profileActivities: ProfileActivityItem[] = [
  {
    id: '1',
    title: 'Tomorrowland Thailand 2026',
    date: '2026-12-12',
    location: '芭提雅',
    image:
      'https://mma.prnewswire.com/media/2921955/Tomorrowland_Thailand_PR_Newswire.jpg',
    status: 'registered',
  },
  {
    id: '4',
    title: '风暴电音节 深圳站',
    date: '2026-06-13',
    location: '深圳国际会展中心',
    image:
      'https://img.alicdn.com/imgextra/i2/2251059038/O1CN011VWlmX2GdSmiFVt13_!!2251059038.jpg',
    status: 'registered',
  },
  {
    id: '5',
    title: 'EDC Thailand 2026',
    date: '2026-12-18',
    location: '普吉岛 Rhythm Park',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
    status: 'registered',
  },
];

export const profilePosts: ProfilePostItem[] = [
  {
    id: 'post-1',
    title: 'Tomorrowland Thailand 2026',
    content: '12月芭提雅场求组队！想拼 Wisdom Valley 附近酒店，已有2人，还差1个女生～',
    status: '招募中',
    likes: 24,
    comments: 8,
    date: '2026-05-20',
    activityLegacyId: 1,
    contentTypes: ['accommodation'],
  },
  {
    id: 'post-3',
    title: '风暴电音节 深圳站',
    content: '6月深圳 STORM 室内场，3男1女，求最后一个小哥哥！',
    status: '招募中',
    likes: 31,
    comments: 6,
    date: '2026-05-18',
    activityLegacyId: 4,
    contentTypes: ['team'],
    pendingApplicationCount: 2,
    applications: [
      {
        id: 'mock-apply-1',
        userId: 'demo-luna',
        name: 'Luna',
        avatar: 'https://picsum.photos/seed/sync-avatar-luna/200/200',
        message: '我也从广州出发，可以一起走～',
        status: 'pending',
        appliedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-apply-2',
        userId: 'demo-ryan',
        name: 'Ryan',
        avatar: 'https://picsum.photos/seed/sync-avatar-ryan/200/200',
        message: '深圳本地，可以一起同路进场',
        status: 'pending',
        appliedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];
