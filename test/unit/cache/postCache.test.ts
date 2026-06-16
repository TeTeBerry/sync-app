import { beforeEach, describe, expect, it, vi } from 'vitest';
import Taro from '@tarojs/taro';
import {
  getPopularPostsFromCache,
  removePostFromCaches,
  setPopularPostsCache,
} from '@/cache/postCache';
import { getCacheData, invalidateCache, setCacheData } from '@/hooks/useApiQuery';
import type { HomeFeedPost, HomeSummary } from '@/types/backend';

vi.mock('@tarojs/taro', () => ({
  default: {
    setStorageSync: vi.fn(),
  },
}));

vi.mock('@/constants/api', () => ({
  isLiveApi: () => true,
}));

const postA: HomeFeedPost = {
  id: 'post-a',
  name: 'A',
  handle: '@a',
  event: 'Fest',
  location: '上海',
  body: 'hello',
  time: '1分钟前',
  avatar: '',
};

const postB: HomeFeedPost = {
  id: 'post-b',
  name: 'B',
  handle: '@b',
  event: 'Fest',
  location: '北京',
  body: 'world',
  time: '2分钟前',
  avatar: '',
};

describe('postCache.removePostFromCaches', () => {
  beforeEach(() => {
    invalidateCache(['posts']);
    invalidateCache(['home']);
    invalidateCache(['profile']);
    vi.mocked(Taro.setStorageSync).mockClear();
  });

  it('removes post from popular feed and home summary caches', () => {
    setPopularPostsCache([postA, postB]);
    setCacheData<HomeSummary>(['home', 'summary'], () => ({
      heat: { people: 2, growthPercent: 0 },
      signupEvents: [],
      popularPosts: [postA, postB],
    }));

    removePostFromCaches('post-a');

    expect(getPopularPostsFromCache()).toEqual([postB]);
    expect(getCacheData<HomeSummary>(['home', 'summary'])?.popularPosts).toEqual([
      postB,
    ]);
    expect(Taro.setStorageSync).toHaveBeenCalled();
  });
});
