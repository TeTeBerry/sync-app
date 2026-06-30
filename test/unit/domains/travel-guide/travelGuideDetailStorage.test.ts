import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TravelGuideDetailPayload } from '@/domains/travel-guide/utils/travelGuideDetailStorage';

const storage = new Map<string, unknown>();

vi.mock('@tarojs/taro', () => ({
  default: {
    setStorageSync: vi.fn((key: string, value: unknown) => {
      storage.set(key, value);
    }),
    getStorageSync: vi.fn((key: string) => storage.get(key)),
    getStorageInfoSync: vi.fn(() => ({
      keys: [...storage.keys()],
    })),
  },
}));

function samplePayload(activityLegacyId = 4): TravelGuideDetailPayload {
  return {
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
    activityLegacyId,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('travelGuideDetailStorage', () => {
  beforeEach(async () => {
    storage.clear();
    vi.resetModules();
  });

  it('saves and loads guide payload by guide id', async () => {
    const { saveTravelGuideDetail, loadTravelGuideDetail } =
      await import('@/domains/travel-guide/utils/travelGuideDetailStorage');

    saveTravelGuideDetail('guide-a', samplePayload());
    const loaded = loadTravelGuideDetail('guide-a');

    expect(loaded?.plan.activityName).toBe('EDC');
    expect(loaded?.form.departure).toBe('上海');
  });

  it('decodes encoded departure when loading cached payload', async () => {
    const { loadTravelGuideDetail } =
      await import('@/domains/travel-guide/utils/travelGuideDetailStorage');

    storage.set('sync:travel-guide-detail:guide-encoded', {
      ...samplePayload(),
      plan: {
        ...samplePayload().plan,
        departure: '%E6%85%A7%E6%99%BA%C2%B7%E4%BB%81%E6%81%92',
      },
      form: {
        ...samplePayload().form,
        departure: '%E6%85%A7%E6%99%BA%C2%B7%E4%BB%81%E6%81%92',
      },
    });

    const loaded = loadTravelGuideDetail('guide-encoded');
    expect(loaded?.plan.departure).toBe('慧智·仁恒');
    expect(loaded?.form.departure).toBe('慧智·仁恒');
  });

  it('finds latest guide via activity index without scanning all keys', async () => {
    const { saveTravelGuideDetail, findLatestTravelGuideForActivity } =
      await import('@/domains/travel-guide/utils/travelGuideDetailStorage');

    saveTravelGuideDetail('guide-old', {
      ...samplePayload(),
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    saveTravelGuideDetail('guide-new', {
      ...samplePayload(),
      createdAt: '2026-01-02T00:00:00.000Z',
    });

    const latest = findLatestTravelGuideForActivity(4);
    expect(latest?.guideId).toBe('guide-new');
  });
});
