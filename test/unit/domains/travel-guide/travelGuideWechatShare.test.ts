import { describe, expect, it } from 'vitest';
import {
  buildTravelGuideSharePath,
  buildTravelGuideShareTitle,
  parseTravelGuideFormFromShareQuery,
} from '@/domains/travel-guide/utils/travelGuideWechatShare.util';
import type { TravelGuidePlan } from '@/types/travelGuide';

function mockPlan(overrides: Partial<TravelGuidePlan> = {}): TravelGuidePlan {
  return {
    activityName: 'EDC Thailand 2026',
    venue: 'Rhythm Park',
    eventDates: '12/18-20',
    departure: '上海',
    headcount: 2,
    budgetLabel: '舒适',
    accommodationNights: 2,
    selfDrive: false,
    transport: { title: '交通', lines: [] },
    accommodation: { title: '住宿', hotels: [] },
    nightlife: { title: '散场', spots: [] },
    tips: { title: '提示', items: [] },
    budget: {
      title: '预算',
      items: [{ label: '合计参考', range: '约 ¥8000–12000' }],
    },
    ...overrides,
  };
}

describe('travelGuideWechatShare', () => {
  it('builds share title with budget total', () => {
    expect(buildTravelGuideShareTitle(mockPlan())).toBe(
      'EDC Thailand 2026 · 出行攻略（约 ¥8000–12000（合计，约 ¥4000–6000/人））',
    );
  });

  it('builds share path with guide params for cross-device open', () => {
    const path = buildTravelGuideSharePath('guide-1', {
      activityLegacyId: 5,
      form: {
        departure: '上海',
        headcount: 2,
        budgetTier: 'standard',
        accommodationNights: 2,
        selfDrive: false,
      },
    });
    expect(path).toContain('guideId=guide-1');
    expect(path).toContain('activityLegacyId=5');
    expect(path).toContain('departure=%E4%B8%8A%E6%B5%B7');
  });

  it('parses share query back into generation form', () => {
    const parsed = parseTravelGuideFormFromShareQuery({
      activityLegacyId: '5',
      departure: '上海',
      headcount: '2',
      budgetTier: 'standard',
      accommodationNights: '2',
      selfDrive: '0',
    });
    expect(parsed?.activityLegacyId).toBe(5);
    expect(parsed?.form.departure).toBe('上海');
  });

  it('buildTravelGuideShareQueryKey is stable for identical params', async () => {
    const { buildTravelGuideShareQueryKey } =
      await import('@/domains/travel-guide/utils/travelGuideWechatShare.util');
    const params = {
      guideId: 'g1',
      activityLegacyId: '5',
      departure: '上海',
      headcount: '2',
    };
    expect(buildTravelGuideShareQueryKey(params)).toBe(
      buildTravelGuideShareQueryKey(params),
    );
  });

  it('parses share query without budgetTier defaulting to standard', () => {
    const parsed = parseTravelGuideFormFromShareQuery({
      activityLegacyId: '5',
      departure: '上海',
      headcount: '2',
      accommodationNights: '2',
      selfDrive: '0',
    });
    expect(parsed?.form.departure).toBe('上海');
    expect(parsed?.form.budgetTier).toBe('standard');
  });

  it('omits budgetTier from share path when not selected', () => {
    const path = buildTravelGuideSharePath('guide-1', {
      activityLegacyId: 5,
      form: {
        departure: '上海',
        headcount: 2,
        accommodationNights: 2,
        selfDrive: false,
      },
    });
    expect(path).not.toContain('budgetTier=');
  });
});
