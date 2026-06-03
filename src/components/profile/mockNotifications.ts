import type { AppNotification } from '../../types/backend';

/** Demo: post owner receives a team apply notification (mock / no API). */
export const mockNotifications: AppNotification[] = [
  {
    id: 'mock-notif-apply-1',
    userId: 'demo-user',
    type: 'interaction',
    title: '有人申请加入你的组队',
    body: 'Luna 申请加入你的组队帖「风暴电音节 深圳站」',
    read: false,
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    meta: {
      category: 'application',
      type: 'application',
      activityLegacyId: 4,
      postId: 'post-3',
      actorUserId: 'demo-luna',
      actorUserName: 'Luna',
      templateKey: 'application',
      templateParams: { actor: 'Luna' },
    },
  },
];
