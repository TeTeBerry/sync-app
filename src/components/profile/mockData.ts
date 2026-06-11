import type { ProfileActivityItem, ProfilePostItem } from '../../types/backend';

export type { ProfileActivityItem, ProfilePostItem };

export const profileUser = {
  name: 'Zara Chen',
  handle: '@zara',
  location: '上海',
  bio: '电音爱好者',
  avatar: 'https://picsum.photos/seed/sync-avatar-zara/200/200',
  verified: true,
  stats: {
    events: 4,
    likes: 73,
    posts: 7,
  },
};

export const profileActivities: ProfileActivityItem[] = [
  {
    id: '4',
    title: '风暴电音节 深圳站',
    date: '06/13',
    location: '深圳',
    image: 'https://picsum.photos/seed/storm-sz/400/300',
    status: 'registered',
  },
  {
    id: '2',
    title: 'Ultra 上海',
    date: '05/02',
    location: '上海',
    image: 'https://picsum.photos/seed/ultra-sh/400/300',
    status: 'attended',
  },
];

export const profilePosts: ProfilePostItem[] = [
  {
    id: 'post-zara-1',
    title: '风暴电音节 深圳站',
    content: '深圳站求组队，拼房+同行～',
    activityLegacyId: 4,
    likes: 12,
    comments: 3,
    date: '05/20',
  },
];
