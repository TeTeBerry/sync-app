import { describe, expect, it } from 'vitest';
import {
  computeAiTravelGuideFooterChromePx,
  resolveTravelGuideShareRef,
  shouldLoadTravelGuideDetail,
} from '@/domains/travel-guide/hooks/aiTravelGuidePage.util';
import type { TravelGuideDetailPayload } from '@/domains/travel-guide/utils/travelGuideDetailStorage';

const payload: TravelGuideDetailPayload = {
  plan: {
    activityName: 'EDC',
    venue: 'Pattaya',
    eventDates: '12/18',
    departure: '上海',
    headcount: 2,
    budgetLabel: '舒适',
    accommodationNights: 2,
    selfDrive: false,
    transport: { title: '交通', lines: [] },
    accommodation: { title: '住宿', hotels: [] },
    nightlife: { title: '散场', spots: [] },
    tips: { title: '提示', items: [] },
  },
  form: {
    departure: '上海',
    headcount: 2,
    budgetTier: 'standard',
    accommodationNights: 2,
    selfDrive: false,
  },
  activityLegacyId: 4,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('aiTravelGuidePage.util', () => {
  it('adds safe-area inset to footer chrome height', () => {
    expect(
      computeAiTravelGuideFooterChromePx({
        screenHeight: 800,
        windowHeight: 780,
        safeArea: { bottom: 760 },
      }),
    ).toBe(112);
  });

  it('falls back to footer base when safe area is missing', () => {
    expect(
      computeAiTravelGuideFooterChromePx({
        screenHeight: 800,
        windowHeight: 780,
        safeArea: null,
      }),
    ).toBe(72);
  });

  it('loads remote detail when local payload is absent and guide id exists', () => {
    expect(
      shouldLoadTravelGuideDetail({
        payload: null,
        guideId: 'guide-1',
      }),
    ).toBe(true);
    expect(
      shouldLoadTravelGuideDetail({
        payload,
        guideId: 'guide-1',
      }),
    ).toBe(false);
  });

  it('builds share ref only when guide id and payload exist', () => {
    expect(resolveTravelGuideShareRef({ guideId: 'guide-1', payload })).toEqual({
      guideId: 'guide-1',
      payload,
    });
    expect(resolveTravelGuideShareRef({ guideId: '', payload })).toBeNull();
  });
});
