import type { AppNotification } from '../../types/backend';

/** Demo: post owner receives a like notification (mock / no API). */
export const mockNotifications: AppNotification[] = [
  {
    id: 'mock-notif-like-1',
    userId: 'demo-user',
    type: 'interaction',
    title: '有人赞了你的帖子',
    body: 'Luna 赞了你的帖子「风暴电音节 深圳站」',
    read: false,
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    meta: {
      category: 'like',
      type: 'like',
      activityLegacyId: 4,
      postId: 'post-3',
      actorUserId: 'demo-luna',
      actorUserName: 'Luna',
      templateKey: 'like',
      templateParams: { actor: 'Luna' },
    },
  },
];
