export const SWIPE_LOCK_THRESHOLD_PX = 8;

export function resolveSwipeOffset(
  offset: number,
  actionWidth: number,
): { open: boolean; offset: number } {
  const shouldOpen = offset <= -actionWidth / 2;
  return {
    open: shouldOpen,
    offset: shouldOpen ? -actionWidth : 0,
  };
}

export function clampSwipeOffset(
  actionWidth: number,
  startOffset: number,
  dx: number,
): number {
  return Math.min(0, Math.max(-actionWidth, startOffset + dx));
}

export function detectSwipeLock(
  dx: number,
  dy: number,
  threshold = SWIPE_LOCK_THRESHOLD_PX,
): 'h' | 'v' | null {
  if (Math.abs(dx) <= threshold && Math.abs(dy) <= threshold) {
    return null;
  }
  return Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
}
