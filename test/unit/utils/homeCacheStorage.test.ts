import { beforeEach, describe, expect, it, vi } from 'vitest';
import Taro from '@tarojs/taro';
import {
  HOME_CACHE_MAX_AGE_MS,
  afterHomeSummaryCommitted,
  clearSessionCaches,
  hydrateAppCachesFromStorage,
  patchPersistedHomeSummaryGoingFlag,
  persistActivities,
  persistHomeSummary,
  persistProfileSummary,
} from '@/utils/homeCacheStorage';
import { getCacheData, invalidateCache } from '@/hooks/useApiQuery';
import type { BackendActivity, HomeSummary, ProfileSummary } from '@/types/backend';

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

const mockSummary: HomeSummary = {
  heat: { people: 10, growthPercent: 0 },
  signupEvents: [
    {
      id: 1,
      title: 'Test Fest',
      date: '06/01',
      location: 'SZ',
      image: '',
      category: 'edm',
      hot: false,
      attendees: 0,
      going: false,
    },
  ],
};

describe('homeCacheStorage', () => {
  const storage = new Map<string, string>();

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
    invalidateCache(['home']);
    invalidateCache(['activities']);
    invalidateCache(['profile']);
  });

  it('persists and hydrates home summary', () => {
    persistHomeSummary(mockSummary);
    expect(Taro.setStorageSync).toHaveBeenCalled();

    hydrateAppCachesFromStorage();
    expect(getCacheData<HomeSummary>(['home', 'summary'])).toEqual(mockSummary);
  });

  it('patchPersistedHomeSummaryGoingFlag updates stored signup event', () => {
    persistHomeSummary({
      ...mockSummary,
      signupEvents: [{ ...mockSummary.signupEvents[0], id: 8, going: true }],
    });
    invalidateCache(['home']);

    const patched = patchPersistedHomeSummaryGoingFlag(8, false);
    expect(patched).toBe(true);
    expect(getCacheData<HomeSummary>(['home', 'summary'])?.signupEvents[0]?.going).toBe(
      false,
    );
  });

  it('persists and hydrates activities list', () => {
    const activities: BackendActivity[] = [
      {
        _id: 'a1',
        legacyId: 1,
        code: '1',
        name: 'Fest',
      },
    ];
    persistActivities(activities);

    hydrateAppCachesFromStorage();
    expect(getCacheData<BackendActivity[]>(['activities'])).toEqual([
      { ...activities[0], image: '' },
    ]);
  });

  it('skips expired envelope on hydrate', () => {
    const expired = JSON.stringify({
      savedAt: Date.now() - HOME_CACHE_MAX_AGE_MS - 1,
      data: mockSummary,
    });
    vi.mocked(Taro.getStorageSync).mockReturnValue(expired);

    hydrateAppCachesFromStorage();
    expect(getCacheData<HomeSummary>(['home', 'summary'])).toBeUndefined();
  });

  it('afterHomeSummaryCommitted persists storage and seeds detail prefetch', () => {
    afterHomeSummaryCommitted(mockSummary);
    expect(Taro.setStorageSync).toHaveBeenCalled();
    expect(getCacheData<{ name: string }>(['activities', 'detail', 1])?.name).toBe(
      'Test Fest',
    );
  });

  it('clearSessionCaches wipes in-memory query cache and persisted storage keys', () => {
    persistHomeSummary(mockSummary);
    persistActivities([
      {
        _id: 'a1',
        legacyId: 1,
        code: '1',
        name: 'Fest',
      },
    ]);
    persistProfileSummary({
      userId: 'u1',
      name: 'Berry',
      postCount: 0,
      activityCount: 0,
    } satisfies ProfileSummary);
    hydrateAppCachesFromStorage();

    expect(getCacheData<HomeSummary>(['home', 'summary'])).toBeDefined();
    expect(getCacheData<BackendActivity[]>(['activities'])).toBeDefined();
    expect(getCacheData<ProfileSummary>(['profile', 'summary'])).toBeDefined();

    clearSessionCaches();

    expect(getCacheData<HomeSummary>(['home', 'summary'])).toBeUndefined();
    expect(getCacheData<BackendActivity[]>(['activities'])).toBeUndefined();
    expect(getCacheData<ProfileSummary>(['profile', 'summary'])).toBeUndefined();
    expect(Taro.removeStorageSync).toHaveBeenCalledWith('sync:home:summary:v2');
    expect(Taro.removeStorageSync).toHaveBeenCalledWith('sync:activities:list:v1');
    expect(Taro.removeStorageSync).toHaveBeenCalledWith('sync:profile:summary:v1');
  });
});
