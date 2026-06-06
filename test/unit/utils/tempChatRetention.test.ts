import { describe, expect, it } from 'vitest';
import type { TempChatSession } from '@/types/tempChat';
import {
  filterActiveTempChatSessions,
  getTempChatDestroysAt,
  parseActivityEndDate,
  TEMP_CHAT_RETENTION_DAYS_AFTER_EVENT,
} from '@/utils/tempChatRetention';

describe('tempChatRetention', () => {
  it('parses slash range festival dates', () => {
    const end = parseActivityEndDate('06/13-14', 2026);
    expect(end).not.toBeNull();
    expect(end?.getFullYear()).toBe(2026);
    expect(end?.getMonth()).toBe(5);
    expect(end?.getDate()).toBe(14);
  });

  it('destroysAt is retention days after event end', () => {
    const end = parseActivityEndDate('06/13-14', 2026);
    expect(end).not.toBeNull();
    const destroysAt = getTempChatDestroysAt(end!);
    expect(destroysAt.getDate()).toBe(14 + TEMP_CHAT_RETENTION_DAYS_AFTER_EVENT);
    expect(destroysAt.getMonth()).toBe(5);
  });

  it('filters sessions past destroysAt from list', () => {
    const past: TempChatSession = {
      id: 'chat__p__u',
      applicantUserId: 'u',
      peerUserId: 'u',
      peerName: 'A',
      postId: 'p',
      postTitle: 'T',
      buddyInfo: { body: 'b', tags: [] },
      lastMessage: 'hi',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      applicationStatus: 'pending',
      postRecruitmentStatus: '招募中',
      destroysAt: new Date(Date.now() - 60_000).toISOString(),
    };
    const future: TempChatSession = {
      ...past,
      id: 'chat__p2__u2',
      destroysAt: new Date(Date.now() + 86_400_000).toISOString(),
    };
    expect(filterActiveTempChatSessions([past, future])).toEqual([future]);
  });
});
