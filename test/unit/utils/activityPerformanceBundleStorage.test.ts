import { beforeEach, describe, expect, it, vi } from 'vitest';
import Taro from '@tarojs/taro';
import {
  PERFORMANCE_BUNDLE_MAX_AGE_MS,
  PERFORMANCE_BUNDLE_MAX_ACTIVITIES,
  clearActivityPerformanceBundle,
  commitActivityPerformanceBundle,
  hydrateActivityPerformanceBundlesFromStorage,
  loadActivityPerformanceBundle,
} from '@/utils/activityPerformanceBundleStorage';
import { getCacheData, invalidateCache } from '@/hooks/useApiQuery';
import type {
  BackendActivity,
  ItineraryScheduleSnapshot,
  SavedItineraryResult,
} from '@/types/backend';

vi.mock('@tarojs/taro', () => ({
  default: {
    getStorageSync: vi.fn(),
    setStorageSync: vi.fn(),
    removeStorageSync: vi.fn(),
  },
}));

vi.mock('@/constants/api', () => ({
  API_BASE_URL: 'https://api.test',
  isLiveApi: () => true,
}));

const storage = new Map<string, string>();

function bundleKey(legacyId: number): string {
  return `sync:performance-bundle:${legacyId}:v1`;
}

const mockActivity = (legacyId: number): BackendActivity => ({
  _id: String(legacyId),
  legacyId,
  code: String(legacyId),
  name: `Fest ${legacyId}`,
  date: '12/11-13',
});

const mockSchedule = (): ItineraryScheduleSnapshot => ({
  schedulePublished: true,
  djs: [{ id: 'dj-1', name: 'Artist', popularity: 10, genres: [], stage: 'Main' }],
  performances: [],
  sessions: [],
  eventMeta: 'Fest',
  conflicts: [],
});

const mockSaved = (): SavedItineraryResult => ({
  saved: true,
  days: [{ id: 'day-1', bannerDateLabel: 'Day 1', items: [] }],
  selectedDjIds: ['dj-1'],
  eventMeta: 'Fest',
});

describe('activityPerformanceBundleStorage', () => {
  beforeEach(() => {
    storage.clear();
    vi.mocked(Taro.getStorageSync).mockImplementation(
      (key: string) => storage.get(key) ?? '',
    );
    vi.mocked(Taro.setStorageSync).mockImplementation((key: string, value: string) => {
      storage.set(key, value);
    });
    vi.mocked(Taro.removeStorageSync).mockImplementation((key: string) => {
      storage.delete(key);
    });
    invalidateCache(['activities']);
    invalidateCache(['itinerary']);
  });

  it('persists and loads a performance bundle', () => {
    commitActivityPerformanceBundle({
      activityLegacyId: 1,
      activity: mockActivity(1),
      schedule: mockSchedule(),
      savedItinerary: mockSaved(),
    });

    const loaded = loadActivityPerformanceBundle(1);
    expect(loaded?.bundle.activity?.name).toBe('Fest 1');
    expect(loaded?.bundle.schedule?.schedulePublished).toBe(true);
    expect(loaded?.bundle.savedItinerary?.saved).toBe(true);
    expect(loaded?.savedAt).toBeTypeOf('number');
  });

  it('merges partial commits', () => {
    commitActivityPerformanceBundle({
      activityLegacyId: 2,
      activity: mockActivity(2),
    });
    commitActivityPerformanceBundle({
      activityLegacyId: 2,
      schedule: mockSchedule(),
    });

    const loaded = loadActivityPerformanceBundle(2);
    expect(loaded?.bundle.activity?.legacyId).toBe(2);
    expect(loaded?.bundle.schedule?.djs).toHaveLength(1);
  });

  it('expires bundles past TTL', () => {
    commitActivityPerformanceBundle({
      activityLegacyId: 3,
      activity: mockActivity(3),
    });

    const raw = storage.get(bundleKey(3));
    expect(raw).toBeTruthy();
    const envelope = JSON.parse(raw!) as { savedAt: number; data: unknown };
    envelope.savedAt = Date.now() - PERFORMANCE_BUNDLE_MAX_AGE_MS - 1;
    storage.set(bundleKey(3), JSON.stringify(envelope));

    expect(loadActivityPerformanceBundle(3)).toBeUndefined();
    expect(storage.has(bundleKey(3))).toBe(false);
  });

  it('evicts oldest bundle when exceeding LRU limit', () => {
    for (
      let legacyId = 1;
      legacyId <= PERFORMANCE_BUNDLE_MAX_ACTIVITIES + 1;
      legacyId += 1
    ) {
      commitActivityPerformanceBundle({
        activityLegacyId: legacyId,
        activity: mockActivity(legacyId),
      });
    }

    expect(loadActivityPerformanceBundle(1)).toBeUndefined();
    expect(
      loadActivityPerformanceBundle(PERFORMANCE_BUNDLE_MAX_ACTIVITIES + 1),
    ).toBeDefined();
  });

  it('hydrates query caches from storage', () => {
    commitActivityPerformanceBundle({
      activityLegacyId: 4,
      activity: mockActivity(4),
      schedule: mockSchedule(),
      savedItinerary: mockSaved(),
    });

    invalidateCache(['activities']);
    invalidateCache(['itinerary']);

    hydrateActivityPerformanceBundlesFromStorage();

    expect(
      getCacheData<BackendActivity | null>(['activities', 'detail', 4])?.name,
    ).toBe('Fest 4');
    expect(
      getCacheData<ItineraryScheduleSnapshot>([
        'itinerary',
        'schedule',
        4,
        undefined,
        '',
      ])?.schedulePublished,
    ).toBe(true);
    expect(getCacheData<SavedItineraryResult>(['itinerary', 'saved', 4])?.saved).toBe(
      true,
    );
  });

  it('clears a single activity bundle', () => {
    commitActivityPerformanceBundle({
      activityLegacyId: 5,
      activity: mockActivity(5),
    });
    clearActivityPerformanceBundle(5);
    expect(loadActivityPerformanceBundle(5)).toBeUndefined();
  });
});
