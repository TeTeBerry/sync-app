import { describe, expect, it } from 'vitest';
import { filterActivitiesForPicker } from '@/utils/filterActivitiesForPicker';
import type { BackendActivity } from '@/types/backend';

function activity(
  partial: Partial<BackendActivity> & Pick<BackendActivity, 'legacyId' | 'name'>,
): BackendActivity {
  return {
    _id: String(partial.legacyId),
    code: partial.code ?? String(partial.legacyId),
    ...partial,
  };
}

describe('filterActivitiesForPicker', () => {
  const activities = [
    activity({ legacyId: 1, name: '风暴电音节', date: '12/31-01/01', code: 'storm' }),
    activity({
      legacyId: 2,
      name: 'EDC Thailand',
      date: '12/18-20',
      code: 'edc-thailand',
    }),
    activity({
      legacyId: 3,
      name: '已结束活动',
      date: '01/01-01/02',
      code: 'ended',
    }),
  ];

  it('excludes ended activities and sorts upcoming', () => {
    const result = filterActivitiesForPicker(activities, '');
    expect(result.map((item) => item.legacyId)).not.toContain(3);
    expect(result.length).toBe(2);
  });

  it('filters by name or code', () => {
    expect(
      filterActivitiesForPicker(activities, 'edc').map((item) => item.legacyId),
    ).toEqual([2]);
    expect(
      filterActivitiesForPicker(activities, '风暴').map((item) => item.legacyId),
    ).toEqual([1]);
  });
});
