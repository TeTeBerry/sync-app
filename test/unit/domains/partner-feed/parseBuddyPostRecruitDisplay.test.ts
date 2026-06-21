import { describe, expect, it } from 'vitest';
import { parseBuddyPostRecruitDisplay } from '@/domains/partner-feed/utils/parseBuddyPostRecruitDisplay';

describe('parseBuddyPostRecruitDisplay', () => {
  it('parses filled/total fraction', () => {
    expect(parseBuddyPostRecruitDisplay('上海出发，2/3，差1人')).toEqual({
      recruitStatus: 'open',
      slotsFilled: 2,
      slotsTotal: 3,
    });
  });

  it('parses range headcount as total slots', () => {
    expect(parseBuddyPostRecruitDisplay('组队，6.13-6.14，深圳，2-3人')).toEqual({
      recruitStatus: 'open',
      slotsTotal: 3,
    });
  });

  it('parses simple headcount', () => {
    expect(parseBuddyPostRecruitDisplay('组队，6.13-6.14，集合点，2人')).toEqual({
      recruitStatus: 'open',
      slotsTotal: 2,
    });
  });

  it('detects full status from keywords', () => {
    expect(parseBuddyPostRecruitDisplay('组队，已满，2人')).toEqual({
      recruitStatus: 'full',
      slotsTotal: 2,
    });
  });

  it('returns open status when body is empty', () => {
    expect(parseBuddyPostRecruitDisplay('')).toEqual({ recruitStatus: 'open' });
    expect(parseBuddyPostRecruitDisplay(undefined)).toEqual({ recruitStatus: 'open' });
  });
});
