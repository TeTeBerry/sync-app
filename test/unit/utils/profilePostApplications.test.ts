import { describe, expect, it } from 'vitest';
import { patchProfilePostAfterAcceptApplication } from '@/utils/profilePostApplications';
import type { ProfilePostItem } from '@/types/backend';

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
