import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTempChatStore } from './tempChatStore';

vi.mock('@tarojs/taro', () => ({
  default: {
    getStorageSync: vi.fn(() => ({})),
    setStorageSync: vi.fn(),
  },
}));

describe('tempChatStore', () => {
  beforeEach(() => {
    useTempChatStore.setState({
      sessions: [],
      messages: [],
      hydrated: true,
    });
  });

  it('creates session with applicant first message on the left', () => {
    const sessionId = useTempChatStore.getState().openSessionFromApplication({
      postId: 'post-3',
      postTitle: 'Storm',
      applicantUserId: 'demo-luna',
      peerUserId: 'demo-luna',
      peerName: 'Luna',
      applicationMessage: '我也从广州出发',
      buddyInfo: { body: '组队信息', tags: ['#组队'] },
      applicationStatus: 'pending',
      postRecruitmentStatus: '招募中',
      activityLegacyId: 4,
    });

    const messages = useTempChatStore.getState().listMessages(sessionId);
    expect(messages).toHaveLength(1);
    expect(messages[0]?.role).toBe('peer');
    expect(messages[0]?.body).toBe('我也从广州出发');
  });
});
