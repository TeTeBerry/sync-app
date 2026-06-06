import { beforeEach, describe, expect, it, vi } from 'vitest';
import Taro from '@tarojs/taro';
import { consumeEventsViewTabIntent, setEventsViewTabIntent } from './eventsTabIntent';

vi.mock('@tarojs/taro', () => ({
  default: {
    setStorageSync: vi.fn(),
    getStorageSync: vi.fn(),
    removeStorageSync: vi.fn(),
  },
}));

describe('eventsTabIntent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores and consumes list intent once', () => {
    vi.mocked(Taro.getStorageSync).mockReturnValueOnce('list').mockReturnValue('');
    setEventsViewTabIntent('list');
    expect(consumeEventsViewTabIntent()).toBe('list');
    expect(Taro.removeStorageSync).toHaveBeenCalled();
    expect(consumeEventsViewTabIntent()).toBeNull();
  });
});
