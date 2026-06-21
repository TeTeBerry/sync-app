import { beforeEach, describe, expect, it, vi } from 'vitest';
import Taro from '@tarojs/taro';
import {
  consumeEventsSearchQuery,
  setEventsSearchQuery,
} from '@/utils/eventsSearchIntent';

vi.mock('@tarojs/taro', () => ({
  default: {
    setStorageSync: vi.fn(),
    getStorageSync: vi.fn(),
    removeStorageSync: vi.fn(),
  },
}));

describe('eventsSearchIntent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores trimmed query', () => {
    setEventsSearchQuery('  EDC  ');
    expect(Taro.setStorageSync).toHaveBeenCalledWith(
      'sync:events:search-query-intent',
      'EDC',
    );
  });

  it('consumes query once then returns null', () => {
    vi.mocked(Taro.getStorageSync)
      .mockReturnValueOnce('tomorrowland')
      .mockReturnValue('');
    expect(consumeEventsSearchQuery()).toBe('tomorrowland');
    expect(Taro.removeStorageSync).toHaveBeenCalled();
    expect(consumeEventsSearchQuery()).toBeNull();
  });

  it('returns null for empty stored value', () => {
    vi.mocked(Taro.getStorageSync).mockReturnValue('   ');
    expect(consumeEventsSearchQuery()).toBeNull();
  });
});
