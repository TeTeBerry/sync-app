import { describe, expect, it } from 'vitest';
import { AI_TRAVEL_GUIDE_DISCLAIMER } from '@/constants/aiDisclosure';
import { buildTravelGuideShareText } from '@/domains/travel-guide/utils/travelGuideShareText';
import type { TravelGuidePlan } from '@/types/travelGuide';

function mockPlan(): TravelGuidePlan {
  return {
    activityName: 'EDC Thailand 2026',
    venue: 'Rhythm Park',
    eventDates: '12/18-20',
    departure: '上海',
    headcount: 2,
    budgetLabel: '舒适',
    accommodationNights: 2,
    selfDrive: false,
    transport: { title: '交通', lines: ['高铁约 5h'] },
    accommodation: { title: '住宿', hotels: [] },
    nightlife: { title: '散场', spots: [] },
    tips: { title: '提示', items: [] },
  };
}

describe('buildTravelGuideShareText', () => {
  it('appends AI travel guide disclaimer at the end', () => {
    const text = buildTravelGuideShareText(mockPlan());
    expect(text).toContain(AI_TRAVEL_GUIDE_DISCLAIMER);
    expect(text.endsWith(AI_TRAVEL_GUIDE_DISCLAIMER)).toBe(true);
  });
});
