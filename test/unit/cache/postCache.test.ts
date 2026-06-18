import { beforeEach, describe, expect, it } from 'vitest';
import { removePostFromCaches } from '@/cache/postCache';
import { getCacheData, invalidateCache, setCacheData } from '@/hooks/useApiQuery';
import type { ProfilePostItem } from '@/types/backend';

const postA: ProfilePostItem = {
  id: 'post-a',
  title: 'A',
  content: 'hello',
  date: '2026-01-01',
};

const postB: ProfilePostItem = {
  id: 'post-b',
  title: 'B',
  content: 'world',
  date: '2026-01-02',
};

describe('postCache.removePostFromCaches', () => {
  beforeEach(() => {
    invalidateCache(['profile']);
  });

  it('removes post from profile posts cache', () => {
    setCacheData<ProfilePostItem[]>(['profile', 'posts'], () => [postA, postB]);

    removePostFromCaches('post-a');

    expect(getCacheData<ProfilePostItem[]>(['profile', 'posts'])).toEqual([postB]);
  });
});
