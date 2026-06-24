import { describe, expect, it, vi } from 'vitest';
import { flushCanvas2dDraw } from '@/domains/performance-itinerary/utils/itineraryWallpaperCanvas';

describe('flushCanvas2dDraw', () => {
  it('uses canvas.requestAnimationFrame when available', async () => {
    const raf = vi.fn((cb: () => void) => {
      cb();
      return 1;
    });
    const canvas = { requestAnimationFrame: raf };

    await flushCanvas2dDraw(canvas as never);

    expect(raf).toHaveBeenCalledTimes(1);
  });

  it('falls back to setTimeout when raf is unavailable', async () => {
    vi.useFakeTimers();
    const promise = flushCanvas2dDraw({} as never);
    vi.advanceTimersByTime(32);
    await promise;
    vi.useRealTimers();
  });
});
