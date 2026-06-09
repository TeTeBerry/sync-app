import { describe, expect, it } from 'vitest';
import {
  applyOwnerAcceptedSessionsToProfilePosts,
  patchProfilePostAfterAcceptApplication,
} from '@/utils/profilePostApplications';
import type { ProfilePostItem } from '@/types/backend';
import type { TempChatSession } from '@/types/tempChat';

const basePost: ProfilePostItem = {
  id: 'post-3',
  title: 'Storm',
  content: 'content',
  status: '招募中',
  likes: 1,
  comments: 0,
  date: '2026-05-18',
  applications: [
    {
      id: 'a1',
      userId: 'u1',
      name: 'Luna',
      status: 'pending',
      appliedAt: new Date().toISOString(),
    },
    {
      id: 'a2',
      userId: 'u2',
      name: 'Ryan',
      status: 'pending',
      appliedAt: new Date().toISOString(),
    },
  ],
};

describe('patchProfilePostAfterAcceptApplication', () => {
  it('marks post as teamed and accepts one applicant', () => {
    const next = patchProfilePostAfterAcceptApplication([basePost], 'post-3', 'u1')[0];

    expect(next.status).toBe('已组队');
    expect(next.applications?.[0]?.status).toBe('accepted');
    expect(next.applications?.[1]?.status).toBe('pending');
    expect(next.pendingApplicationCount).toBe(1);
  });
});

describe('applyOwnerAcceptedSessionsToProfilePosts', () => {
  const ownerPendingChat: TempChatSession = {
    id: 'chat__post-3__u1',
    postId: 'post-3',
    applicantUserId: 'u1',
    peerUserId: 'u1',
    peerName: 'Luna',
    postTitle: 'Storm',
    buddyInfo: { body: '找组队', tags: ['#组队'] },
    lastMessage: 'hi',
    lastMessageAt: new Date().toISOString(),
    unreadCount: 0,
    applicationStatus: 'pending',
    postRecruitmentStatus: '招募中',
    isOwner: true,
  };

  const ownerAcceptedChat: TempChatSession = {
    ...ownerPendingChat,
    applicationStatus: 'accepted',
    postRecruitmentStatus: '已组队',
  };

  it('does not change posts when owner only opened chat (pending session)', () => {
    const next = applyOwnerAcceptedSessionsToProfilePosts(
      [basePost],
      [ownerPendingChat],
    );
    expect(next[0]?.status).toBe('招募中');
    expect(next[0]?.applications?.[0]?.status).toBe('pending');
  });

  it('updates posts after owner accepted in chat session', () => {
    const next = applyOwnerAcceptedSessionsToProfilePosts(
      [basePost],
      [ownerAcceptedChat],
    )[0];
    expect(next.status).toBe('已组队');
    expect(next.applications?.[0]?.status).toBe('accepted');
  });

  it('ignores applicant-side sessions even if marked accepted locally', () => {
    const applicantSession: TempChatSession = {
      ...ownerAcceptedChat,
      isOwner: false,
      applicantUserId: 'u1',
      peerUserId: 'owner-zara',
    };
    const next = applyOwnerAcceptedSessionsToProfilePosts(
      [basePost],
      [applicantSession],
    );
    expect(next[0]?.status).toBe('招募中');
  });
});
