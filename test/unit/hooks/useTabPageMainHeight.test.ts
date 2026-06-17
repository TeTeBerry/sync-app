import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tarojs/taro', () => ({
  default: {
    getWindowInfo: () => ({
      windowHeight: 800,
      screenHeight: 800,
      safeArea: { bottom: 780 },
    }),
  },
}));

describe('computeTabPageMainHeightFallback', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('subtracts tab bar and extra chrome from window height', async () => {
    const { computeTabPageMainHeightFallback } =
      await import('@/hooks/tabPageMainHeight.util');
    const height = computeTabPageMainHeightFallback(100);
    expect(height).toBe(614);
  });
});
