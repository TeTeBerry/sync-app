import { describe, expect, it, vi } from 'vitest';

vi.mock('@/i18n', () => ({
  t: vi.fn((key: string, params?: Record<string, string>) => {
    if (key === 'setVote.shareTitle' && params?.activityName) {
      return `${params.activityName} · 我投了这 3 场 Set，你呢？`;
    }
    return key;
  }),
}));

vi.mock('@/utils/plurShareImage.util', () => ({
  buildPlurPeaceShareImageUrl: () => 'peace-share-cover',
}));

vi.mock('@/utils/route', () => ({
  ROUTES: {
    ACTIVITY_LINEUP: '/packageEvent/pages/activity-lineup/index',
  },
}));

import {
  buildSetVoteShareAppMessage,
  buildSetVoteSharePath,
  parseSetVoteShareQuery,
} from '@/domains/set-vote/utils/setVoteWechatShare.util';

describe('setVoteWechatShare.util', () => {
  it('builds and parses share path with voter picks', () => {
    const path = buildSetVoteSharePath({
      activityLegacyId: 4,
      voterPicks: ['dj-snake', 'martin-garrix'],
    });
    expect(path).toContain('share=1');
    expect(path).toContain('activityLegacyId=4');
    expect(path).toContain('voterPicks=');

    const query = Object.fromEntries(new URLSearchParams(path.split('?')[1] ?? ''));
    const parsed = parseSetVoteShareQuery(query);
    expect(parsed).toEqual({
      activityLegacyId: 4,
      voterPicks: ['dj-snake', 'martin-garrix'],
    });
  });

  it('returns null for invalid share query', () => {
    expect(parseSetVoteShareQuery({ share: '1' })).toBeNull();
    expect(parseSetVoteShareQuery({ share: '0', activityLegacyId: '4' })).toBeNull();
  });

  it('builds share app message title from activity name', () => {
    const message = buildSetVoteShareAppMessage({
      activityName: 'EDC Korea',
      activityLegacyId: 8,
      voterPicks: ['dj-snake'],
    });
    expect(message.title).toContain('EDC Korea');
    expect(message.title).toContain('你呢');
    expect(message.path).toContain('activityLegacyId=8');
    expect(message.imageUrl).toBeTruthy();
  });
});
