import { describe, expect, it } from 'vitest';
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
    expect(message.path).toContain('activityLegacyId=8');
  });
});
