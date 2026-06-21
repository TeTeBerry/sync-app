import { describe, expect, it } from 'vitest';
import { resolveHomeFindTeamActivityId } from '@/pages/index/utils/resolveHomeActivityId';

describe('resolveHomeFindTeamActivityId', () => {
  it('prefers active bound activity', () => {
    expect(
      resolveHomeFindTeamActivityId({
        activeActivityLegacyId: 1,
        nextSelectedEventId: 2,
        featuredLegacyId: 3,
      }),
    ).toBe(1);
  });

  it('falls back to next selected event when no active binding', () => {
    expect(
      resolveHomeFindTeamActivityId({
        activeActivityLegacyId: null,
        nextSelectedEventId: 2,
        featuredLegacyId: 3,
      }),
    ).toBe(2);
  });

  it('falls back to featured event when no signup event', () => {
    expect(
      resolveHomeFindTeamActivityId({
        activeActivityLegacyId: undefined,
        nextSelectedEventId: undefined,
        featuredLegacyId: 3,
      }),
    ).toBe(3);
  });

  it('returns undefined when no activity context exists', () => {
    expect(
      resolveHomeFindTeamActivityId({
        activeActivityLegacyId: undefined,
        nextSelectedEventId: undefined,
        featuredLegacyId: undefined,
      }),
    ).toBeUndefined();
  });

  it('ignores NaN values', () => {
    expect(
      resolveHomeFindTeamActivityId({
        activeActivityLegacyId: Number.NaN,
        nextSelectedEventId: Number.NaN,
        featuredLegacyId: 5,
      }),
    ).toBe(5);
  });
});
