import { beforeEach, describe, expect, it, vi } from 'vitest';
import Taro from '@tarojs/taro';
import {
  HOME_CACHE_MAX_AGE_MS,
  HOME_POPULAR_POSTS_PERSIST_LIMIT,
  hydrateAppCachesFromStorage,
  persistActivities,
  persistHomeSummary,
  persistPopularPosts,
} from '@/utils/homeCacheStorage';
import { getCacheData, invalidateCache } from '@/hooks/useApiQuery';
import type { BackendActivity, HomeFeedPost, HomeSummary } from '@/types/backend';

vi.mock('@tarojs/taro', () => ({
  default: {
    getStorageSync: vi.fn(),
    setStorageSync: vi.fn(),
  },
}));

vi.mock('@/constants/api', () => ({
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

const mockPosts: HomeFeedPost[] = Array.from({ length: 10 }, (_, index) => ({
  id: `post-${index}`,
  name: 'User',
  handle: '@user',
  event: 'Test Fest',
  location: 'SZ',
  body: `body ${index}`,
  time: '1h',
  avatar: '',
}));

describe('homeCacheStorage', () => {
  beforeEach(() => {
    vi.mocked(Taro.getStorageSync).mockReturnValue('');
    vi.mocked(Taro.setStorageSync).mockClear();
    invalidateCache(['home']);
    invalidateCache(['posts']);
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

  it('persists at most HOME_POPULAR_POSTS_PERSIST_LIMIT posts', () => {
    persistPopularPosts(mockPosts);
    const stored = vi.mocked(Taro.setStorageSync).mock.calls[0]?.[1] as string;
    const envelope = JSON.parse(stored) as { data: HomeFeedPost[] };
    expect(envelope.data).toHaveLength(HOME_POPULAR_POSTS_PERSIST_LIMIT);
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
