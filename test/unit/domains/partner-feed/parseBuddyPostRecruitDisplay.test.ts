import { describe, expect, it } from 'vitest';
import {
  parseBuddyPostRecruitDisplay,
  resolveBuddyPostRecruitDisplay,
} from '@/domains/partner-feed/utils/parseBuddyPostRecruitDisplay';

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

  it('resolveBuddyPostRecruitDisplay prefers structured post fields', () => {
    expect(
      resolveBuddyPostRecruitDisplay({
        body: '组队，2人',
        recruitStatus: 'full',
        slotsTotal: 4,
        slotsFilled: 4,
      }),
    ).toEqual({
      recruitStatus: 'full',
      slotsTotal: 4,
      slotsFilled: 4,
    });
  });

  it('resolveBuddyPostRecruitDisplay falls back to body when fields missing', () => {
    expect(
      resolveBuddyPostRecruitDisplay({
        body: '组队，1/3',
      }),
    ).toEqual({
      recruitStatus: 'open',
      slotsFilled: 1,
      slotsTotal: 3,
    });
  });
});
