import { beforeEach, describe, expect, it } from 'vitest';
import { getCacheKey, setCacheDataByKey } from '@/hooks/useApiQuery';
import type { BackendActivity } from '@/types/backend';
import {
  resolveLineupPublished,
  shouldShowLineupSubscribeBanner,
} from '@/domains/activity-info/utils/resolveLineupPublished';

function activity(
  partial: Partial<BackendActivity> & Pick<BackendActivity, 'legacyId'>,
): BackendActivity {
  return {
    _id: String(partial.legacyId),
    code: String(partial.legacyId),
    name: partial.name ?? 'Test Fest',
    ...partial,
  };
}

describe('resolveLineupPublished', () => {
  beforeEach(() => {
    setCacheDataByKey(getCacheKey(['activities']), []);
  });

  it('returns explicit detail flags without catalog lookup', () => {
    expect(
      resolveLineupPublished(activity({ legacyId: 8, lineupPublished: true })),
    ).toBe(true);
    expect(
      resolveLineupPublished(activity({ legacyId: 8, lineupPublished: false })),
    ).toBe(false);
  });

  it('falls back to catalog list when detail cache omitted lineupPublished', () => {
    setCacheDataByKey(getCacheKey(['activities']), [
      activity({ legacyId: 8, lineupPublished: true, name: 'EDC Korea 2026' }),
    ]);

    expect(
      resolveLineupPublished(activity({ legacyId: 8, name: 'EDC Korea 2026' }), 8),
    ).toBe(true);
  });

  it('shows subscribe banner only when lineup is explicitly pending', () => {
    expect(
      shouldShowLineupSubscribeBanner(
        activity({ legacyId: 8, lineupPublished: true }),
        8,
      ),
    ).toBe(false);

    expect(
      shouldShowLineupSubscribeBanner(
        activity({ legacyId: 8, lineupPublished: false }),
        8,
      ),
    ).toBe(true);

    setCacheDataByKey(getCacheKey(['activities']), [
      activity({ legacyId: 8, lineupPublished: true }),
    ]);
    expect(shouldShowLineupSubscribeBanner(activity({ legacyId: 8 }), 8)).toBe(false);
  });
});
