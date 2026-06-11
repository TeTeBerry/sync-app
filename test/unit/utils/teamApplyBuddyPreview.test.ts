import { describe, expect, it, vi } from 'vitest';
import { resolveUserBuddyPreviewForTargetPost } from '@/utils/teamApplyBuddyPreview';
import type { EventDetailPost, ProfilePostItem } from '@/types/backend';

vi.mock('@/utils/postOwnership', () => ({
  isCurrentUserPostAuthor: (_name: string, userId?: string) => userId === 'me',
}));

describe('resolveUserBuddyPreviewForTargetPost', () => {
  const host: EventDetailPost = {
    id: 'host',
    userId: 'other',
    name: 'Host',
    location: '上海',
    createdAt: '2026-06-01T10:00:00.000Z',
    body: '求同路去场馆',
    tags: ['#同路'],
    contentTypes: ['carpool'],
    likes: 0,
    comments: 0,
    avatar: '',
    status: '招募中',
  };

  const myCarpool: EventDetailPost = {
    id: 'mine-carpool',
    userId: 'me',
    name: 'Me',
    location: '上海',
    createdAt: '2026-06-01T09:00:00.000Z',
    body: '同路同行',
    tags: ['#同路'],
    contentTypes: ['carpool'],
    likes: 0,
    comments: 0,
    avatar: '',
    status: '招募中',
  };

  const myTeam: EventDetailPost = {
    ...myCarpool,
    id: 'mine-team',
    body: '找组队',
    tags: ['#组队'],
    contentTypes: ['team'],
  };

  it('uses the first recruiting post owned by the user in the feed', () => {
    const preview = resolveUserBuddyPreviewForTargetPost(
      host,
      7,
      [host, myTeam, myCarpool],
      [],
    );
    expect(preview?.body).toContain('找组队');
    expect(preview?.tags).toContain('#组队');
  });

  it('includes profile recruiting posts not in the feed', () => {
    const profileOnly: ProfilePostItem = {
      id: 'pp-carpool',
      title: 'Storm',
      content: '虹桥同路',
      status: '招募中',
      likes: 0,
      comments: 0,
      date: '今天',
      activityLegacyId: 7,
      contentTypes: ['carpool'],
    };
    const preview = resolveUserBuddyPreviewForTargetPost(
      host,
      7,
      [host],
      [profileOnly],
    );
    expect(preview?.body).toContain('虹桥');
  });
});
