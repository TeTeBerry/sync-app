import { beforeEach, describe, expect, it, vi } from 'vitest';
import Taro from '@tarojs/taro';
import { measureScrollTopToReveal } from '@/utils/scrollToCenter';

vi.mock('@tarojs/taro', () => ({
  default: {
    createSelectorQuery: vi.fn(),
  },
}));

describe('measureScrollTopToReveal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns current scrollTop when target already fits above bottom inset', async () => {
    vi.mocked(Taro.createSelectorQuery).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      fields: vi.fn().mockReturnThis(),
      boundingClientRect: vi.fn().mockReturnThis(),
      exec: vi.fn((callback) => {
        callback([
          { scrollTop: 120, height: 600, top: 100 },
          { top: 500, height: 40 },
        ]);
      }),
    } as never);

    await expect(measureScrollTopToReveal('#scroll', '#target', 80)).resolves.toBe(120);
  });

  it('increases scrollTop when target sits below the visible bottom inset', async () => {
    vi.mocked(Taro.createSelectorQuery).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      fields: vi.fn().mockReturnThis(),
      boundingClientRect: vi.fn().mockReturnThis(),
      exec: vi.fn((callback) => {
        callback([
          { scrollTop: 200, height: 600, top: 100 },
          { top: 620, height: 44 },
        ]);
      }),
    } as never);

    await expect(measureScrollTopToReveal('#scroll', '#target', 300)).resolves.toBe(
      480,
    );
  });
});
