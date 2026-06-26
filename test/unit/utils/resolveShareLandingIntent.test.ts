import { describe, expect, it, vi } from 'vitest';

vi.mock('@/domains/personality-test/utils/personalityWechatShare.util', () => ({
  parsePersonalityTestShareQuery: (params: Record<string, string | undefined>) => {
    if (params.share !== '1' || params.primaryType !== 'rager') {
      return null;
    }
    return { primaryType: 'rager' };
  },
}));

vi.mock('@/domains/set-vote/utils/setVoteWechatShare.util', () => ({
  parseSetVoteShareQuery: (params: Record<string, string | undefined>) => {
    if (params.share !== '1' || !params.activityLegacyId || !params.voterPicks) {
      return null;
    }
    return { activityLegacyId: Number(params.activityLegacyId), voterPicks: ['dj-1'] };
  },
}));

import { shouldBypassFirstRunOverlays } from '@/utils/resolveShareLandingIntent';

describe('shouldBypassFirstRunOverlays', () => {
  it('returns true for share=1', () => {
    expect(shouldBypassFirstRunOverlays({ share: '1' })).toBe(true);
  });

  it('returns true for personality share query', () => {
    expect(
      shouldBypassFirstRunOverlays({
        share: '1',
        primaryType: 'rager',
      }),
    ).toBe(true);
  });

  it('returns true for set vote share query', () => {
    expect(
      shouldBypassFirstRunOverlays({
        share: '1',
        activityLegacyId: '42',
        voterPicks: 'dj-1',
        voteMode: '1',
      }),
    ).toBe(true);
  });

  it('returns true for recruit deep links', () => {
    expect(shouldBypassFirstRunOverlays({ focusPosts: '1' })).toBe(true);
    expect(shouldBypassFirstRunOverlays({ openBuddyPost: '1' })).toBe(true);
  });

  it('returns true for event detail deep link', () => {
    expect(shouldBypassFirstRunOverlays({ activityLegacyId: '99' })).toBe(true);
    expect(shouldBypassFirstRunOverlays({ id: '99' })).toBe(true);
  });

  it('returns false for plain home entry', () => {
    expect(shouldBypassFirstRunOverlays({})).toBe(false);
  });
});
