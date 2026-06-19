import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fetchPersonalityTestMediaUrls = vi.fn();

vi.mock('@/api/sync/personalityTest', () => ({
  fetchPersonalityTestMediaUrls: (...args: unknown[]) =>
    fetchPersonalityTestMediaUrls(...args),
}));

vi.mock('@/constants/api', () => ({
  isLiveApi: () => true,
}));

import {
  clearPersonalityMediaUrlCacheForTests,
  resolvePersonalityMediaUrls,
} from '@/domains/personality-test/utils/resolvePersonalityMedia';

describe('resolvePersonalityMedia batching', () => {
  beforeEach(() => {
    clearPersonalityMediaUrlCacheForTests();
    fetchPersonalityTestMediaUrls.mockReset();
  });

  afterEach(() => {
    clearPersonalityMediaUrlCacheForTests();
  });

  it('fetches all concurrent avatar keys in one or more drained batches', async () => {
    fetchPersonalityTestMediaUrls.mockImplementation(async (keys: string[]) => ({
      urls: Object.fromEntries(keys.map((key) => [key, `https://cdn.example/${key}`])),
    }));

    const keys = [
      'avatar/cat-pink-headphones.png',
      'avatar/fox-rainbow-headphones.png',
      'avatar/bunny-teal-headphones.png',
    ];

    const results = await Promise.all([
      resolvePersonalityMediaUrls([keys[0]]),
      resolvePersonalityMediaUrls([keys[1]]),
      resolvePersonalityMediaUrls([keys[2]]),
    ]);

    expect(results[0][0]).toBe(`https://cdn.example/${keys[0]}`);
    expect(results[1][0]).toBe(`https://cdn.example/${keys[1]}`);
    expect(results[2][0]).toBe(`https://cdn.example/${keys[2]}`);
    expect(fetchPersonalityTestMediaUrls.mock.calls.length).toBeLessThanOrEqual(2);
    const fetchedKeys = fetchPersonalityTestMediaUrls.mock.calls.flatMap(
      (call) => call[0] as string[],
    );
    expect(fetchedKeys).toEqual(expect.arrayContaining(keys));
  });
});
