import { beforeEach, describe, expect, it, vi } from 'vitest';
import Taro from '@tarojs/taro';
import {
  HOME_CACHE_MAX_AGE_MS,
  hydrateAppCachesFromStorage,
  persistActivities,
  persistHomeSummary,
} from '@/utils/homeCacheStorage';
import { getCacheData, invalidateCache } from '@/hooks/useApiQuery';
import type { BackendActivity, HomeSummary } from '@/types/backend';

vi.mock('@tarojs/taro', () => ({
  default: {
    getStorageSync: vi.fn(),
    setStorageSync: vi.fn(),
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
  beforeEach(() => {
    vi.mocked(Taro.getStorageSync).mockReturnValue('');
    vi.mocked(Taro.setStorageSync).mockClear();
    invalidateCache(['home']);
  });

  it('persists and hydrates home summary', () => {
    persistHomeSummary(mockSummary);
    expect(Taro.setStorageSync).toHaveBeenCalled();

    const stored = vi.mocked(Taro.setStorageSync).mock.calls[0]?.[1] as string;
    vi.mocked(Taro.getStorageSync).mockImplementation((key: string) => {
      if (key === 'sync:home:summary:v2') return stored;
      return '';
    });

    hydrateAppCachesFromStorage();
    expect(getCacheData<HomeSummary>(['home', 'summary'])).toEqual(mockSummary);
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
    const stored = vi.mocked(Taro.setStorageSync).mock.calls.at(-1)?.[1] as string;
    vi.mocked(Taro.getStorageSync).mockImplementation((key: string) => {
      if (key === 'sync:activities:list:v1') return stored;
      return '';
    });

    hydrateAppCachesFromStorage();
    expect(getCacheData<BackendActivity[]>(['activities'])).toEqual(activities);
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
});
