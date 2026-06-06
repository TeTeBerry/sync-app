import { describe, expect, it } from 'vitest';
import {
  clampSwipeOffset,
  detectSwipeLock,
  resolveSwipeOffset,
} from './swipeDeleteMath';

describe('swipeDeleteMath', () => {
  it('detects horizontal swipe lock', () => {
    expect(detectSwipeLock(12, 2)).toBe('h');
    expect(detectSwipeLock(2, 12)).toBe('v');
    expect(detectSwipeLock(2, 2)).toBeNull();
  });

  it('clamps swipe offset within action width', () => {
    expect(clampSwipeOffset(80, 0, -120)).toBe(-80);
    expect(clampSwipeOffset(80, -40, 60)).toBe(0);
    expect(clampSwipeOffset(80, 0, -30)).toBe(-30);
  });

  it('snaps open when past half width', () => {
    expect(resolveSwipeOffset(-41, 80)).toEqual({ open: true, offset: -80 });
    expect(resolveSwipeOffset(-39, 80)).toEqual({ open: false, offset: 0 });
  });
});
