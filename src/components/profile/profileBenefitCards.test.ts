import { describe, expect, it } from 'vitest';
import {
  buildActivityByLegacyIdMap,
  pickRecentActivityBenefitCards,
} from './profileBenefitCards';
import type { ProfileEventBenefitCardModel } from './profileBenefitsMapper';

function card(legacyId: number): ProfileEventBenefitCardModel {
  return {
    activityLegacyId: legacyId,
    eventTitle: `活动 ${legacyId}`,
    eventMeta: '',
    eventImage: '',
    tierId: 'pro',
    tierName: 'Pro',
    validUntilLabel: '',
    rows: [],
  };
}

describe('pickRecentActivityBenefitCards', () => {
  it('returns cards for the nearest upcoming activity only', () => {
    const activities = buildActivityByLegacyIdMap([
      {
        id: '4',
        title: '风暴电音节',
        date: '06/13-14',
        location: '深圳',
        image: '',
        status: 'registered',
      },
      {
        id: '5',
        title: 'EDC Thailand 2026',
        date: '12/18-20',
        location: '普吉岛',
        image: '',
        status: 'registered',
      },
    ]);
    const all = [card(4), card(5)];
    const recent = pickRecentActivityBenefitCards(all, activities);
    expect(recent).toHaveLength(1);
    expect(recent[0]?.activityLegacyId).toBe(4);
  });
});
